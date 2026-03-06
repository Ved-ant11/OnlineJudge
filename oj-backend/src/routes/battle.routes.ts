import { Router, Request, Response } from "express";
import tokenVerify from "../middleware/auth";
import prisma from "../db/client";
import redis from "../redis/client";

const router = Router();

router.post("/queue", tokenVerify, async (req: Request, res: Response) => {
    try{
        const userId = (req as any).userId;
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                rating: true,
                battlesPlayed: true,
                battlesWon: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        await redis.zAdd("matchmaking_queue", {
            score: user.rating,
            value: userId,
        });
        return res.status(200).json({ message: "Added to queue" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.delete("/queue", tokenVerify, async (req: Request, res: Response) => {
    try {
        const userId = (req as any).userId;
        await redis.zRem("matchmaking_queue", userId);
        return res.status(200).json({ message: "Removed from queue" });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/:id", tokenVerify, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const battle = await prisma.battle.findUnique({
            where: {
                id,
            },
            select: {
                player1Id: true,
                player2Id: true,
                questionId: true,
                status: true,
                winnerId: true,
                player1Time: true,
                player2Time: true,
                player1Hints: true,
                player2Hints: true,
                startedAt: true,
                endedAt: true,
                question: {
                    select: {
                        id: true,
                        title: true,
                        statement: true,
                        examples: true,
                        constraints: true,
                    }
                }
            }
        });
        if (!battle) {
            return res.status(404).json({ error: "Battle not found" });
        }
        return res.status(200).json(battle);
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
