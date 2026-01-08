import redis, { connectRedis } from "../redis/client";
import prisma from "../db/client";
import { SubmissionStatus } from "../generated/prisma/client";

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
            status: SubmissionStatus.FAILED,
            result: "System timeout - max attempts exceeded"
          },
        });
        console.log(`Failed ${sub.id} (max attempts)`);
      } else {
        await prisma.submission.update({
          where: { id: sub.id },
          data: { status: SubmissionStatus.QUEUED },
        });
        await redis.lPush(QUEUE_KEY, sub.id);
        console.log(`Re-queued ${sub.id} (attempt ${sub.attempts + 1}/${MAX_ATTEMPTS})`);
      }
    }
  } catch (err) {
    console.error("Error:", err);
  }
};

const processSubmission = async (submissionId: string) => {
  // Atomic claim for submission
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
    console.log(`Skipped ${submissionId} (already claimed or max attempts)`);
    return;
  }

  console.log(`Processing ${submissionId}`);

  try {
    // TODO: code execution logic
    await new Promise((r) => setTimeout(r, 2000));

    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: SubmissionStatus.COMPLETED,
        result: "AC",
      },
    });

    console.log(`Completed ${submissionId}`);
  } catch (err) {
    console.error(`Error processing ${submissionId}:`, err);
    await handleFailedSubmission(submissionId);
  }
};

const handleFailedSubmission = async (submissionId: string) => {
  try {
    const sub = await prisma.submission.findUnique({
      where: { id: submissionId },
    });

    if (!sub) {
      console.error(`Submission ${submissionId} not found`);
      return;
    }

    if (sub.attempts >= MAX_ATTEMPTS) {
      await prisma.submission.update({
        where: { id: submissionId },
        data: { 
          status: SubmissionStatus.FAILED,
          result: "System error - max attempts exceeded"
        },
      });
      console.log(`Failed ${submissionId} (max attempts)`);
    } else {
      await prisma.submission.update({
        where: { id: submissionId },
        data: { status: SubmissionStatus.QUEUED },
      });
      await redis.lPush(QUEUE_KEY, submissionId);
      console.log(`Re-queued ${submissionId} for retry (attempt ${sub.attempts}/${MAX_ATTEMPTS})`);
    }
  } catch (retryErr) {
    console.error(`Error handling failed submission ${submissionId}:`, retryErr);
  }
};

const worker = async () => {
  console.log("Worker started with retries enabled...");
  await connectRedis();
  console.log("Redis isOpen:", redis.isOpen);
  await recoverStaleSubmissions();
  recoveryIntervalId = setInterval(recoverStaleSubmissions, RECOVERY_INTERVAL_MS);

  while (!isShuttingDown) {
    try {
      const res = await redis.blPop(QUEUE_KEY, 5);
      if (!res?.element) continue;
      await processSubmission(res.element);
    } catch (err) {
      console.error("Unexpected error in main loop:", err);
      await new Promise(r => setTimeout(r, 1000)); // Brief pause before retrying
    }
  }

  console.log("Shutting down gracefully...");
  if (recoveryIntervalId) clearInterval(recoveryIntervalId);
  await redis.quit();
  await prisma.$disconnect();
};

// Graceful shutdown
const shutdown = async () => {
  console.log("Received shutdown signal");
  isShuttingDown = true;
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

worker().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

export default worker;
