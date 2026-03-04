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
    is_related?: boolean;
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
        // console.log(rankedResults);
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
    Your strict goal is to determine if user notes contain information that directly answers or highly relates to a user's query.

    STRICT SCORING RUBRIC:
    - 1.0: EXACT INTENT MATCH. The note directly and comprehensively addresses the core intent of the query.
    - 0.9: STRONG SEMANTIC MATCH. The note contains highly relevant information that heavily contributes to answering the query (e.g., "coding" matching "programming").
    - 0.6: PARTIAL MATCH. The note contains a passing mention of the topic but does not provide meaningful context.
    - 0.0: NO RELEVANCE. Tangential, unrelated, or only shares common stop-words.

    FILTERING INSTRUCTIONS:
    - DO NOT include any note in the results array with a score below 0.8.
    
    OUTPUT FORMAT:
    Return ONLY a valid JSON object matching this schema:
    { "is_related": boolean, "results": [ { "s_no": number, "relevance_score": number } ] }
    
    CRITICAL INSTRUCTION FOR "is_related":
    Set "is_related" to true ONLY IF at least one note scores 0.8 or higher AND contains substantive information to address the query. If the notes only contain passing mentions, weak associations, or unrelated topics, set "is_related" to false and return an empty results array. Do not hallucinate connections.
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
            return { results: [], is_related: false };
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
        return { results: [], is_related: false };
    }
}
