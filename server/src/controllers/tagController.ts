import type { Request, Response } from "express"
import User from "../models/user.js"
import z from "zod"
import Tag from "../models/tag.js"
import { Content } from "../models/content.js"
import mongoose from "mongoose";

let tagSchema = z.object({
    title: z.string().min(1).max(30).trim().toLowerCase()
})
type tagType = z.infer<typeof tagSchema>

// Helper for deterministic color generation
const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + "00000".substring(0, 6 - c.length) + c;
}

export const addTag = async (req: Request, res: Response) => {
    let userId = req.userId!

    // We don't need to check if user exists in our DB strictly if we trust Clerk, 
    // but we might want to ensure a profile exists if we store profiles. 
    // For now, removing the strict User check or updating it to findOne({ clerkId: userId })
    // if we want to enforce profile existence.
    // Let's assume valid session = valid user for now to simplify.
    
    let parsedResult = tagSchema.safeParse(req.body);
    if(!parsedResult.success) {
        return res.status(400).json({ "success": false, "msg": parsedResult.error.flatten().fieldErrors })
    }

    let {title}: tagType = parsedResult.data;
    try {
        // userId is String
        let existingTag = await Tag.findOne({ title, userId: userId });
        if (existingTag) {
             return res.json({ "success": true, "msg": "Tag retrieved", "tag": existingTag })
        }
        await Tag.create({ title, userId: userId })
        // fetching again to be safe with types if needed, or just return what we created
        const newTag = await Tag.findOne({ title, userId: userId });
        return res.json({ "success": true, "msg": "tag created successfully", "tag": newTag })
    }
    catch(err: any) {
        return res.status(500).json({ "success": false, "msg": err.message })
    }
}

export const getTags = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ success: false, msg: "Unauthorized" });
        
        // userId is String
        const tags = await Tag.find({ userId: userId });
        return res.json({ success: true, tags });
    } catch (err: any) {
        return res.status(500).json({ success: false, msg: err.message });
    }
};

export const deleteTag = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { tagId } = req.body; // Can be body or query, usually body for POST/DELETE
        
        if (!userId || !tagId) return res.status(400).json({ success: false, msg: "Missing tagId" });

        // Check validation: Is tag in use?
        // userId is String
        const usageCount = await Content.countDocuments({ tags: tagId, userId: userId });
        if (usageCount > 0) {
            return res.status(409).json({ 
                success: false, 
                msg: "Tag is currently in use", 
                count: usageCount 
            });
        }

        await Tag.findByIdAndDelete(tagId);
        return res.json({ success: true, msg: "Tag deleted successfully" });

    } catch (err: any) {
        return res.status(500).json({ success: false, msg: err.message });
    }
};

export const deleteTags = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { tagIds } = req.body; // Expecting array of strings

        if (!userId || !tagIds || !Array.isArray(tagIds) || tagIds.length === 0) {
            return res.status(400).json({ success: false, msg: "Missing or invalid tagIds" });
        }

        // Check validation: Is ANY tag in use?
        // userId is String
        const usageCount = await Content.countDocuments({ tags: { $in: tagIds }, userId: userId });
        
        if (usageCount > 0) {
             // We block the whole batch if any are in use, per requirement
            return res.status(409).json({ 
                success: false, 
                msg: "One or more selected tags are currently in use", 
                count: usageCount // Total usage count across all selected tags
            });
        }

        await Tag.deleteMany({ _id: { $in: tagIds }, userId: userId });
        return res.json({ success: true, msg: "Tags deleted successfully" });

    } catch (err: any) {
        return res.status(500).json({ success: false, msg: err.message });
    }
};

export const mergeTags = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { sourceTagId, targetTagId } = req.body;

        if (!userId || !sourceTagId || !targetTagId) {
            return res.status(400).json({ success: false, msg: "Missing parameters" });
        }
        if (sourceTagId === targetTagId) {
             return res.status(400).json({ success: false, msg: "Source and Target cannot be the same" });
        }

        // Verify ownership (userId is String)
        const sourceTag = await Tag.findOne({ _id: sourceTagId, userId: userId });
        const targetTag = await Tag.findOne({ _id: targetTagId, userId: userId });

        if (!sourceTag || !targetTag) {
            return res.status(404).json({ success: false, msg: "Tags not found or unauthorized" });
        }

        // Update Content: Add Target Tag where Source exists
        await Content.updateMany(
            { tags: sourceTagId, userId: userId },
            { $addToSet: { tags: targetTagId } }
        );

        // Update Content: Remove Source Tag
        await Content.updateMany(
            { tags: sourceTagId, userId: userId },
            { $pull: { tags: sourceTagId } }
        );

        // Delete Source Tag
        await Tag.findByIdAndDelete(sourceTagId);

        return res.json({ success: true, msg: "Tags merged successfully" });

    } catch (err: any) {
        return res.status(500).json({ success: false, msg: err.message });
    }
};

export const getTagAnalytics = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ success: false, msg: "Unauthorized" });

        // Fetch all content with tags fully populated
        // We need 'title' and '_id' of tags.
        // 0. Fetch ALL tags for the user first (userId is String)
        const allTags = await Tag.find({ userId: userId });
        
        const nodeMap = new Map<string, { _id: string, title: string, usageCount: number, color: string }>();
        const linkMap = new Map<string, { source: string, target: string, value: number }>();

        // Initialize nodeMap with ALL tags (usageCount: 0)
        allTags.forEach(tag => {
            const tagId = tag._id.toString();
             nodeMap.set(tagId, {
                _id: tagId,
                title: tag.title,
                usageCount: 0,
                color: stringToColor(tag.title)
            });
        });

        // Fetch content to update usage counts and build links
        const contents = await Content.find({ userId: userId })
            .select('tags')
            .populate('tags', '_id') // We only need IDs now since we have titles from Step 0
            .lean();

        contents.forEach((content: any) => {
            const tags = content.tags as any[]; 
            if (!tags || tags.length === 0) return;

            // 1. Update Counts
            tags.forEach((tag) => {
                const tagId = tag._id.toString();
                // If tag exists (it should), increment count
                if (nodeMap.has(tagId)) {
                    nodeMap.get(tagId)!.usageCount += 1;
                }
            });

            // 2. Process Links (Co-occurrence)
            const sortedIds = tags.map(t => t._id.toString()).sort();
            
            for (let i = 0; i < sortedIds.length; i++) {
                for (let j = i + 1; j < sortedIds.length; j++) {
                    const source = sortedIds[i];
                    const target = sortedIds[j];
                    const linkKey = `${source}_${target}`;

                    if (!linkMap.has(linkKey)) {
                        linkMap.set(linkKey, { source, target, value: 0 });
                    }
                    linkMap.get(linkKey)!.value += 1;
                }
            }
        });

        const nodes = Array.from(nodeMap.values());
        const links = Array.from(linkMap.values());

        return res.json({ 
            success: true, 
            nodes, 
            links 
        });

    } catch (err: any) {
        return res.status(500).json({ success: false, msg: err.message });
    }
};