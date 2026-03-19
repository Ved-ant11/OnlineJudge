import { Router, Request, Response } from "express";
import prisma from "../db/client";
import tokenVerify from "../middleware/auth";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const feedback = await prisma.feedback.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { username: true } },
      },
    });

    const result = feedback.map((f) => ({
      id: f.id,
      category: f.category,
      content: f.content,
      rating: f.rating,
      createdAt: f.createdAt,
      username: f.user?.username || "Anonymous",
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", tokenVerify, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { category, content, rating } = req.body;

    if (!category || !content) {
      return res
        .status(400)
        .json({ error: "Category and content are required" });
    }

    const validCategories = ["IMPROVEMENT", "LIKED", "BUG", "OTHER"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const ratingVal = typeof rating === "number" ? Math.min(5, Math.max(1, rating)) : 0;

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        category,
        content,
        rating: ratingVal,
      },
    });

    return res.status(201).json(feedback);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
