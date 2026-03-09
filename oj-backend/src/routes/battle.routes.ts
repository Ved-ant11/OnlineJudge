import { Router, Request, Response } from "express";
import tokenVerify from "../middleware/auth";
import prisma from "../db/client";
import redis from "../redis/client";

const router = Router();

router.post("/queue", tokenVerify, async (req: Request, res: Response) => {
  try {
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

router.get(
  "/queue/status",
  tokenVerify,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const battle = await prisma.battle.findFirst({
        where: {
          OR: [{ player1Id: userId }, { player2Id: userId }],
          status: "ACTIVE",
        },
        orderBy: { createdAt: "desc" },
      });
      if (battle) {
        return res.status(200).json({ matched: true, battleId: battle.id });
      }
      return res.status(200).json({ matched: false });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

router.get("/history", tokenVerify, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const battles = await prisma.battle.findMany({
      where: {
        OR: [{ player1Id: userId }, { player2Id: userId }],
        status: { in: ["COMPLETED", "ABANDONED"] },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        status: true,
        winnerId: true,
        player1Id: true,
        player2Id: true,
        player1Time: true,
        player2Time: true,
        createdAt: true,
        endedAt: true,
        question: {
          select: {
            id: true,
            title: true,
            difficulty: true,
          },
        },
        player1: {
          select: { username: true, rating: true },
        },
        player2: {
          select: { username: true, rating: true },
        },
      },
    });

    const history = battles.map((b) => {
      const isPlayer1 = b.player1Id === userId;
      const opponent = isPlayer1 ? b.player2 : b.player1;
      const won = b.winnerId === userId;
      const draw = b.winnerId === null;

      return {
        id: b.id,
        status: b.status,
        won,
        draw,
        opponent: opponent.username,
        opponentRating: opponent.rating,
        question: b.question,
        timeTaken: isPlayer1 ? b.player1Time : b.player2Time,
        createdAt: b.createdAt,
        endedAt: b.endedAt,
      };
    });

    return res.status(200).json(history);
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
          },
        },
      },
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
