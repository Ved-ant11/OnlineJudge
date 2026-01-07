import redis, { connectRedis } from "../redis/client";
import prisma from "../db/client";
import { SubmissionStatus } from "../generated/prisma/client";

const QUEUE_KEY = "oj:submissions";
const MAX_ATTEMPTS = 3;
const RUNNING_TIMEOUT_MS = 2 * 60 * 1000;
const RECOVERY_INTERVAL_MS = 30 * 1000;

const worker = async () => {
  console.log("Worker started with retries enabled...");
  await connectRedis();
  //Log to check redis status
  console.log("Redis isOpen:", redis.isOpen);

  setInterval(async () => {
    try {
      const staleSubmissions = await prisma.submission.findMany({
        where: {
          status: SubmissionStatus.RUNNING,
          lastStartedAt: {
            lt: new Date(Date.now() - RUNNING_TIMEOUT_MS),
          },
        },
      });

      for (const sub of staleSubmissions) {
        if (sub.attempts >= MAX_ATTEMPTS) {
          console.log(`Marking ${sub.id} as FAILED`);
          await prisma.submission.update({
            where: { id: sub.id },
            data: { status: SubmissionStatus.FAILED },
          });
        } else {
          console.log(`Re-queueing ${sub.id}`);
          await prisma.submission.update({
            where: { id: sub.id },
            data: { status: SubmissionStatus.QUEUED },
          });
          await redis.lPush(QUEUE_KEY, sub.id);
        }
      }
    } catch (err) {
      console.error("Error:", err);
    }
  }, RECOVERY_INTERVAL_MS);

  while (true) {
    const res = await redis.blPop(QUEUE_KEY, 0);
    const submissionId = res?.element;

    if (!submissionId) continue;

    try {
      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
      });

      if (!submission) continue;

      if (
        submission.status === SubmissionStatus.COMPLETED ||
        submission.status === SubmissionStatus.FAILED
      ) {
        continue;
      }

      if (submission.status !== SubmissionStatus.QUEUED) {
        continue;
      }

      if (submission.attempts >= MAX_ATTEMPTS) {
        await prisma.submission.update({
          where: { id: submissionId },
          data: { status: SubmissionStatus.FAILED },
        });
        continue;
      }

      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: SubmissionStatus.RUNNING,
          attempts: { increment: 1 },
          lastStartedAt: new Date(),
        },
      });

      console.log(
        `Processing ${submissionId}, attempt ${submission.attempts + 1}`,
      );

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

      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
      });

      if (!submission) continue;

      if (submission.attempts >= MAX_ATTEMPTS) {
        await prisma.submission.update({
          where: { id: submissionId },
          data: { status: SubmissionStatus.FAILED },
        });
      } else {
        await prisma.submission.update({
          where: { id: submissionId },
          data: { status: SubmissionStatus.QUEUED },
        });
        await redis.lPush(QUEUE_KEY, submissionId);
        console.log(`Re-queued ${submissionId} after error`);
      }
    }
  }
};

worker();
export default worker;
