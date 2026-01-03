import { Router, Request, Response } from "express";
import submissionQueue from "../queue/queue";
import prisma from "../db/client";
import { SubmissionStatus } from "../generated/prisma/client";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { code, language, userId, questionId } = req.body;

  if (!code || !language || !userId || !questionId) {
    return res.status(400).json({ error: "Invalid submission payload" });
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const submission = await prisma.submission.create({
    data: {
      userId,
      questionId,
      code,
      language,
      status: SubmissionStatus.RECEIVED,
    },
  });

  const submissionId = submission.id;
  submissionQueue.enqueue(submissionId);
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: SubmissionStatus.QUEUED },
  });

  return res.status(201).json({
    submissionId,
    status: "QUEUED",
  });
});

// safe check log for queueing operation
router.get("/size", (_req: Request, res: Response) => {
  return res.json({
    queueSize: submissionQueue.size(),
  });
});

export default router;
