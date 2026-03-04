import express from "express";
import { userAuth } from "../middleware/userAuth.js";
import { chatWithNotes, getChatHistory, getConversation } from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.post("/chat-with-notes", userAuth, chatWithNotes);
chatRouter.get("/history", userAuth, getChatHistory);
chatRouter.get("/conversation/:id", userAuth, getConversation);

export default chatRouter;
