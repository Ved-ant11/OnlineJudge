import submissionQueue, { Submission } from "../queue/queue";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const POLL_INTERVAL_MS = 200;

const worker = async () => {
    while (true) {
        const submission: Submission | undefined = submissionQueue.dequeue();

        if (!submission) {
            await sleep(POLL_INTERVAL_MS);
            continue;
        }

        try {
            await handleSubmission(submission);
        } catch (err) {
            console.error("Submission processing failed:", err);
        }
    }
};

async function handleSubmission(submission: Submission) {
    // To implement compile and execute pipeline and result persistence.
}

export default worker;
