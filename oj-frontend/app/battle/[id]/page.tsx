"use client";
import { useEffect, useState, use } from "react";
import { useBattleSocket } from "@/hooks/useBattleSocket";
import { fetchAuthStatus, getBattle } from "@/lib/api";
import ReconnectTimer from "@/components/ReconnectComp";
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
        <div className="h-5 w-5 border-2 border-neutral-700 border-t-neutral-300 rounded-full animate-spin" />
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

  const getDifficultyStyle = (d?: string) => {
    switch (d?.toUpperCase()) {
      case "EASY":
        return "text-emerald-400 bg-emerald-400/10";
      case "MEDIUM":
        return "text-amber-400 bg-amber-400/10";
      case "HARD":
        return "text-rose-400 bg-rose-400/10";
      default:
        return "text-neutral-400 bg-neutral-400/10";
    }
  };

  const latestOpponentEvent =
    battle.opponentEvents.length > 0
      ? battle.opponentEvents[battle.opponentEvents.length - 1]
      : null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#0a0a0a] overflow-hidden">
      <div className="flex items-center justify-between px-5 h-12 border-b border-neutral-800/70 bg-[#0a0a0a] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-neutral-300">Battle</span>
          <span className="text-xs text-neutral-600 font-mono">
            {battleId.substring(0, 8)}
          </span>
        </div>

        <div className="flex items-center">
          {battle.status === "waiting" && (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-sm text-neutral-400">
                Waiting for opponent
              </span>
            </div>
          )}
          {battle.status === "countdown" && (
            <span className="text-2xl font-bold text-white tabular-nums animate-pulse">
              {battle.countdown}
            </span>
          )}
          {battle.status === "active" && (
            <span className="text-lg font-mono font-semibold text-white tabular-nums tracking-wider">
              {timeDisplay}
            </span>
          )}
          {battle.status === "finished" && (
            <span
              className={`text-sm font-semibold ${
                battle.won
                  ? "text-emerald-400"
                  : battle.eloChange === 0
                    ? "text-amber-400"
                    : "text-rose-400"
              }`}
            >
              {battle.won
                ? "Victory"
                : battle.eloChange === 0
                  ? "Draw"
                  : "Defeat"}
            </span>
          )}
        </div>
        {battle.status === "active" && (
          <button
            onClick={() => battle.sendLeave()}
            className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            Forfeit
          </button>
        )}
      </div>

      {battle.opponentDisconnected && battle.status === "active" && (
        <div className="w-full border-b border-orange-500/20 bg-orange-500/10 px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-sm font-medium text-orange-400">
              Opponent disconnected
            </span>
          </div>
          <ReconnectTimer />
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 flex flex-col border-r border-neutral-800/70">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-xl">
              <div className="flex items-start justify-between gap-4 mb-8">
                <h1 className="text-xl font-semibold text-white leading-snug">
                  {question.title}
                </h1>
                {question.difficulty && (
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider shrink-0 ${getDifficultyStyle(question.difficulty)}`}
                  >
                    {question.difficulty}
                  </span>
                )}
              </div>

              <div className="prose prose-invert prose-sm max-w-none prose-p:text-neutral-400 prose-p:leading-relaxed prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800 prose-code:text-emerald-400 prose-headings:text-neutral-200 prose-headings:font-medium prose-strong:text-neutral-300">
                <ReactMarkdown>{question.statement}</ReactMarkdown>
              </div>

              {question.constraints && (
                <div className="mt-10 pt-8 border-t border-neutral-800/50">
                  <h2 className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-4">
                    Constraints
                  </h2>
                  <div className="prose prose-sm prose-invert max-w-none prose-p:text-neutral-500 prose-li:text-neutral-500 prose-ul:mt-0">
                    <ReactMarkdown>{question.constraints}</ReactMarkdown>
                  </div>
                </div>
              )}

              {battle.status === "active" && (
                <div className="mt-10 pt-8 border-t border-neutral-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                      Hints
                    </h2>
                    <span className="text-[11px] text-neutral-600 tabular-nums">
                      {3 - battle.hintsUsed} remaining
                    </span>
                  </div>

                  {battle.hint && (
                    <div className="p-4 mb-4 rounded-lg bg-orange-500/5 border border-orange-500/10 text-sm text-orange-200/90 leading-relaxed">
                      {battle.hint}
                    </div>
                  )}

                  {battle.hintsUsed < 3 && (
                    <button
                      onClick={() => battle.sendHint()}
                      className="w-full py-2.5 rounded-lg border border-neutral-800 text-neutral-500 text-xs font-medium hover:border-neutral-700 hover:text-neutral-300 transition-colors"
                    >
                      Request Hint
                      <span className="text-neutral-600 ml-1">
                        (−
                        {battle.hintsUsed === 0
                          ? "2"
                          : battle.hintsUsed === 1
                            ? "3"
                            : "5"}{" "}
                        min)
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-1/2 flex flex-col">
          <div className="flex items-center justify-between px-4 h-10 border-b border-neutral-800/70 shrink-0">
            <select
              value={language}
              onChange={handleLanguageChange}
              className="bg-transparent text-neutral-400 text-xs rounded px-1 py-0.5 border-none focus:ring-0 outline-none cursor-pointer hover:text-neutral-200 transition-colors"
            >
              <option value="javascript" className="bg-neutral-900">
                JavaScript
              </option>
              <option value="python" className="bg-neutral-900">
                Python
              </option>
              <option value="cpp" className="bg-neutral-900">
                C++
              </option>
            </select>
            {latestOpponentEvent && (
              <span className="text-[11px] text-rose-400/80 animate-fade-in-up">
                {latestOpponentEvent}
              </span>
            )}
          </div>

          <div className="flex-1 min-h-0">
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
                renderLineHighlight: "none",
                overviewRulerBorder: false,
                hideCursorInOverviewRuler: true,
                scrollbar: {
                  verticalScrollbarSize: 6,
                  horizontalScrollbarSize: 6,
                },
              }}
            />
          </div>

          <div className="p-3 border-t border-neutral-800/70 shrink-0">
            {battle.verdict && (
              <div
                className={`px-3.5 py-2.5 rounded-lg text-sm mb-3 ${
                  battle.verdict === "AC"
                    ? "bg-emerald-500/8 text-emerald-400 border border-emerald-500/15"
                    : "bg-rose-500/8 text-rose-400 border border-rose-500/15"
                }`}
              >
                <span className="font-semibold text-xs">{battle.verdict}</span>
                {battle.verdictMessage && (
                  <p className="text-xs mt-1 opacity-70 whitespace-pre-wrap leading-relaxed">
                    {battle.verdictMessage}
                  </p>
                )}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={battle.isSubmitting || battle.status !== "active"}
              className="w-full h-9 flex items-center justify-center rounded-lg bg-white text-neutral-900 text-sm font-medium transition-all hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {battle.isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin" />
                  <span>Judging</span>
                </div>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </div>

      {battle.status === "finished" && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up">
          <div className="w-full max-w-xs bg-[#111] border border-neutral-800 rounded-2xl p-8 text-center">
            <div
              className={`text-3xl font-bold mb-1.5 ${
                battle.won
                  ? "text-emerald-400"
                  : battle.eloChange === 0
                    ? "text-amber-400"
                    : "text-rose-400"
              }`}
            >
              {battle.won
                ? "Victory"
                : battle.eloChange === 0
                  ? "Draw"
                  : "Defeat"}
            </div>
            <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
              {battle.verdictMessage ||
                (battle.won
                  ? "You solved it first."
                  : battle.eloChange === 0
                    ? "Neither player solved it in time."
                    : "Your opponent solved it first.")}
            </p>

            {battle.newRating > 0 ? (
              <div className="mb-8">
                <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-2">
                  New Rating
                </div>
                <div className="text-4xl font-bold text-white tabular-nums">
                  {battle.newRating}
                </div>
                <div
                  className={`text-sm font-semibold mt-1.5 tabular-nums ${
                    battle.eloChange >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {battle.eloChange > 0 ? "+" : ""}
                  {battle.eloChange}
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-2">
                  Rating
                </div>
                <div className="text-lg font-medium text-neutral-400">
                  No change
                </div>
              </div>
            )}
            <button
              onClick={() => (window.location.href = "/battle")}
              className="w-full py-2.5 rounded-lg bg-neutral-800 text-white text-sm font-medium hover:bg-neutral-700 transition-colors active:scale-[0.98]"
            >
              Back to Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
