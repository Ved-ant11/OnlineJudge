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

  if (error) {
    return (
      <div className="rounded-md border border-neutral-800 bg-neutral-900/50 p-6">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (status === "LOADING" || status === "QUEUED" || status === "RUNNING") {
    return (
      <div className="rounded-md border border-neutral-800 bg-neutral-900/50 p-6">
        <div className="flex items-center gap-3">
          <svg
            className="h-4 w-4 animate-spin text-neutral-400"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeOpacity="0.15"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-sm text-neutral-400">
            {status === "LOADING" && "Loading..."}
            {status === "QUEUED" && "In queue..."}
            {status === "RUNNING" && "Running..."}
          </span>
        </div>
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="rounded-md border border-neutral-800 bg-neutral-900/50 p-6">
        <p className="text-sm font-medium text-red-400">Submission Failed</p>
        <p className="mt-1 text-xs text-neutral-500">
          Something went wrong. Please try again.
        </p>
      </div>
    );
  }

  if (status === "COMPLETED" && result) {
    const r = result.toLowerCase();

    let verdictColor = "text-neutral-400";
    let verdictLabel = result;

    if (r.includes("accepted")) {
      verdictColor = "text-emerald-500";
      verdictLabel = "Accepted";
    } else if (r.includes("wrong")) {
      verdictColor = "text-red-400";
      verdictLabel = "Wrong Answer";
    } else if (r.includes("time")) {
      verdictColor = "text-amber-500";
      verdictLabel = "Time Limit Exceeded";
    } else if (r.includes("runtime")) {
      verdictColor = "text-orange-400";
      verdictLabel = "Runtime Error";
    } else if (r.includes("compilation")) {
      verdictColor = "text-purple-400";
      verdictLabel = "Compilation Error";
    }

    return (
      <div className="rounded-md border border-neutral-800 bg-neutral-900/50 p-6">
        <p className={`text-lg font-semibold ${verdictColor}`}>
          {verdictLabel}
        </p>
        {result !== verdictLabel && (
          <p className="mt-1 text-xs text-neutral-500">{result}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-900/50 p-6">
      <p className="text-sm text-neutral-500">Loading...</p>
    </div>
  );
}
