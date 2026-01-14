"use client";

import { useEffect, useState } from "react";
import { fetchSubmissionStatus } from "@/lib/api";

type Props = {
  submissionId: string;
};

export default function SubmissionStatus({ submissionId }: Props) {
  const [status, setStatus] = useState<string>("LOADING");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await fetchSubmissionStatus(submissionId);
        setStatus(data.status);
        setResult(data.result ?? null);

        if (data.status === "COMPLETED" || data.status === "FAILED") {
          clearInterval(interval);
        }
      } catch {
        setError("Failed to load submission status");
        clearInterval(interval);
      }
    };

    poll();
    const interval = setInterval(poll, 1500);

    return () => clearInterval(interval);
  }, [submissionId]);

  if (error) return <p>{error}</p>;

  if (status === "QUEUED") return <p>In queue...</p>;
  if (status === "RUNNING") return <p>Running...</p>;
  if (status === "COMPLETED") return <p>Result: {result}</p>;
  if (status === "FAILED")
    return <p className="text-red-500">Submission failed</p>;

  return <p>Loading...</p>;
}
