"use client";
import { useState, useEffect } from "react";
import { fetchSubmissionsByQuestion } from "@/lib/api";
import Link from "next/link";

type Submission = {
  id: string;
  verdict: string | null;
  status: string;
  language: string;
  createdAt: string;
  code: string;
};

const verdictColor: Record<string, string> = {
  AC: "text-emerald-400",
  WA: "text-red-400",
  TLE: "text-amber-400",
  RTE: "text-orange-400",
  CE: "text-rose-400",
};

export default function SubmissionHistory({ questionId }: { questionId: string }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchSubmissionsByQuestion(questionId);
      setSubmissions(data);
    };
    load();
  }, [questionId]);

  if (submissions.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-sm font-medium text-neutral-300 mb-4">Your Submissions</h2>
      <div className="rounded-xl border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800 bg-neutral-900/50">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Verdict</th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-neutral-500">Language</th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-neutral-500">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr
                key={s.id}
                className="border-b border-neutral-800/50 last:border-0 hover:bg-neutral-800/30 transition-colors"
              >
                <td className={`px-4 py-2.5 font-medium ${verdictColor[s.verdict || ""] || "text-neutral-500"}`}>
                  <Link href={`/submissions/${s.id}`} className="hover:underline">
                    {s.verdict || s.status}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-neutral-400 capitalize">{s.language}</td>
                <td className="px-4 py-2.5 text-right text-neutral-500">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
