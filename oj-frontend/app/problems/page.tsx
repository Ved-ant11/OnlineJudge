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
  const [search, setSearch] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("all");

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

  const filteredQuestions = questions.filter((q) => {
  const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
  const matchesDifficulty = difficulty === "all" || q.difficulty.toLowerCase() === difficulty;
  return matchesSearch && matchesDifficulty;
});


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
      <div className="flex gap-2 mb-4">
        <div className="flex gap-2 mb-4 items-center">
          <div className="relative group">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 group-focus-within:text-violet-400 transition-colors duration-200"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search problems…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                bg-white/[0.03] hover:bg-white/[0.05] focus:bg-white/[0.06]
                border border-white/[0.08] hover:border-white/[0.14] focus:border-violet-500/60
                text-neutral-200 placeholder:text-neutral-600
                rounded-xl pl-9 pr-3 py-2.5
                text-[13px] font-medium tracking-wide
                outline-none
                transition-all duration-200
                caret-violet-400
              "
            />
          </div>

          <div className="relative flex items-center">
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="
                appearance-none
                bg-neutral-900 hover:bg-neutral-800
                border border-neutral-700
                text-neutral-200
                rounded-lg pl-3 pr-7 py-2.5 text-[13px]
                outline-none cursor-pointer
                transition-colors duration-150
                focus:border-neutral-500
              "
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 text-neutral-500 text-[10px] leading-none">
              ▾
            </span>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-neutral-800 overflow-hidden">
        <div className="grid grid-cols-[1fr_100px_80px] gap-4 px-4 py-2.5 bg-neutral-900/60 border-b border-neutral-800 text-xs font-medium text-neutral-500 tracking-wide">
          <span>Title</span>
          <span>Difficulty</span>
          <span className="text-right">Status</span>
        </div>
        <div className="divide-y divide-neutral-800/60">
          {filteredQuestions.map(
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
                  <div className="text-right flex justify-end">
                    {isSolved ? (
                      <div title="Solved" className="text-emerald-500 bg-emerald-500/10 p-1 rounded-full">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    ) : (
                      <span className="text-neutral-600">—</span>
                    )}
                  </div>
                </Link>
              );
            },
          )}
        </div>
      </div>

      {filteredQuestions.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-12">
          No problems available.
        </p>
      )}
    </div>
  );
}
