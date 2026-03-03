import express from "express"
import { getSharedContent, shareContent, revokeShare } from "../controllers/shareController.js"
import { forkContent } from "../controllers/forkController.js"
import { userAuth } from "../middleware/userAuth.js";

const shareRouter = express.Router()

shareRouter.post("/link", userAuth, shareContent); // generate link
shareRouter.get("/:shareToken", getSharedContent);
shareRouter.post("/fork/:shareToken", userAuth, forkContent);
shareRouter.delete("/revoke", userAuth, revokeShare);

export default shareRouter