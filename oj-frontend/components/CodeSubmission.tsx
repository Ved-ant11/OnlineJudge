"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { submitSolution } from "@/lib/api";

export default function CodeSubmission({ questionId }: { questionId: string }) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Code cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await submitSolution({
        code,
        language,
        questionId,
      });

      router.push(`/submissions/${res.submissionId}`);
    } catch (err) {
      if (err instanceof Error && err.message === "Not authenticated") {
          router.push("/login");
      } else {
        setError("Failed to submit. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fileExtension =
    language === "javascript" ? "js" : language === "python" ? "py" : "cpp";

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="h-8 appearance-none rounded-md border border-neutral-800 bg-neutral-900 px-3 pr-7 text-xs font-medium text-neutral-300 outline-none transition-colors hover:border-neutral-700 focus:border-neutral-600 cursor-pointer"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
          <span className="text-xs text-neutral-600 font-mono">
            solution.{fileExtension}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 rounded-md border border-neutral-800 overflow-hidden bg-[#1e1e1e]">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme="vs-dark"
          onChange={(value) => setCode(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "var(--font-geist-mono), monospace",
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            scrollBeyondLastLine: false,
            renderLineHighlight: "none",
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
            lineNumbers: "on",
            lineDecorationsWidth: 14,
            lineNumbersMinChars: 4,
            glyphMargin: false,
            folding: false,
          }}
        />
      </div>

      {error && <p className="shrink-0 text-xs text-red-400 px-1">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="shrink-0 flex h-9 w-full items-center justify-center rounded-md bg-neutral-100 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <svg
            className="h-4 w-4 animate-spin text-neutral-600"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              strokeOpacity="0.2"
            />
            <path
              d="M12 2a10 10 0 0 1 10 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          "Submit"
        )}
      </button>
    </div>
  );
}
