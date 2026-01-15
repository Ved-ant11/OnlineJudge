import redis, { connectRedis } from "../redis/client";
import prisma from "../db/client";
import { SubmissionStatus } from "../generated/prisma/client";
import { judgeJavaScriptSubmission } from "./judge";

const QUEUE_KEY = "oj:submissions";
const MAX_ATTEMPTS = 3;
const RUNNING_TIMEOUT_MS = 2 * 60 * 1000;
const RECOVERY_INTERVAL_MS = 30 * 1000;

let isShuttingDown = false;
let recoveryIntervalId: NodeJS.Timeout | null = null;

const recoverStaleSubmissions = async () => {
  try {
    const staleSubmissions = await prisma.submission.findMany({
      where: {
        status: SubmissionStatus.RUNNING,
        lastStartedAt: {
          lt: new Date(Date.now() - RUNNING_TIMEOUT_MS),
        },
      },
    });

    console.log(`Found ${staleSubmissions.length} stale submissions`);

    for (const sub of staleSubmissions) {
      if (sub.attempts >= MAX_ATTEMPTS) {
        await prisma.submission.update({
          where: { id: sub.id },
          data: {
            status: SubmissionStatus.COMPLETED,
            verdict: "TLE",
            result: "System timeout - max attempts exceeded",
          },
        });
      } else {
        await prisma.submission.update({
          where: { id: sub.id },
          data: { status: SubmissionStatus.QUEUED },
        });
        await redis.lPush(QUEUE_KEY, sub.id);
      }
    }
  } catch (err) {
    console.error("Recovery error:", err);
  }
};

const processSubmission = async (submissionId: string) => {
  const claim = await prisma.submission.updateMany({
    where: {
      id: submissionId,
      status: SubmissionStatus.QUEUED,
      attempts: { lt: MAX_ATTEMPTS },
    },
    data: {
      status: SubmissionStatus.RUNNING,
      attempts: { increment: 1 },
      lastStartedAt: new Date(),
    },
  });

  if (claim.count === 0) {
    return;
  }

  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) return;

    const testCases = await prisma.testCase.findMany({
      where: { questionId: submission.questionId },
      orderBy: { order: "asc" },
    });

    const { verdict, message } = await judgeJavaScriptSubmission({
      code: submission.code,
      testCases,
    });

    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: SubmissionStatus.COMPLETED,
        verdict,
        result: message,
      },
    });
  } catch (err) {
    console.error(`Worker error for ${submissionId}:`, err);

    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: SubmissionStatus.COMPLETED,
        verdict: "RTE",
        result: "Internal judge error",
      },
    });
  }
};

const worker = async () => {
  console.log("Worker started with retries enabled...");
  await connectRedis();

  await recoverStaleSubmissions();
  recoveryIntervalId = setInterval(recoverStaleSubmissions, RECOVERY_INTERVAL_MS);

  while (!isShuttingDown) {
    try {
      const res = await redis.blPop(QUEUE_KEY, 5);
      if (!res?.element) continue;
      await processSubmission(res.element);
    } catch (err) {
      console.error("Main loop error:", err);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  if (recoveryIntervalId) clearInterval(recoveryIntervalId);
  await redis.quit();
  await prisma.$disconnect();
};

const shutdown = () => {
  isShuttingDown = true;
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

worker().catch((err) => {
  console.error("Fatal worker error:", err);
  process.exit(1);
});

export default worker;
