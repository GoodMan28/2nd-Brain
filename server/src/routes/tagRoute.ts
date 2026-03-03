import express from "express"
import { userAuth } from "../middleware/userAuth.js"
import { addTag, getTags, deleteTag, deleteTags, mergeTags, getTagAnalytics } from "../controllers/tagController.js"
import type { Request, Response } from "express"

const tagRouter = express.Router()

tagRouter.post("/addTag", userAuth, addTag)
tagRouter.get("/getTags", userAuth, getTags)
tagRouter.post("/deleteTag", userAuth, deleteTag)
tagRouter.post("/deleteTags", userAuth, deleteTags)
tagRouter.post("/mergeTags", userAuth, mergeTags)
tagRouter.get("/analytics", userAuth, getTagAnalytics)
tagRouter.get("/", (req: Request, res: Response) => {
    return res.json({
        "success": true,
        "msg": "tag route is working"
    })
})

export default tagRouter