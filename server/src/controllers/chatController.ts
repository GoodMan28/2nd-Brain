import type { Request, Response } from "express";
import Groq from "groq-sdk";
import { Content } from "../models/content.js";
import { Conversation } from "../models/conversation.js";
import { getGroqRankedResults } from "./searchController.js";
import type { NoteContext } from "./searchController.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const chatWithNotes = async (req: Request, res: Response): Promise<void> => {
    try {
        const { query, conversationId } = req.body;
        const userId = (req as any).userId;

        if (!query) {
            res.status(400).json({ success: false, msg: "Query is required" });
            return;
        }

        // --- Step 1: Query Rewriter ---
        let conversation = null;
        let chatHistory = "";
        let searchIntent = query;

        if (conversationId) {
            conversation = await Conversation.findOne({ _id: conversationId, userId });
            if (conversation) {
                const recentMessages = conversation.messages.slice(-5);
                chatHistory = recentMessages.map(m => `${m.role}: ${m.content}`).join("\n");
                
                const rewriteCompletion = await groq.chat.completions.create({
                    messages: [
                        { 
                            role: "system", 
                            content: `You are a query rewriter. Analyze the chat history and the latest user query.
                            Determine if the query needs to be rewritten into a standalone search string to be understood without history.
                            
                            Return ONLY a valid JSON object:
                            { 
                              "requires_rewrite": boolean, 
                              "rewritten_query": "string" 
                            }
                            
                            Set "requires_rewrite" to true ONLY if the query references previous context (e.g., "tell me more about that", "what about the first one?").
                            If the query is already standalone, set "requires_rewrite" to false.` 
                        },
                        { role: "user", content: `History:\n${chatHistory}\n\nQuery: ${query}` }
                    ],
                    model: "llama-3.1-8b-instant",
                    temperature: 0.1,
                    response_format: { type: "json_object" }
                });
                
                const rewriteResponse = JSON.parse(rewriteCompletion.choices[0]?.message?.content || '{"requires_rewrite": false, "rewritten_query": ""}');
                
                if (rewriteResponse.requires_rewrite && rewriteResponse.rewritten_query) {
                    searchIntent = rewriteResponse.rewritten_query;
                } else {
                    searchIntent = query; // Heuristic fallback to original query
                }
            }
        }

        // --- Step 2: The Ranker (Semantic Search) ---
        const contents = await Content.find({ userId }).populate("tags");
        if (contents.length === 0) {
            searchIntent = query; // Fallback
        }

        const notesContext: NoteContext[] = contents.map((note: any, index: number) => ({
            s_no: index,
            title: note.title,
            description: note.description || "",
            type: note.type,
            link: note.link || "",
            tags: note.tags ? note.tags.map((t: any) => t.title) : []
        }));

        const rankResponse = await getGroqRankedResults(searchIntent, notesContext);
        const winningSNo = rankResponse.results.map((r: any) => r.s_no);

        const filteredNotes = contents.filter((_, index) => winningSNo.includes(index));

        // --- Step 3: The Generator ---
        const filteredContext = filteredNotes.map((note, index) => ({
            s_no: winningSNo[index], // Maintain original mapping index for citing
            title: note.title,
            description: note.description
        }));

        const genSystemPrompt = `
            You are a helpful assistant. Answer the user's query using ONLY the provided notes.
            If the answer isn't in the notes, say you don't know based on the provided files.
            Return ONLY a valid JSON object matching this schema:
            { "answer": string, "cited_s_no": number[] }
            The "cited_s_no" should be the s_no of the notes used to generate parts of the answer.
        `;

        const genCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: genSystemPrompt },
                { role: "user", content: `Context Notes:\n${JSON.stringify(filteredContext)}\n\nQuery: ${query}` },
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.5,
            response_format: { type: "json_object" }
        });

        const genResponse = JSON.parse(genCompletion.choices[0]?.message?.content || '{"answer": "Sorry, I could not find relevant information in your notes.", "cited_s_no": []}');
        
        // Map cited_s_no back to ObjectIds
        const citedNoteIds = genResponse.cited_s_no
            .map((sNo: number) => contents[sNo]?._id)
            .filter((id: any) => id);

        // --- Step 4: Database Update & Response ---
        if (!conversation) {
            conversation = new Conversation({
                userId,
                messages: []
            });
        }

        conversation.messages.push({
            role: "user",
            content: query,
            searchIntent: searchIntent
        } as any);

        conversation.messages.push({
            role: "assistant",
            content: genResponse.answer,
            citedNotes: citedNoteIds
        } as any);

        await conversation.save();

        // Repopulate citedNotes for the response
        const populatedConversation = await Conversation.findById(conversation._id).populate({
            path: 'messages.citedNotes',
            model: 'Content'
        });

        const lastMessage = populatedConversation?.messages[populatedConversation.messages.length - 1];

        res.status(200).json({
            success: true,
            conversationId: conversation._id,
            answer: genResponse.answer,
            citedNotes: lastMessage?.citedNotes || []
        });

    } catch (e) {
        console.error("Error in chatWithNotes:", e);
        res.status(500).json({ success: false, msg: "Internal server error" });
    }
};
