import { Router, Request, Response } from "express";
import prisma from "../db/client";
import tokenVerify from "../middleware/auth";

const router = Router();

router.get("/profile", tokenVerify, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    const userSubmissions = await prisma.submission.findMany({
      where: { userId: (req as any).userId },
      include: { question: true },
    });
    res
      .status(200)
      .json({
        username: user.username,
        submissions: userSubmissions,
        email: user.email,
        createdAt: user.createdAt,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/solved", tokenVerify, async (req: Request, res: Response) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { userId: (req as any).userId, verdict: "AC" },
      select: { questionId: true },
      distinct: ["questionId"],
    });
    const solvedIds = submissions.map((s) => s.questionId);
    res.status(200).json({ solvedIds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", tokenVerify, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).userId },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({
      id: user.id,
      username: user.username,
      rating: user.rating,
      battlesPlayed: user.battlesPlayed,
      battlesWon: user.battlesWon,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/leaderboard", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        username: true,
        submissions: {
          where: { verdict: "AC" },
          select: { questionId: true },
          distinct: ["questionId"],
        },
      },
    });

    const leaderboard = users
      .map((u) => ({
        username: u.username,
        solvedCount: u.submissions.length,
      }))
      .filter((u) => u.solvedCount > 0)
      .sort((a, b) => b.solvedCount - a.solvedCount);

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/streak", tokenVerify, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).userId },
      select: { currentStreak: true, maxStreak: true, lastActivityDate: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    const now = new Date();
    const todayMillis = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    );
    const today = new Date(todayMillis);

    let currentStreak = user.currentStreak;

    if (user.lastActivityDate) {
      const lastMillis = Date.UTC(
        user.lastActivityDate.getUTCFullYear(),
        user.lastActivityDate.getUTCMonth(),
        user.lastActivityDate.getUTCDate(),
      );

      const diffDays = Math.round(
        (todayMillis - lastMillis) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 0) {
        currentStreak = user.currentStreak;
      } else if (diffDays === 1) {
        currentStreak = user.currentStreak;
      } else {
        currentStreak = 0;
      }
    } else {
      currentStreak = 0;
    }

    const oneYearAgo = new Date();
    oneYearAgo.setUTCFullYear(oneYearAgo.getUTCFullYear() - 1);

    const activities = await prisma.dailyActivity.findMany({
      where: {
        userId: (req as any).userId,
        date: { gte: oneYearAgo },
      },
      select: { date: true, count: true },
      orderBy: { date: "asc" },
    });

    const heatmapData = activities.map((a) => ({
      date: a.date.toISOString().split("T")[0],
      count: a.count,
    }));

    res.status(200).json({
      currentStreak,
      maxStreak: user.maxStreak,
      heatmapData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
