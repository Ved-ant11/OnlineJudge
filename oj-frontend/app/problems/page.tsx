"use client";
import { useEffect, useState } from "react";
import { fetchQuestions, fetchSolvedIds } from "@/lib/api";
import Link from "next/link";

export default function ProblemsPage() {
  const [questions, setQuestions] = useState<
    { id: string; title: string; difficulty: string }[]
  >([]);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [questionsData, solved] = await Promise.all([
          fetchQuestions(),
          fetchSolvedIds(),
        ]);
        setQuestions(questionsData);
        setSolvedIds(new Set(solved));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const difficultyColor: Record<string, string> = {
    easy: "text-emerald-500",
    medium: "text-amber-500",
    hard: "text-red-500",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3rem)]">
        <svg className="h-6 w-6 animate-spin text-neutral-500" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-100 mb-6">
        Problems
      </h1>

      <div className="rounded-lg border border-neutral-800 overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_80px] gap-4 px-4 py-2.5 bg-neutral-900/60 border-b border-neutral-800 text-xs font-medium text-neutral-500 uppercase tracking-wide">
          <span>Title</span>
          <span>Difficulty</span>
          <span className="text-right">Status</span>
        </div>

        <div className="divide-y divide-neutral-800/60">
          {questions.map(
            (question, index) => {
              const diff = question.difficulty.toLowerCase();
              const isSolved = solvedIds.has(question.id);
              return (
                <Link
                  key={question.id}
                  href={`/problems/${question.id}`}
                  className="grid grid-cols-[1fr_100px_80px] gap-4 px-4 py-3 items-center transition-colors hover:bg-neutral-800/40 group"
                >
                  <span className="text-sm text-neutral-300 group-hover:text-neutral-100 transition-colors truncate">
                    <span className="text-neutral-600 mr-2">{index + 1}.</span>
                    {question.title}
                  </span>
                  <span
                    className={`text-xs font-medium capitalize ${difficultyColor[diff] || "text-neutral-400"}`}
                  >
                    {question.difficulty}
                  </span>
                  <span className="text-right text-xs">
                    {isSolved ? (
                      <span className="text-emerald-400" title="Solved">✓</span>
                    ) : (
                      <span className="text-neutral-600">—</span>
                    )}
                  </span>
                </Link>
              );
            },
          )}
        </div>
      </div>

      {questions.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-12">
          No problems available.
        </p>
      )}
    </div>
  );
}
