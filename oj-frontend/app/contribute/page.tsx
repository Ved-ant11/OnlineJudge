"use client";
import { useState } from "react";
import toast from "react-hot-toast";

type Example = { input: string; output: string; explanation: string };
type TestCase = { input: string; expectedOutput: string; isHidden: boolean; timeLimitMs: number };

export default function Contribute() {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("EASY");
  const [statement, setStatement] = useState("");
  const [constraints, setConstraints] = useState("");
  const [examples, setExamples] = useState<Example[]>([
    { input: "", output: "", explanation: "" },
  ]);
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: "", expectedOutput: "", isHidden: false, timeLimitMs: 2000 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const updateExample = (index: number, field: keyof Example, value: string) => {
    const updated = [...examples];
    updated[index] = { ...updated[index], [field]: value };
    setExamples(updated);
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: string | boolean | number) => {
    const updated = [...testCases];
    updated[index] = { ...updated[index], [field]: value };
    setTestCases(updated);
  };

  const removeExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const removeTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !statement.trim()) {
      toast.error("Title and statement are required");
      return;
    }
    if (testCases.length === 0) {
      toast.error("At least one test case is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          difficulty,
          statement,
          constraints,
          examples,
          testCases,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to submit problem");
      }

      toast.success("Problem submitted successfully!");
      setTitle("");
      setDifficulty("EASY");
      setStatement("");
      setConstraints("");
      setExamples([{ input: "", output: "", explanation: "" }]);
      setTestCases([{ input: "", expectedOutput: "", isHidden: false, timeLimitMs: 2000 }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-neutral-200 text-sm placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 transition-colors";

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-neutral-100">Contribute</h1>
      <p className="mt-1 text-sm text-neutral-500 mb-8">
        Help us <span className="text-amber-400">improve</span> the platform
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title + Difficulty */}
        <div className="grid grid-cols-[1fr_140px] gap-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">Title</label>
            <input
              type="text"
              placeholder="e.g. Two Sum"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-1.5">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className={inputClass}
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>

        {/* Statement */}
        <div>
          <label className="block text-sm text-neutral-400 mb-1.5">Problem Statement</label>
          <textarea
            rows={6}
            placeholder="Describe the problem clearly. You can use markdown."
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Constraints */}
        <div>
          <label className="block text-sm text-neutral-400 mb-1.5">Constraints</label>
          <textarea
            rows={3}
            placeholder={"e.g.\n- 1 ≤ n ≤ 10⁴\n- -10⁹ ≤ nums[i] ≤ 10⁹"}
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Examples */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-neutral-400">Examples</label>
            <button
              type="button"
              onClick={() => setExamples([...examples, { input: "", output: "", explanation: "" }])}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              + Add Example
            </button>
          </div>
          <div className="space-y-4">
            {examples.map((ex, i) => (
              <div key={i} className="p-4 rounded-lg border border-neutral-800 bg-neutral-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Example {i + 1}</span>
                  {examples.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExample(i)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  placeholder="Input (e.g. nums = [2,7,11,15], target = 9)"
                  value={ex.input}
                  onChange={(e) => updateExample(i, "input", e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="Output (e.g. [0,1])"
                  value={ex.output}
                  onChange={(e) => updateExample(i, "output", e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="Explanation (optional)"
                  value={ex.explanation}
                  onChange={(e) => updateExample(i, "explanation", e.target.value)}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Test Cases */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm text-neutral-400">Test Cases</label>
            <button
              type="button"
              onClick={() =>
                setTestCases([...testCases, { input: "", expectedOutput: "", isHidden: false, timeLimitMs: 2000 }])
              }
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              + Add Test Case
            </button>
          </div>
          <div className="space-y-4">
            {testCases.map((tc, i) => (
              <div key={i} className="p-4 rounded-lg border border-neutral-800 bg-neutral-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">Test Case {i + 1}</span>
                  {testCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTestCase(i)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <textarea
                  rows={2}
                  placeholder="Input (exactly as stdin)"
                  value={tc.input}
                  onChange={(e) => updateTestCase(i, "input", e.target.value)}
                  className={inputClass}
                />
                <textarea
                  rows={2}
                  placeholder="Expected Output (exactly as stdout)"
                  value={tc.expectedOutput}
                  onChange={(e) => updateTestCase(i, "expectedOutput", e.target.value)}
                  className={inputClass}
                />
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-neutral-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tc.isHidden}
                      onChange={(e) => updateTestCase(i, "isHidden", e.target.checked)}
                      className="accent-amber-400"
                    />
                    Hidden
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-neutral-400">Time Limit</label>
                    <input
                      type="number"
                      value={tc.timeLimitMs}
                      onChange={(e) => updateTestCase(i, "timeLimitMs", Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-neutral-200 text-sm"
                    />
                    <span className="text-xs text-neutral-500">ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-md bg-amber-500 text-neutral-900 font-medium text-sm hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting..." : "Submit Problem"}
        </button>
      </form>
    </div>
  );
}