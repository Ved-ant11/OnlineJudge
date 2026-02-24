import { Router, Request, Response } from "express";
import prisma from "../db/client";
import tokenVerify from "../middleware/auth";

const router = Router();

router.get('/profile', tokenVerify, async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: (req as any).userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const userSubmissions = await prisma.submission.findMany({ where: { userId: (req as any).userId }, include: { question: true } });
        res.status(200).json({ username: user.username, submissions: userSubmissions, email: user.email, createdAt: user.createdAt });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/solved', tokenVerify, async (req: Request, res: Response) => {
    try {
        const submissions = await prisma.submission.findMany({
            where: { userId: (req as any).userId, verdict: 'AC' },
            select: { questionId: true },
            distinct: ['questionId'],
        });
        const solvedIds = submissions.map((s) => s.questionId);
        res.status(200).json({ solvedIds });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;

