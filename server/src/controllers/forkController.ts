import mongoose from "mongoose";
import { Content } from "../models/content.js";
import Share from "../models/share.js";
import Tag from "../models/tag.js";
import type { Request, Response } from "express";

export const forkContent = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        const { shareToken } = req.params;
        const forkingUserId = req.userId; // String (Clerk ID)

        // 1. Validate the Share Link
        const shareEntry = await Share.findOne({ shareToken: shareToken as any })
            .populate({
                path: "contentId",
                populate: { path: "tags" } // Deep populate to get tag titles
            })
            .session(session);

        if (!shareEntry || !shareEntry.contentId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Link is invalid or expired." });
        }

        if (!shareEntry.canFork) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: "This content is not available for forking." });
        }

        const originalContent = shareEntry.contentId as any;

        // Check if user owns content (String comparison)
        if (originalContent.userId.toString() === forkingUserId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: "You already own this content." });
        }

        // preventing re-forking the same content
        const existingFork = await Content.findOne({
            sourceContentId: originalContent._id as any,
            userId: forkingUserId as any // String
        }).session(session);

        if (existingFork) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({
                message: "You have already forked this content.",
                contentId: existingFork._id
            });
        }

        // 2. Process Tags for the Forking User
        const originalTags = originalContent.tags || [];
        const newTagIds: any[] = [];

        for (const tagObj of originalTags) {
            const tagName = (tagObj as any).title;
            if (!tagName) continue;

            // Find forking user's generic tag 
            let userTag: any = await Tag.findOne({
                userId: forkingUserId as any, // String
                title: tagName
            }).session(session);

            if (!userTag) {
                // Create new tag for this user
                const createdTags = await Tag.create([{
                    title: tagName,
                    userId: forkingUserId as any // String
                }], { session });
                
                if (createdTags && createdTags.length > 0) {
                     userTag = createdTags[0];
                }
            }
            if (userTag) {
                newTagIds.push(userTag._id);
            }
        }

        // 3. Prepare Data
        const newContentData = {
            title: originalContent.title,
            link: originalContent.link,
            links: originalContent.links, // Copy all links/media
            type: originalContent.type,
            tags: newTagIds, // Use the new user's specific tag IDs
            description: originalContent.description,
            userId: forkingUserId, // String
            isFork: true,
            sourceContentId: originalContent._id,
            originalAuthorId: originalContent.userId // This is likely an ObjectId OR String depending on migration. It refers to the original author.
                                                     // Ideally this stays as the ID of the user. If we changed userId to String everywhere, this might be a String too.
        };

        // 3. EXECUTE SEQUENTIALLY
        const [newFork] = await Content.create([newContentData] as any, { session });

        // Step B: Update the Original
        await Content.findByIdAndUpdate(
            originalContent._id,
            { $inc: { forkCount: 1 } },
            { session }
        );

        // 4. Commit and End
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: "Content successfully forked to your Brain!",
            content: newFork
        });

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        session.endSession();

        console.error("Forking Error:", error);
        res.status(500).json({ message: "Internal Server Error during forking." });
    }
};