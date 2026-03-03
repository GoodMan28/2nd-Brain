import express from "express"
import { userAuth } from "../middleware/userAuth.js";
import upload from "../middleware/multer.js";
import { addContent, deleteContent, editContent, getContent, fetchAllContents } from "../controllers/contentController.js";
import { searchContent } from "../controllers/searchController.js";

export const contentRouter = express.Router();

contentRouter.post("/search", userAuth, searchContent);

contentRouter.post("/addContent", userAuth, upload.array("media"), addContent)
// note: sending a POST request to a URL that is managed by CloudFront, but that CloudFront distribution is configured to only allow GET and HEAD requests.
contentRouter.post("/deleteContent", userAuth, deleteContent)
contentRouter.post("/editContent", userAuth, upload.array("media"), editContent)
contentRouter.get("/fetchAllContent", userAuth, fetchAllContents)
contentRouter.post("/getContent", userAuth, getContent)
contentRouter.get("/", (req, res) => {
    res.json({
        "success": true,
        "msg": "content route is working!!"
    })
})