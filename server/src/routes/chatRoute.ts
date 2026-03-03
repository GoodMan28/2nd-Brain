import express from "express";
import { userAuth } from "../middleware/userAuth.js";
import { chatWithNotes } from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.post("/chat-with-notes", userAuth, chatWithNotes);

export default chatRouter;
