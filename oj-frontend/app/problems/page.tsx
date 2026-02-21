import { fetchQuestions } from "@/lib/api";
import Link from "next/link";

export default async function ProblemsPage() {
  const questions = await fetchQuestions();

  const difficultyColor: Record<string, string> = {
    easy: "text-emerald-500",
    medium: "text-amber-500",
    hard: "text-red-500",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-xl font-semibold tracking-tight text-neutral-100 mb-6">
        Problems
      </h1>

      <div className="rounded-lg border border-neutral-800 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_100px_80px] gap-4 px-4 py-2.5 bg-neutral-900/60 border-b border-neutral-800 text-xs font-medium text-neutral-500 uppercase tracking-wide">
          <span>Title</span>
          <span>Difficulty</span>
          <span className="text-right">Status</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-neutral-800/60">
          {questions.map(
            (
              question: { id: string; title: string; difficulty: string },
              index: number,
            ) => {
              const diff = question.difficulty.toLowerCase();
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
                  <span className="text-right text-xs text-neutral-600">—</span>
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
