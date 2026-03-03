import express from "express"
import { getMe } from "../controllers/userController.js";
import { userAuth } from "../middleware/userAuth.js";
export let userRouter = express.Router();

userRouter.get("/me/", userAuth, getMe);
userRouter.get("/", (req,res) => {
    res.status(200).json({
        "msg": "user route is running",
        "success": true
    })
})