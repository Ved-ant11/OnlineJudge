import { Router, Request, Response } from "express";
import submissionQueue, { Submission } from "../queue/queue";
const router = Router();

router.post("/", (req: Request, res: Response) => {
  const { code, language, userId, question } = req.body;

  if (!code || !language || !userId || !question) {
    return res.status(400).json({ error: "Invalid submission" });
  }
  const submission: Submission = { code, language, userId, question };
  submissionQueue.enqueue(submission);

    return res.status(201).json({
      message: "New Submission received",
      status: "QUEUED",
    });
});

router.get("/size", (_req: Request, res: Response) => {
  return res.status(200).json({
    queueSize: submissionQueue.size(),
  });
});

export default router;
