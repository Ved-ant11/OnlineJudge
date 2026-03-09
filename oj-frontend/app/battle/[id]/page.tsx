"use client";
import { useEffect, useState, use } from "react";
import { useBattleSocket } from "@/hooks/useBattleSocket";
import { fetchAuthStatus, getBattle } from "@/lib/api";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

type BattleData = {
  player1Id: string;
  player2Id: string;
  questionId: string;
  status: string;
  winnerId: string | null;
  player1Time: number | null;
  player2Time: number | null;
  player1Hints: number;
  player2Hints: number;
  startedAt: string | null;
  endedAt: string | null;
  question: {
    id: string;
    title: string;
    statement: string;
    examples: unknown;
    constraints: string;
    difficulty?: string;
  };
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function BattleArena({ params }: PageProps) {
  const { id: battleId } = use(params);
  const [userId, setUserId] = useState<string | null>(null);
  const [battleData, setBattleData] = useState<BattleData | null>(null);
  const battle = useBattleSocket(battleId, userId || "");
  const [language, setLanguage] = useState("javascript");
  const boilerplate: Record<string, string> = {
    javascript: `// Read input using readline()\n// All of stdin is also available as: input (string) and lines (array)\n\nconst line = readline();\nconsole.log(line);\n`,
    python: `# Read input using input()\n# Use sys.stdin for bulk reads\n\nline = input()\nprint(line)\n`,
    cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    string line;\n    getline(cin, line);\n    cout << line << endl;\n    return 0;\n}\n`,
  };
  const [code, setCode] = useState(boilerplate["javascript"]);

  useEffect(() => {
    fetchAuthStatus().then((res) => {
      if (res?.id) {
        setUserId(res.id);
      }
    });
    getBattle(battleId)
      .then((res) => {
        setBattleData(res);
      })
      .catch(() => {
        toast.error("Battle not found");
      });
  }, [battleId]);

  const [currentTime, setCurrentTime] = useState(() => Date.now());
  useEffect(() => {
    if (battle.status !== "active") return;
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [battle.status]);

  if (!userId || !battleData) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const { question } = battleData;

  const handleSubmit = () => {
    if (!code.trim()) {
      toast.error("Code cannot be empty");
      return;
    }
    battle.sendSubmit(code, language);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (code === boilerplate[language] || code.trim() === "") {
      setCode(boilerplate[newLang]);
    }
  };

  let timeDisplay = "--:--";
  if (battle.status === "active" && battle.startTime > 0) {
    const timeElapsed = currentTime - battle.startTime;
    const timeLeft = Math.max(0, battle.duration - timeElapsed);
    const m = Math.floor(timeLeft / 60000);
    const s = Math.floor((timeLeft % 60000) / 1000);
    timeDisplay = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#0a0a0a] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-800 bg-[#111] shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-white">Code Battle</h1>
          <span className="px-2 py-1 bg-neutral-800 rounded-md text-xs font-mono text-neutral-400">
            {battleId.substring(0, 8)}
          </span>
        </div>

        <div className="flex flex-col items-center">
          {battle.status === "waiting" && (
            <span className="text-orange-400 font-medium">
              Waiting for opponent...
            </span>
          )}
          {battle.status === "countdown" && (
            <span className="text-3xl font-black text-rose-500 animate-pulse">
              {battle.countdown}
            </span>
          )}
          {battle.status === "active" && (
            <span className="text-2xl font-mono font-bold text-white tracking-widest">
              {timeDisplay}
            </span>
          )}
          {battle.status === "finished" && (
            <span
              className={
                battle.won
                  ? "text-emerald-400 font-bold"
                  : battle.won === false && battle.eloChange === 0
                    ? "text-yellow-400 font-bold"
                    : "text-rose-400 font-bold"
              }
            >
              {battle.won
                ? "VICTORY"
                : battle.eloChange === 0
                  ? "DRAW"
                  : "DEFEAT"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => battle.sendLeave()}
            className="px-4 py-1.5 rounded-md bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 text-sm font-medium transition-colors"
          >
            Forfeit
          </button>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Problem Description */}
        <div className="w-1/2 flex flex-col border-r border-neutral-800 bg-[#0a0a0a]">
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-neutral-100">
                {question.title}
              </h1>
              <span className="px-3 py-1 bg-neutral-800 text-neutral-300 rounded-full text-xs font-semibold uppercase tracking-wider">
                {question.difficulty}
              </span>
            </div>

            <div className="prose prose-invert max-w-none prose-p:text-neutral-400 prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800 prose-code:text-emerald-400">
              <ReactMarkdown>{question.statement}</ReactMarkdown>
            </div>

            <div className="mt-8 pt-8 border-t border-neutral-800/50">
              <h2 className="text-sm font-medium text-neutral-300 mb-3">
                Constraints
              </h2>
              <div className="prose prose-sm prose-invert max-w-none prose-ul:pt-0 prose-li:text-neutral-500">
                <ReactMarkdown>{question.constraints}</ReactMarkdown>
              </div>
            </div>

            {battle.status === "active" && (
              <div className="mt-8 pt-8 border-t border-neutral-800/50">
                <h2 className="text-sm font-medium text-neutral-300 mb-3 flex items-center justify-between">
                  <span>Hints</span>
                  <span className="text-xs text-neutral-500">
                    {3 - battle.hintsUsed} remaining
                  </span>
                </h2>

                {battle.hint && (
                  <div className="p-4 mb-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-sm">
                    <div className="font-bold text-orange-400 mb-1">
                      Latest Hint:
                    </div>
                    {battle.hint}
                  </div>
                )}

                {battle.hintsUsed < 3 && (
                  <button
                    onClick={() => battle.sendHint()}
                    className="w-full py-2.5 rounded-lg border border-neutral-700 text-neutral-400 text-sm hover:bg-neutral-800 hover:text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Request Hint (-
                    {battle.hintsUsed === 0
                      ? "2"
                      : battle.hintsUsed === 1
                        ? "3"
                        : "5"}{" "}
                    mins)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-1/2 flex flex-col bg-[#0d0d0d]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-[#111]">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-neutral-800 text-neutral-300 text-sm rounded-md px-3 py-1 border-none focus:ring-1 focus:ring-neutral-600 outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
            </select>
            <div className="text-xs text-neutral-500">
              {battle.opponentEvents.length > 0 &&
                battle.opponentEvents
                  .map((evt: string, i: number) => (
                    <span
                      key={i}
                      className="animate-fade-in-up text-rose-400 ml-3"
                    >
                      {evt}
                    </span>
                  ))
                  .pop()}
            </div>
          </div>

          <div className="flex-1 min-h-0 py-2">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "JetBrains Mono, monospace",
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                formatOnPaste: true,
                padding: { top: 16 },
              }}
            />
          </div>
          <div className="p-3 border-t border-neutral-800 bg-[#0a0a0a] flex flex-col gap-3">
            {battle.verdict && (
              <div
                className={`p-3 rounded-lg text-sm font-mono ${
                  battle.verdict === "AC"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                <div className="font-bold mb-1">{battle.verdict}</div>
                {battle.verdictMessage && (
                  <div className="text-xs opacity-80 whitespace-pre-wrap">
                    {battle.verdictMessage}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={battle.isSubmitting}
              className="w-full flex h-10 items-center justify-center rounded-lg bg-neutral-100 text-sm font-bold text-neutral-900 transition-colors hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {battle.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-neutral-900 border-t-transparent rounded-full" />
                  Judging...
                </div>
              ) : (
                "Submit Solution"
              )}
            </button>
          </div>
        </div>
      </div>

      {battle.status === "finished" && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#111] border border-neutral-800 rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl transform animate-fade-in-up">
            <h2
              className={`text-4xl font-black mb-2 ${battle.won ? "text-emerald-400" : battle.eloChange === 0 ? "text-yellow-400" : "text-rose-400"}`}
            >
              {battle.won
                ? "VICTORY"
                : battle.eloChange === 0
                  ? "DRAW"
                  : "DEFEAT"}
            </h2>
            <div className="text-neutral-400 mb-8 whitespace-pre-wrap">
              {battle.verdictMessage ||
                (battle.won
                  ? "Opponent couldn't solve first."
                  : battle.eloChange === 0
                    ? "Neither player solved it in time."
                    : "Opponent solved it first.")}
            </div>

            {battle.newRating > 0 ? (
              <div className="bg-neutral-900 rounded-2xl p-6 mb-8 border border-neutral-800">
                <div className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1">
                  New Rating
                </div>
                <div className="text-5xl font-black text-white">
                  {battle.newRating}
                </div>
                <div
                  className={`text-sm font-bold mt-2 ${battle.eloChange >= 0 ? "text-emerald-500" : "text-rose-500"}`}
                >
                  {battle.eloChange > 0 ? "+" : ""}
                  {battle.eloChange}
                </div>
              </div>
            ) : (
              <div className="bg-neutral-900 rounded-2xl p-6 mb-8 border border-neutral-800">
                <div className="text-neutral-500 text-xs font-bold uppercase tracking-widest mb-1">
                  Rating
                </div>
                <div className="text-2xl font-bold text-yellow-400 mt-2">
                  No change
                </div>
              </div>
            )}

            <button
              onClick={() => (window.location.href = "/battle")}
              className="w-full py-4 rounded-xl bg-neutral-800 text-white font-bold hover:bg-neutral-700 transition-colors"
            >
              Return to Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
