import User from "../models/user.js";
import type { Request, Response } from "express";
import "dotenv/config";

// No more register/login - handled by Clerk

// User details ---------------------------------------------------------------------------------------------------------------

export const getMe = async (req: Request, res: Response) => {
    try {
        let userId = req.userId!; // we get this from the middleware (Clerk ID)
        
        // Find user by clerkId (which is stored in userId field in our middleware convention? 
        // No, middleware sets req.userId = Clerk ID.
        // In our model, we store this as `clerkId` or `_id`? 
        // Wait, the plan said: models/user.ts: clerkId: String.
        // So we should query by `clerkId: userId`.
        
        let user = await User.findOne({ clerkId: userId });
        
        if(!user) {
            // Optional: Auto-create user profile if it doesn't exist?
            // For now, just return not found or null
             return res.status(404).json({
                "success": false,
                "msg": "User profile not found"
            })
        }
        
        res.json({
            "success": true,
            "msg": "User found",
            user
        })
        return;
    }
    catch(err) {
        res.status(500).json({
            "success": false,
            "msg": "Internal server error"
        })
    }
}