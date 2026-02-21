import { fetchQuestionById } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import CodeSubmission from "@/components/CodeSubmission";
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
      {/* Left Panel — Problem Description */}
      <div className="flex-1 min-w-0 overflow-y-auto border-r border-neutral-800">
        <div className="max-w-3xl px-6 py-8 lg:px-10">
          {/* Back */}
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

          {/* Title + Difficulty */}
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

          {/* Statement */}
          <div
            className="mb-8 prose prose-sm prose-invert max-w-none
              prose-headings:text-neutral-200 prose-headings:font-medium
              prose-p:text-neutral-400 prose-p:leading-relaxed
              prose-strong:text-neutral-200
              prose-code:text-neutral-300 prose-code:bg-neutral-800
              prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
              prose-code:before:content-none prose-code:after:content-none
              prose-ul:text-neutral-400 prose-li:text-neutral-400"
          >
            <ReactMarkdown>{question.statement}</ReactMarkdown>
          </div>

          {/* Examples */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-neutral-300 mb-4">
              Examples
            </h2>
            <div className="space-y-4">
              {question.examples.map(
                (
                  example: {
                    input: string;
                    output: string;
                    explanation?: string;
                  },
                  index: number,
                ) => (
                  <div
                    key={index}
                    className="rounded-md border border-neutral-800 bg-neutral-900/50 p-4 space-y-3"
                  >
                    <p className="text-xs font-medium text-neutral-500 mb-2">
                      Example {index + 1}
                    </p>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Input</p>
                      <pre className="rounded bg-neutral-900 border border-neutral-800 px-3 py-2 font-mono text-xs text-neutral-300 overflow-x-auto">
                        {example.input}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Output</p>
                      <pre className="rounded bg-neutral-900 border border-neutral-800 px-3 py-2 font-mono text-xs text-neutral-300 overflow-x-auto">
                        {example.output}
                      </pre>
                    </div>
                    {example.explanation && (
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        <span className="text-neutral-400">Explanation: </span>
                        {example.explanation}
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Constraints */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-neutral-300 mb-3">
              Constraints
            </h2>
            <div className="prose prose-sm prose-invert max-w-none prose-p:text-neutral-400 prose-li:text-neutral-400 prose-li:text-xs prose-p:text-xs">
              <ReactMarkdown>{question.constraints}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Editor */}
      <div className="hidden lg:flex w-[50%] xl:w-[55%] flex-col bg-[#0d0d0d]">
        <div className="flex-1 min-h-0 p-3">
          <CodeSubmission questionId={question.id} />
        </div>
      </div>

      {/* Mobile — bottom bar */}
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
