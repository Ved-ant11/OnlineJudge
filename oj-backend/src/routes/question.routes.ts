import { Router, Request, Response } from "express";
import prisma from "../db/client";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const questions = await prisma.question.findMany({
      select: {
        id: true,
        title: true,
        difficulty: true,
      },
    });

    return res.status(200).json(questions);
  } catch {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const question = await prisma.question.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        difficulty: true,
        statement: true,
        examples: true,
        constraints: true,
      },
    });

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    return res.status(200).json(question);
  } catch {
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
