"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import SubmissionHistory from "@/components/SubmissionHistory";
import Discussion from "@/components/Discussion";

type ProblemTabsProps = {
  question: {
    id: string;
    statement: string;
    examples: { input: string; output: string; explanation?: string }[];
    constraints: string;
  };
};

export default function ProblemTabs({ question }: ProblemTabsProps) {
  const [activeTab, setActiveTab] = useState<"description" | "submissions" | "discussion">("description");

  return (
    <div>
      <div className="flex border-b border-neutral-800 mb-6">
        <button
          onClick={() => setActiveTab("description")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "description"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab("discussion")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "discussion"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Discussion
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "submissions"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-neutral-500 hover:text-neutral-300"
          }`}
        >
          Submissions
        </button>
      </div>

      <div className="mt-4">
        {activeTab === "description" && (
          <>
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

            <div className="mb-8">
              <h2 className="text-sm font-medium text-neutral-300 mb-4">
                Examples
              </h2>
              <div className="space-y-4">
                {question.examples.map((example, index) => (
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
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-sm font-medium text-neutral-300 mb-3">
                Constraints
              </h2>
              <div className="prose prose-sm prose-invert max-w-none prose-p:text-neutral-400 prose-li:text-neutral-400 prose-li:text-xs prose-p:text-xs">
                <ReactMarkdown>{question.constraints}</ReactMarkdown>
              </div>
            </div>
          </>
        )}

        {activeTab === "discussion" && (
          <Discussion questionId={question.id} />
        )}

        {activeTab === "submissions" && (
          <SubmissionHistory questionId={question.id} />
        )}
      </div>
    </div>
  );
}
