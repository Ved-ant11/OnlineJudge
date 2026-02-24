import { Router, Request, Response } from "express";
import tokenVerify from "../middleware/auth";
import prisma from "../db/client";
import { SubmissionStatus } from "../generated/prisma/client";
import redis from "../redis/client";

const router = Router();

router.post("/", tokenVerify, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { code, language, questionId } = req.body;

  if (!code || !language || !userId || !questionId) {
    return res.status(400).json({ error: "Invalid submission payload" });
  }
  const submission = await prisma.submission.create({
    data: {
      userId,
      questionId,
      code,
      language,
      status: SubmissionStatus.QUEUED,
    },
  });

  await redis.lPush("oj:submissions", submission.id);

  return res.status(201).json({
    submissionId: submission.id,
    status: SubmissionStatus.QUEUED,
  });
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      verdict: true,
      result: true,
    },
  });

  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }

  return res.status(200).json({
    id: submission.id,
    status: submission.status,
    verdict: submission.verdict,
    result: submission.result,
  });
});

// safe check log for queueing operation
// router.get("/size", async (_req: Request, res: Response) => {
//   return res.json({
//     queueSize: await redis.llen("oj:submissions"),
//   });
// });

export default router;
