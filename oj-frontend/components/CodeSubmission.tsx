"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { submitSolution } from "@/lib/api";

export default function CodeSubmission({
  questionId,
}: {
  questionId: string;
}) {
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
    } catch {
      setError("Failed to submit code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Submit Solution</h2>

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="javascript">JavaScript</option>
        <option value="python">Python</option>
        <option value="cpp">C++</option>
      </select>

      <Editor
        height="400px"
        language={language}
        value={code}
        theme="vs-dark"
        onChange={(value) => setCode(value || "")}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          automaticLayout: true,
        }}
      />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
