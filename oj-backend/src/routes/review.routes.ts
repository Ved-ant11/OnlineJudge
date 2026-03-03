import { Router } from "express";
import { Request, Response } from "express";
import tokenVerify from "../middleware/auth";
import prisma from "../db/client";
import { GoogleGenAI } from "@google/genai";

const router = Router();

const genAI = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

router.post("/", tokenVerify, async (req: Request, res: Response) => {
    try{
        const {submissionId} = req.body;
        if(!submissionId){
            return res.status(400).json({ message: "Submission ID is required" });
        }

        const submission = await prisma.submission.findUnique({
            where: {
                id: submissionId
            },
            select: {
                code: true,
                questionId: true,
                language: true,
                verdict: true,
                result: true,
            }
        });
        if(!submission){
            return res.status(404).json({ message: "Submission not found" });
        }

        const ques = await prisma.question.findUnique({
            where: {
                id: submission.questionId
            },
            select: {
                title: true,
                statement: true,
            }
        });
        if(!ques){
            return res.status(404).json({ message: "Question not found" });
        }

        const prompt = `
        You are an expert code reviewer. Analyze this ${submission.language} solution for the problem "${ques.title}".

        Problem: ${ques.statement}
        Code: ${submission.code}
        Verdict: ${submission.verdict}

        Provide:
        1. Time and space complexity
        2. What the code does well
        3. Potential improvements or bugs
        4. A better approach if one exists (don't give full code, just explain the idea)
        Keep response concise and actionable. Keep it very very short, quick and easy to remember.
        `;

        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        const text = result.text;
        return res.status(200).json({ review: text });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

export default router;