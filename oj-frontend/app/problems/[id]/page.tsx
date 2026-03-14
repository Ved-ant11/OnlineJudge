import CodeSubmission from "@/components/CodeSubmission";
import ProblemTabs from "@/components/ProblemTabs";
import { fetchQuestionById } from "@/lib/api";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProblemDetailPage({ params }: PageProps) {
  const { id } = await params;
  const question = await fetchQuestionById(id);

  const difficultyColor: Record<string, string> = {
    easy: "text-emerald-500",
    medium: "text-amber-500",
    hard: "text-red-500",
  };

  const diffKey = question.difficulty.toLowerCase();

  return (
    <div className="flex h-[calc(100vh-3rem)] overflow-hidden">
      <div className="flex-1 min-w-0 overflow-y-auto border-r border-neutral-800">
        <div className="max-w-3xl px-6 py-8 lg:px-10">
          <Link
            href="/problems"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors mb-6"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M10 7H4M4 7L6.5 4.5M4 7L6.5 9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Problems
          </Link>
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-100 mb-2">
              {question.title}
            </h1>
            <span
              className={`text-xs font-medium capitalize ${difficultyColor[diffKey] || "text-neutral-400"}`}
            >
              {question.difficulty}
            </span>
          </div>
          <ProblemTabs question={question} />
        </div>
      </div>

      <div className="hidden lg:flex w-[50%] xl:w-[55%] flex-col bg-[#0d0d0d]">
        <div className="flex-1 min-h-0 p-3">
          <CodeSubmission questionId={question.id} />
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-neutral-800 bg-[#0a0a0a] p-3">
        <Link
          href={`/problems/${question.id}#editor`}
          className="flex h-10 w-full items-center justify-center rounded-md bg-neutral-100 text-sm font-medium text-neutral-900"
        >
          Open Editor
        </Link>
      </div>
    </div>
  );
}
