import type { Request, Response } from "express";
import Groq from "groq-sdk";
import { Content } from "../models/content.js";
import { log } from "node:console";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface NoteContext {
    s_no: number;
    title: string;
    description: string;
    type: string;
    link: string;
    tags: any[];
}

export interface SearchResult {
    s_no: number;
    relevance_score: number;
}

export interface SearchResponse {
    results: SearchResult[];
}

export const searchContent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { query } = req.body;
        const userId = (req as any).userId;

        if (!query) {
            res.status(400).json({ success: false, msg: "Search query is required" });
            return;
        }

        const contents = await Content.find({ userId }).populate("tags");

        if (contents.length === 0) {
            res.status(200).json({ success: true, results: [] });
            return;
        }

const notesContext: NoteContext[] = contents.map((note: any, index: number) => ({
            s_no: index,
            title: note.title,
            description: note.description || "",
            type: note.type,
            link: note.link || "",
            tags: note.tags ? note.tags.map((t: any) => t.title) : []
        }));

        const rankedResults = await getGroqRankedResults(query, notesContext);
        const contentMap = new Map(contents.map((c, index) => [index, c]))
        
        const sortedContent = rankedResults.results
            .map(result => {
                const content = contentMap.get(result.s_no);
                return content ? { ...content.toObject(), relevance_score: result.relevance_score } : null;
            })
            .filter(item => item !== null);
        
        res.status(200).json({ success: true, results: sortedContent });

    } catch (e) {
        console.error("Error executing search:", e);
        res.status(500).json({ success: false, msg: "Internal server error" });
    }
};

export async function getGroqRankedResults(query: string, notes: NoteContext[]): Promise<SearchResponse> {

    const systemPrompt = `
        You are a high-precision search ranking AI. 
        Your goal is to filter and rank user notes based on a query.

        STRICT MATCHING LOGIC (Perform in order):
        
        1. **Direct Keyword Search (Highest Priority)**:
        - Check 'title', 'tags', and 'description' for the query terms (case-insensitive).
        
        2. **Scoring Rubric**:
        - **1.0**: EXACT CONTENT MATCH (e.g., Query "51" matches Title "Pier 51"). 
                    *Rule: If the query appears ANYWHERE in the text, it is a 1.0.*
        - **0.9**: Strong Semantic Match (e.g., "coding" matches "programming").
        - **0.5**: Vague Match / Weak Association.
        - **0.0**: No relevance.

        3. **Filtering**:
        - Exclude any item with a score < 0.5. 
        (Lowering this prevents accidental deletions of partial matches)
        
        OUTPUT FORMAT:
        Return ONLY a valid JSON object:
        { "results": [ { "s_no": 0, "relevance_score": 0.9 } ] }
    `;

    const userPrompt = `
        Query: "${query}"
        
        Notes:
        ${JSON.stringify(notes)}
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        const responseContent = completion.choices[0]?.message?.content;

        if (!responseContent) {
            return { results: [] };
        }
        
        const parsedResponse = JSON.parse(responseContent);
        
        // Use Type Assertion if necessary or just trust the structure since we parse it
        // filtering here as a safety net in case LLM returns lower scores
        if (parsedResponse.results) {
             parsedResponse.results = parsedResponse.results.filter((r: any) => r.relevance_score >= 0.8);
        }

        return parsedResponse;
    } catch (e) {
        console.error("Failed to fetch or parse LLM response:", e);
        return { results: [] };
    }
}
