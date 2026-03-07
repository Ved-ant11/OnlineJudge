import { GoogleGenAI } from "@google/genai";
import prisma from "../db/client";

const HINT_PENALTIES = [120000, 180000, 300000]; 

export async function getHintsForQuestion(questionId: string): Promise<string[]> {
    const question = await prisma.question.findUnique({
        where: { id: questionId },
        select: { title: true, difficulty: true, constraints: true, statement: true },
    });
    if (!question) return [];

    const fallback = [
        "Think about which data structure fits this problem best.",
        "Consider the time complexity — can you do better than brute force?",
        "Try breaking the problem into smaller subproblems.",
    ];

    try {
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        const prompt = `Given this coding problem, generate 3 progressive hints for a competitive programmer.
        Hint 1: A vague directional nudge.
        Hint 2: A specific technique or data structure to consider.
        Hint 3: A near-giveaway that almost describes the algorithm.
        Respond ONLY with a JSON array of 3 strings. No markdown, no explanation, no code fences.
        Problem: ${question.statement}`;

        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        const text = (result.text || "").trim();
        const hints: string[] = JSON.parse(text);
        if (Array.isArray(hints) && hints.length === 3) {
            return hints;
        }
    } catch (e) {
        console.error("Hint generation failed, using fallback", e);
    }

    return fallback;
}

export function getHintPenalty(hintIndex: number): number {
    return HINT_PENALTIES[Math.min(hintIndex, HINT_PENALTIES.length - 1)];
}
