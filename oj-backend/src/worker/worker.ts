import redis from "../redis/client";
import prisma from "../db/client";
import { SubmissionStatus } from "../generated/prisma/client";

const QUEUE_KEY = "oj:submissions";
const MAX_ATTEMPTS = 3;
const RUNNING_TIMEOUT_MS = 2 * 60 * 1000; 

const worker = async () => {
  console.log("Worker started with retries enabled...");

  while (true) {
    // Blocking pop
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

      const now = new Date();
      if (submission.status === SubmissionStatus.RUNNING) {
        const last = submission.lastStartedAt?.getTime() ?? 0;
        const isStale = Date.now() - last > RUNNING_TIMEOUT_MS;

        if (!isStale) {
          continue;
        }

        if (submission.attempts >= MAX_ATTEMPTS) {
          await prisma.submission.update({
            where: { id: submissionId },
            data: { status: SubmissionStatus.FAILED },
          });
          continue;
        }

        // Retry
        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: SubmissionStatus.QUEUED,
          },
        });

        await redis.lPush(QUEUE_KEY, submissionId);
        continue;
      }

      //Handle QUEUED jobs
      if (submission.status === SubmissionStatus.QUEUED) {
        if (submission.attempts >= MAX_ATTEMPTS) {
          await prisma.submission.update({
            where: { id: submissionId },
            data: { status: SubmissionStatus.FAILED },
          });
          continue;
        }

        // Increment attempts + mark RUNNING
        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: SubmissionStatus.RUNNING,
            attempts: { increment: 1 },
            lastStartedAt: now,
          },
        });

        console.log(
          `Processing submission ${submissionId}, attempt ${
            submission.attempts + 1
          }`
        );
        await new Promise((r) => setTimeout(r, 2000));
        await prisma.submission.update({
          where: { id: submissionId },
          data: {
            status: SubmissionStatus.COMPLETED,
            result: "AC",
          },
        });

        console.log(`Completed submission ${submissionId}`);
      }
    } catch (err) {
      console.error(`Worker error for submission ${submissionId}`, err);
    }
  }
};

worker();
export default worker;
