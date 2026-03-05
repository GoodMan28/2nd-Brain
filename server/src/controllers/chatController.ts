import type { Request, Response } from "express";
import Groq from "groq-sdk";
import { Content } from "../models/content.js";
import { Conversation } from "../models/conversation.js";
import { getGroqRankedResults } from "./searchController.js";
import type { NoteContext } from "./searchController.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const chatWithNotes = async (req: Request, res: Response): Promise<void> => {
    try {
        const { query, conversationId, modelId } = req.body;
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
                            content: `
                                You are an expert search-query rewriter. Analyze the chat history and the latest user query.
                                Your goal is to formulate a precise, standalone search query optimized for a semantic database.
                                
                                RULES:
                                1. Resolve pronouns and contextual references (e.g., if history discusses "React" and the user asks "how do I install it?", rewrite as "how to install React").
                                2. Strip away all conversational filler, greetings, or pleasantries (e.g., "Thanks! Now tell me about X" -> "X").
                                3. If the user's query is completely unrelated to the history and already self-contained, just return the core search concepts.
                                
                                Return ONLY a valid JSON object:
                                { 
                                "requires_rewrite": boolean, 
                                "rewritten_query": "string" 
                                }
                                
                                Set "requires_rewrite" to true if you modified the original query in ANY way. If it is already a perfect, fluff-free search query, set it to false and mirror the query in "rewritten_query".
                            `
                        },
                        { role: "user", content: `History:\n${chatHistory}\n\nQuery: ${query}` }
                    ],
                    model: modelId || "llama-3.1-8b-instant",
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
        // console.log(rankResponse);
        if (rankResponse.is_related === false || rankResponse.results.length === 0) {
            const negations = [
                "I couldn't find any notes related to your query.",
                "It looks like you haven't saved any notes about this topic yet.",
                "I searched through your brain but couldn't find anything matching this.",
                "No related notes found. Perhaps try adding some content on this?",
                "I don't have enough context from your stored notes to answer this."
            ];
            const fallbackAnswer = negations[Math.floor(Math.random() * negations.length)];

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
                content: fallbackAnswer,
                citedNotes: []
            } as any);

            await conversation.save();

            res.status(200).json({
                success: true,
                conversationId: conversation._id,
                answer: fallbackAnswer,
                citedNotes: []
            });
            return;
        }

        const winningSNo = rankResponse.results.map((r: any) => r.s_no);

        const filteredNotes = contents.filter((_, index) => winningSNo.includes(index));

        // --- Step 3: The Generator ---
        const filteredContext = filteredNotes.map((note, index) => ({
            s_no: winningSNo[index], // Maintain original mapping index for citing
            title: note.title,
            description: note.description
        }));

        const genSystemPrompt = `
            You are a strict, grounded AI assistant. You answer user queries based STRICTLY and EXCLUSIVELY on the provided "Context Notes".

            CRITICAL RULES:
            1. NO EXTERNAL KNOWLEDGE: If the provided notes do not contain the specific facts needed to answer the query, you MUST state: "I cannot answer this based on your provided notes." Do not attempt to guess or use outside knowledge.
            2. CITATIONS: You must justify your answer by citing the "s_no" of the exact notes you extracted facts from.
            3. NO HALLUCINATED CITATIONS: Only cite an "s_no" if you actively used its content. If you cannot answer the query, the "cited_s_no" array MUST be empty.

            OUTPUT FORMAT:
            Return ONLY a valid JSON object matching this schema:
            { 
            "answer": "string", 
            "cited_s_no": number[] 
            }
        `;

        const genCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: genSystemPrompt },
                { role: "user", content: `Context Notes:\n${JSON.stringify(filteredContext)}\n\nQuery: ${query}` },
            ],
            model: modelId || "llama-3.1-8b-instant",
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
            model: 'Content',
            populate: {
                path: 'tags',
                model: 'Tag'
            }
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

export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        // Find all conversations, sort oldest first to calculate the stable indexes, then reverse?
        // Or just fetch all, sorted ascending by createdAt.
        const conversations = await Conversation.find({ userId })
            .select('_id updatedAt createdAt messages')
            .sort({ createdAt: 1 }); // Oldest first (1, 2, 3...)

        const history = conversations.map((c, index) => {
            const firstMessage = c.messages?.[0]?.content || 'Empty Conversation';
            return {
                id: c._id,
                title: `Conversation #${index + 1}`,
                updatedAt: c.updatedAt,
                preview: firstMessage.substring(0, 50) + (firstMessage.length > 50 ? '...' : '')
            };
        }).reverse(); // Reverse so newest is at the top of the UI

        res.status(200).json({ success: true, history });
    } catch (error) {
        console.error("Error fetching chat history:", error);
        res.status(500).json({ success: false, msg: "Failed to fetch chat history" });
    }
};

export const getConversation = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).userId;
        const conversationId = req.params.id;

        if (!conversationId) {
            res.status(400).json({ success: false, msg: "Conversation ID is required" });
            return;
        }

        const conversation = await Conversation.findOne({ _id: conversationId, userId }).populate({
            path: 'messages.citedNotes',
            model: 'Content',
            populate: {
                path: 'tags',
                model: 'Tag'
            }
        });

        if (!conversation) {
            res.status(404).json({ success: false, msg: "Conversation not found" });
            return;
        }

        res.status(200).json({ success: true, conversation });
    } catch (error) {
        console.error("Error fetching conversation:", error);
        res.status(500).json({ success: false, msg: "Failed to fetch conversation" });
    }
};

