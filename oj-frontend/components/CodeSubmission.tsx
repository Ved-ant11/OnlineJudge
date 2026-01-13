"use client";

import { useState } from "react";
import { submitSolution } from "@/lib/api";

export default function CodeSubmission({
  questionId,
}: {
  questionId: string;
}) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!code.trim()) {
      setMessage("Code cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const res = await submitSolution({
        code,
        language,
        questionId,
      });

      setMessage(`Submission received. ID: ${res.submissionId}`);
    } catch (error) {
      console.error(error);
      setMessage("Failed to submit code. Please try again.");
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

      <br />

      <textarea
        rows={10}
        cols={80}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Write your code here..."
      />

      <br />

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Submitting..." : "Submit"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}
