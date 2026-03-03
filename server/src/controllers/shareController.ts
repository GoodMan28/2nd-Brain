import crypto from "crypto";
import Share from "../models/share.js";
import { Content } from "../models/content.js";
import type { Request, Response } from "express";

export const shareContent = async (req: Request, res: Response) => {
  try {
    const { contentId } = req.body;
    const userId = req.userId; // String

    // Ensure we only share content owned by user (String match)
    const content = await Content.findOne({
      _id: contentId as any,
      userId: userId as any, 
    });
    if (!content)
      return res
        .status(404)
        .json({ message: "Content not found or unauthorized" });

    let existingShare = await Share.findOne({ contentId });
    if (existingShare) {
      return res
        .status(200)
        .json({ link: `/share/${existingShare.shareToken}` });
    }

    // 3. Create new Share Token
    const token = crypto.randomBytes(10).toString("hex");
    const newShare = await Share.create({
      shareToken: token,
      contentId: contentId,
    });

    res.status(201).json({ link: `/share/${newShare.shareToken}` });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const revokeShare = async (req: Request, res: Response) => {
  try {
    const { contentId } = req.body;
    const userId = req.userId;

    // Verify ownership
    const content = await Content.findOne({
        _id: contentId as any,
        userId: userId as any
    });

    if (!content) {
        return res.status(403).json({ message: "Unauthorized or content not found" });
    }

    const result = await Share.findOneAndDelete({ contentId });
    
    if (result) {
        return res.json({ success: true, message: "Link revoked successfully" });
    } else {
        return res.status(404).json({ message: "No active link found to revoke" });
    }

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSharedContent = async (req: Request, res: Response) => {
  try {
    const { shareToken } = req.params;

    // 1. Find the link in the DB
    const shareEntry = await Share.findOne({
      shareToken: shareToken as any,
    }).populate({
      path: "contentId",
      populate: { path: "tags" } // Deep populate to get tag titles for display
    });

    if (!shareEntry) {
      return res.status(404).json({ message: "Link is invalid or expired" });
    }

    // 2. Return the content to whoever asked (the browser/frontend)
    res.status(200).json({
      content: shareEntry.contentId,
      canFork: shareEntry.canFork,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};