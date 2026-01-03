import submissionQueue from "../queue/queue";
import prisma from "../db/client";
import { SubmissionStatus } from "../generated/prisma/client";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
const POLL_INTERVAL_MS = 200;

const worker = async () => {
  console.log("Worker started...");

  while (true) {
    const submissionId = submissionQueue.dequeue();

    if (!submissionId) {
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    try {
      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
      });

      if (!submission) {
        console.warn(`Submission ${submissionId} not found`);
        continue;
      }
      if (submission.status !== SubmissionStatus.QUEUED) {
        console.warn(
          `Skipping submission ${submissionId}, status=${submission.status}`,
        );
        continue;
      }
      await prisma.submission.update({
        where: { id: submissionId },
        data: { status: SubmissionStatus.RUNNING },
      });
      console.log(`Processing submission ${submissionId}`);

      await sleep(2000);

      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: SubmissionStatus.COMPLETED,
          result: "AC",
        },
      });

      console.log(`Completed submission ${submissionId}`);
    } catch (err) {
      console.error(`Worker error for submission ${submissionId}:`, err);
    }
  }
};

worker();

export default worker;
