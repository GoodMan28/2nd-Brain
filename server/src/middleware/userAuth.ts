import type { NextFunction, Request, Response } from "express";
import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import "dotenv/config";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            auth?: {
                userId?: string;
                sessionId?: string;
                claims?: any;
            }
        }
    }
}

// Custom middleware wrapper to adapt Clerk's middleware to our req.userId convention
export const userAuth = (req: Request, res: Response, next: NextFunction) => {
    // strict: false allows us to handle the error ourselves if we wanted, 
    // but here we just rely on Clerk to populates req.auth
    // DEBUG: Print auth-related headers and env check
    // -----------------------------------------------
    // console.log("UserAuth Middleware - Request Headers:", JSON.stringify(req.headers, null, 2));
    // console.log("UserAuth Middleware - Env Check:", {
    //     HAS_CLERK_SECRET_KEY: !!process.env.CLERK_SECRET_KEY,
    //     HAS_CLERK_PUBLISHABLE_KEY: !!process.env.CLERK_PUBLISHABLE_KEY,
    //     HAS_PEM_PUBLIC_KEY: !!process.env.CLERK_PEM_PUBLIC_KEY,
    //     HAS_JWT_KEY: !!process.env.CLERK_JWT_KEY
    // });
    // -----------------------------------------------

    ClerkExpressRequireAuth({})(req as any, res as any, (err: any) => {
        if (err) {
            console.error("User Auth Error:", err);
            return res.status(401).json({
                success: false,
                msg: "Unauthenticated",
                error: err.message
            });
        }

        if (!req.auth?.userId) {
            console.error("User Auth Failed: No userId in req.auth", req.auth);
            return res.status(401).json({
                success: false,
                msg: "Unauthenticated: No User ID found in session"
            });
        }

        // Map Clerk's auth.userId to our legacy req.userId
        req.userId = req.auth.userId;
        next();
    });
};
