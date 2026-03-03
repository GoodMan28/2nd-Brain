import mongoose, { Types } from "mongoose";
import type { Request, Response } from "express";
import fs from "fs"
import { Content } from "../models/content.js";
import imagekit from "../configs/imageKit.js";
import { getContentTypeFromLink } from "../utils/linkUtil.js";
import Share from "../models/share.js";


type contentInfoType = {
    link?: string;
    title: string;
    description?: string;                 // Optional string
    tags?: Types.ObjectId[];              // Array of ObjectIds
};

export const addContent = async (req: Request, res: Response) => {
    try {
        let userId = req.userId;

        if (!userId) {
            return res.status(401).json({
                success: false,
                msg: "Unauthorized: User ID missing"
            });
        }

        let mediaFiles = req.files as Express.Multer.File[] | undefined;
        let content: contentInfoType & { links?: string[] } = JSON.parse(req.body.contentData);
        let finalLinks: string[] = [];

        // 1. Process Manual Links
        if (content.links && Array.isArray(content.links)) {
            finalLinks.push(...content.links);
        } else if (content.link) {
            finalLinks.push(content.link);
        }

        // 2. Process Uploaded Files
        if (mediaFiles && mediaFiles.length > 0) {
            try {
                // Upload all files in parallel
                const uploadPromises = mediaFiles.map(async (file) => {
                    let mediaBuffer = fs.readFileSync(file.path);
                    let response = await imagekit.upload({
                        file: mediaBuffer as any,
                        fileName: file.originalname,
                        folder: "/media"
                    });
                    // Cleanup locally
                    fs.unlinkSync(file.path);

                    return imagekit.url({
                        path: response.filePath as string,
                    });
                });

                const uploadedUrls = await Promise.all(uploadPromises);
                finalLinks.push(...uploadedUrls);

            } catch (err: any) {
                // Try cleanup if error
                if (mediaFiles) {
                    mediaFiles.forEach(f => {
                        if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
                    });
                }
                return res.status(402).json({
                    "success": false,
                    "msg": "Error uploading media: " + err.message
                });
            }
        }

        // 3. Validation
        if (finalLinks.length === 0) {
            return res.status(402).json({
                "success": false,
                "msg": "Provide at least one link or media file"
            });
        }

        // 4. Create Content
        try {
            // Determine type from the first link (primary)
            let primaryLink = finalLinks[0] || ""; // Default to empty string if undefined (though validation prevents this)
            let contentType = primaryLink ? await getContentTypeFromLink(primaryLink) : 'article';

            await Content.create({
                ...content,
                link: primaryLink, // Primary link for backward compatibility/preview
                links: finalLinks, // All links
                userId: userId,
                type: contentType
            });

            return res.json({
                "success": true,
                "msg": "Content added"
            });
        } catch (err: any) {
            return res.status(402).json({
                "success": false,
                "msg": err.message,
                "area": "db_creation"
            });
        }

    } catch (err) {
        return res.status(500).json({
            "success": false,
            "msg": "Internal server error"
        });
    }
}


// ---------------------------------------------------------------------------------------------------------------------------------

export const getContent = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { tags, type } = req.body; // Extract filters from body

        // 1. Base Query: Always restrict to the current user (String match)
        let query: any = { 
            userId: userId 
        };

        // 2. Filter by TYPE (if provided)
        // Logic: "Show me content where type is Video OR Article" ($in)
        if (type && Array.isArray(type) && type.length > 0) {
            query.type = { $in: type };
        }

        // 3. Filter by TAGS (if provided)
        // Logic: "Show me content that has AT LEAST ONE of these tags" ($in)
        if (tags && Array.isArray(tags) && tags.length > 0) {
            // Convert string IDs to ObjectIds
            const tagObjectIds = tags.map((tag: string) => new mongoose.Types.ObjectId(tag));
            query.tags = { $all: tagObjectIds };
        }

        // 4. Execute Query
        // .populate("tags") ensures you get the Tag names/colors, not just the ID strings
        // .sort({ createdAt: -1 }) shows newest items first
        const contents = await Content.find(query)
            .populate("tags") 
            .sort({ createdAt: -1 }); 

        return res.json({
            success: true,
            msg: "Content fetched successfully",
            count: contents.length,
            content: contents
        });

    } catch (err: any) {
        return res.status(500).json({
            success: false,
            msg: "Error fetching content",
            error: err.message
        });
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------

export const deleteContent = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { contentId } = req.body;

        if (!contentId) {
            return res.status(400).json({
                success: false,
                msg: "Content ID is required in the body"
            });
        }

        // 1. Delete the Content
        const deletedContent = await Content.findOneAndDelete({
            _id: contentId as any,
            userId: userId as any // String match
        });

        if (!deletedContent) {
            return res.status(404).json({
                success: false,
                msg: "Content not found or you are not authorized to delete it"
            });
        }

        // 2. Clean up the Share Link (The only side effect we want)
        // We do NOT touch the forks, but we must remove the generated link 
        // so people don't click it and get a 404.
        await Share.deleteMany({ 
            contentId: contentId as any 
        });

        // 3. Success Response
        return res.json({
            success: true,
            msg: "Content and associated share links deleted successfully"
        });

    } catch (err: any) {
        return res.status(500).json({
            success: false,
            msg: "Error deleting content",
            error: err.message
        });
    }
};

// ---------------------------------------------------------------------------------------------------------------------------------

export const editContent = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { contentId, title, description, tags, type } = req.body; // link is handled via links array now

        // 1. Validation
        if (!contentId) {
            return res.status(400).json({
                success: false,
                msg: "Content ID is required"
            });
        }

        // 2. Build the Update Object dynamically
        let updateData: any = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;

        // Process Tags
        if (tags) {
             let parsedTags = tags;
             if (typeof tags === 'string') {
                 try { parsedTags = JSON.parse(tags); } catch(e) { parsedTags = [tags]; }
             }
             if (!Array.isArray(parsedTags)) parsedTags = [parsedTags];
             updateData.tags = parsedTags.map((tag: string) => new mongoose.Types.ObjectId(tag));
        }

        // Handle Links & Media
        let mediaFiles = req.files as any[] | undefined;
        let linksFromJson: string[] = [];
        
        // Parse links from body
        if (req.body.links) { 
             try {
                linksFromJson = JSON.parse(req.body.links);
             } catch(e) {
                if (Array.isArray(req.body.links)) linksFromJson = req.body.links;
                else if (typeof req.body.links === 'string') linksFromJson = [req.body.links];
             }
        } else if (req.body.link) {
            // Backward compatibility for single link input
            linksFromJson.push(req.body.link);
        }
        
        let finalLinks: string[] = [...linksFromJson];

        // Process Uploaded Files
        if (mediaFiles && mediaFiles.length > 0) {
            try {
                const uploadPromises = mediaFiles.map(async (file) => {
                    let mediaBuffer = fs.readFileSync(file.path);
                    let response = await imagekit.upload({
                        file: mediaBuffer as any,
                        fileName: file.originalname,
                        folder: "/media"
                    });
                    fs.unlinkSync(file.path);
                    return imagekit.url({ path: response.filePath as string });
                });
                const uploadedUrls = await Promise.all(uploadPromises);
                finalLinks.push(...uploadedUrls);
            } catch (err: any) {
                 if (mediaFiles) mediaFiles.forEach(f => { if (fs.existsSync(f.path)) fs.unlinkSync(f.path); });
                 return res.status(402).json({ success: false, msg: "Error uploading media: " + err.message });
            }
        }

        // Always update links if we have any, OR if exact "links" field was sent as empty array (checking keys)
        // Since we aggregated from body.links and files, if finalLinks has items, we update.
        // If the user deleted all links, req.body.links would be "[]", so linksFromJson is [], mediaFiles is undef. finalLinks is [].
        // So if req.body.links was provided, we should update even if empty.
        
        if (finalLinks.length > 0 || req.body.links) {
            updateData.links = finalLinks;
            
            // Update primary link and type
            if (finalLinks.length > 0) {
                updateData.link = finalLinks[0];
                // Only update type if it wasn't manually provided
                if (!type) {
                     updateData.type = await getContentTypeFromLink(finalLinks[0]!);
                } else {
                     updateData.type = type;
                }
            } else {
                // If all links removed
                updateData.link = "";
                if (!type) updateData.type = 'article'; // Default fallback
            }
        } else if (type) {
            updateData.type = type;
        }

        // 3. Find and Update
        const updatedContent = await Content.findOneAndUpdate(
            { _id: contentId as any, userId: userId as any },
            { $set: updateData },
            { new: true }
        ).populate("tags");

        if (!updatedContent) {
            return res.status(404).json({
                success: false,
                msg: "Content not found or unauthorized"
            });
        }

        return res.json({
            success: true,
            msg: "Content updated successfully",
            content: updatedContent
        });

    } catch (err: any) {
        return res.status(500).json({
            success: false,
            msg: "Error updating content",
            error: err.message
        });
    }
};

export const fetchAllContents = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                msg: "Unauthorized: User ID missing"
            });
        }

        const contents = await Content.find({ 
            userId: userId // String match
        })
        .populate("tags")
        .sort({ createdAt: -1 });

        return res.json({
            success: true,
            msg: "All content fetched successfully",
            count: contents.length,
            content: contents
        });

    } catch (err: any) {
        return res.status(500).json({
            success: false,
            msg: "Error fetching all content",
            error: err.message
        });
    }
};