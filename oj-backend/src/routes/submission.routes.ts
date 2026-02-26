import { Router, Request, Response } from "express";
import tokenVerify from "../middleware/auth";
import prisma from "../db/client";
import { SubmissionStatus } from "../generated/prisma/client";
import redis from "../redis/client";
import { validate } from "../middleware/validate";
import { submissionSchema } from "../validation/schemas";

const router = Router();

router.post("/", tokenVerify, validate(submissionSchema), async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { code, language, questionId } = req.body;
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
router.get("/question/:questionId", tokenVerify, async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { questionId } = req.params;

  const submissions = await prisma.submission.findMany({
    where: { userId, questionId },
    select: {
      id: true,
      language: true,
      verdict: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json(submissions);
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
      code: true,
      language: true,
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
    code: submission.code,
    language: submission.language,
  });
});

// safe check log for queueing operation
// router.get("/size", async (_req: Request, res: Response) => {
//   return res.json({
//     queueSize: await redis.llen("oj:submissions"),
//   });
// });

export default router;
