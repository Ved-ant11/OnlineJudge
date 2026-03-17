"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { fetchAuthStatus, fetchRoom, fetchQuestionById } from "@/lib/api";
import { useRoomSocket } from "@/hooks/useRoomSocket";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

type PageProps = {
  params: Promise<{ code: string }>;
};

export default function RoomArena({ params }: PageProps) {
  const router = useRouter();
  const { code: roomCode } = use(params);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [language, setLanguage] = useState("cpp");
  const boilerplate: Record<string, string> = {
    javascript: "function solve() {\n  // your code here\n}\n",
    python: "def solve():\n    # your code here\n    pass\n",
    cpp: "#include <iostream>\nusing namespace std;\n\nint main() {\n  // your code here\n  return 0;\n}\n",
  };
  const [code, setCode] = useState(boilerplate["cpp"]);
  const [question, setQuestion] = useState<{
    title: string;
    statement: string;
    difficulty: string;
    examples: unknown;
  } | null>(null);

  const {
    status,
    players,
    ownerId,
    questionId,
    events,
    leaderboard,
    sendReady,
    sendStart,
    sendSubmit,
    sendEnd,
  } = useRoomSocket(roomId || "", userId || "");

  useEffect(() => {
    const init = async () => {
      try {
        const auth = await fetchAuthStatus();
        if (!auth) {
          router.push("/login");
          return;
        }
        setUserId(auth.id);
        const joinRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/rooms/${roomCode}/join`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          },
        );

        if (!joinRes.ok) {
          router.push("/rooms");
          toast.error("Failed to join room");
          return;
        }

        const joinData = await joinRes.json();
        setRoomId(joinData.roomId);

        const roomData = await fetchRoom(joinData.roomId);
        if (roomData.questionId) {
          const q = await fetchQuestionById(roomData.questionId);
          setQuestion(q);
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading room");
        router.push("/rooms");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [roomCode, router]);

  useEffect(() => {
    if (questionId && !question) {
      fetchQuestionById(questionId).then(setQuestion).catch(console.error);
    }
  }, [questionId, question]);

  if (loading || status === "connecting") {
    return (
      <div className="flex h-[calc(100vh-3rem)] items-center justify-center bg-[#0a0a0a]">
        <svg
          className="h-5 w-5 animate-spin text-neutral-700"
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
      </div>
    );
  }

  const isOwner = ownerId === userId;
  const me = players.find((p) => p.userId === userId);
  const amIReady = me?.isReady || false;
  const allReady = players.length > 0 && players.every((p) => p.isReady);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  };

  const difficultyColor = (d: string) => {
    switch (d?.toUpperCase()) {
      case "EASY":
        return "text-emerald-500";
      case "MEDIUM":
        return "text-amber-500";
      case "HARD":
        return "text-red-500";
      default:
        return "text-neutral-500";
    }
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] bg-[#0a0a0a] text-neutral-300 overflow-hidden">
      <div className="flex w-1/2 flex-col border-r border-neutral-800/60 bg-[#0d0d0d] overflow-y-auto">
        {status === "WAITING" ? (
          <div className="p-8 h-full flex flex-col justify-center max-w-md mx-auto w-full">
            <div className="mb-10 text-center">
              <span className="font-mono-custom text-[10px] tracking-[0.25em] uppercase text-neutral-500 block mb-3">
                Room Code
              </span>
              <div className="inline-flex items-center gap-4 bg-[#111111] border border-neutral-800 rounded-lg px-6 py-3">
                <span className="font-mono-custom text-[24px] tracking-[0.2em] text-white font-bold">
                  {roomCode}
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(roomCode);
                    toast.success("Code copied!");
                  }}
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="border border-neutral-800/60 rounded-lg bg-[#111111] overflow-hidden mb-8">
              <div className="px-5 py-3 border-b border-neutral-800/60 bg-[#0f0f0f]">
                <span className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-neutral-500">
                  Players ({players.length})
                </span>
              </div>
              <div className="divide-y divide-neutral-800/40">
                {players.map((p) => (
                  <div
                    key={p.userId}
                    className="px-5 py-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center font-mono-custom text-[11px] text-white">
                        {p.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-sans text-[14px] font-medium text-neutral-300">
                        {p.username}{" "}
                        {p.userId === ownerId && (
                          <span className="text-amber-500 ml-1">👑</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${p.isConnected ? "bg-emerald-400" : "bg-red-400"}`}
                        ></span>
                        <span
                          className={`relative inline-flex rounded-full h-2 w-2 ${p.isConnected ? "bg-emerald-500" : "bg-red-500"}`}
                        ></span>
                      </span>
                      <span
                        className={`font-mono-custom text-[10px] tracking-widest uppercase ${p.isReady ? "text-emerald-500" : "text-neutral-600"}`}
                      >
                        {p.isReady ? "Ready" : "Not Ready"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => sendReady(!amIReady)}
                className={`w-full h-12 rounded-md font-mono-custom text-[11px] tracking-[0.14em] uppercase font-medium transition-colors duration-200 ${
                  amIReady
                    ? "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                    : "bg-white text-[#0a0a0a] hover:bg-neutral-200"
                }`}
              >
                {amIReady ? "Cancel Ready" : "Ready Up"}
              </button>

              {isOwner && (
                <button
                  onClick={sendStart}
                  disabled={!allReady}
                  className="w-full h-12 rounded-md bg-emerald-600 font-mono-custom text-[11px] tracking-[0.14em] uppercase font-medium text-white hover:bg-emerald-500 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Start Match
                </button>
              )}
            </div>
          </div>
        ) : status === "COMPLETED" ? (
          <div className="p-8 h-full flex flex-col items-center justify-center max-w-md mx-auto w-full">
            <h2 className="font-sans text-[32px] font-bold text-white mb-8 tracking-[-0.02em]">
              Match Results
            </h2>
            <div className="w-full border border-neutral-800/60 rounded-lg bg-[#111111] overflow-hidden">
              <div className="px-5 py-3 border-b border-neutral-800/60 bg-[#0f0f0f] grid grid-cols-[40px_1fr_80px]">
                <span className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-neutral-500">
                  Rank
                </span>
                <span className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-neutral-500">
                  Player
                </span>
                <span className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-neutral-500 text-right">
                  Time
                </span>
              </div>
              <div className="divide-y divide-neutral-800/40">
                {leaderboard.map((player, i) => (
                  <div
                    key={i}
                    className="px-5 py-4 grid grid-cols-[40px_1fr_80px] items-center"
                  >
                    <span
                      className={`font-mono-custom text-[12px] font-bold ${
                        i === 0
                          ? "text-amber-400"
                          : i === 1
                            ? "text-neutral-400"
                            : i === 2
                              ? "text-amber-700"
                              : "text-neutral-600"
                      }`}
                    >
                      #{i + 1}
                    </span>
                    <span className="font-sans text-[14px] font-medium text-neutral-300">
                      {player.username}
                    </span>
                    <span className="font-mono-custom text-[12px] text-emerald-500 text-right">
                      {formatTime(player.time)}
                    </span>
                  </div>
                ))}
                {players
                  .filter(
                    (p) => !leaderboard.find((l) => l.username === p.username),
                  )
                  .map((p, i) => (
                    <div
                      key={`dnf-${i}`}
                      className="px-5 py-4 grid grid-cols-[40px_1fr_80px] items-center opacity-50"
                    >
                      <span className="font-mono-custom text-[12px] font-bold text-neutral-600">
                        -
                      </span>
                      <span className="font-sans text-[14px] font-medium text-neutral-300">
                        {p.username}
                      </span>
                      <span className="font-mono-custom text-[12px] text-red-500 text-right">
                        DNF
                      </span>
                    </div>
                  ))}
              </div>
            </div>
            <button
              onClick={() => router.push("/rooms")}
              className="mt-8 w-full h-12 rounded-md bg-white font-mono-custom text-[11px] tracking-[0.14em] uppercase font-medium text-[#0a0a0a] hover:bg-neutral-200 transition-colors duration-200"
            >
              Back to Rooms
            </button>
          </div>
        ) : (
          question && (
            <div className="p-6 h-full overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="font-sans text-[24px] font-bold text-white tracking-[-0.02em] mb-2">
                    {question.title}
                  </h1>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono-custom text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-full border border-neutral-800 ${difficultyColor(question.difficulty)}`}
                    >
                      {question.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              <div className="prose prose-invert prose-sm max-w-none text-[13px] leading-relaxed text-neutral-400 font-sans mb-10">
                <ReactMarkdown>{question.statement}</ReactMarkdown>
              </div>

              <div className="space-y-6">
                {question.examples
                  ? (
                      question.examples as {
                        input: string;
                        output: string;
                        explanation?: string;
                      }[]
                    ).map((ex, i) => (
                      <div key={i}>
                        <span className="font-mono-custom text-[10px] tracking-[0.15em] uppercase text-neutral-500 mb-2 block">
                          Example {i + 1}
                        </span>
                        <div className="bg-[#111111] border border-neutral-800/60 rounded-md p-4 font-mono-custom text-[11px] text-neutral-300">
                          <div className="mb-2">
                            <span className="text-neutral-500">Input:</span>{" "}
                            {ex.input}
                          </div>
                          <div className="mb-2">
                            <span className="text-neutral-500">Output:</span>{" "}
                            {ex.output}
                          </div>
                          {ex.explanation && (
                            <div>
                              <span className="text-neutral-500">
                                Explanation:
                              </span>{" "}
                              {ex.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  : null}
              </div>
            </div>
          )
        )}
      </div>
      <div className="flex w-1/2 flex-col bg-[#1e1e1e]">
        <div className="flex items-center justify-between px-4 py-2 bg-[#0f0f0f] border-b border-neutral-800">
          <select
            value={language}
            onChange={(e) => {
              const newLang = e.target.value;
              setLanguage(newLang);
              setCode(boilerplate[newLang] || "");
            }}
            style={{ colorScheme: "dark" }}
            className="bg-[#1a1a1a] border border-neutral-700 text-neutral-300 text-[11px] font-mono-custom tracking-wider rounded px-2.5 py-1.5 outline-none cursor-pointer"
            disabled={status !== "ACTIVE"}
          >
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>

          <div className="flex items-center gap-3">
            {isOwner && status === "ACTIVE" && (
              <button
                onClick={sendEnd}
                className="h-7 px-4 bg-red-600/20 text-red-500 border border-red-500/30 rounded text-[10px] font-mono-custom tracking-widest uppercase hover:bg-red-600/30 transition-colors"
              >
                End Match
              </button>
            )}
            <button
              onClick={() => sendSubmit(code, language)}
              disabled={status !== "ACTIVE" || me?.hasFinished}
              className="h-7 px-4 bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 rounded text-[10px] font-mono-custom tracking-widest uppercase hover:bg-emerald-600/30 transition-colors disabled:opacity-50"
            >
              Submit Code
            </button>
          </div>
        </div>
        <div className="flex-1 relative">
          <Editor
            height="100%"
            language={language === "cpp" ? "cpp" : language}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "var(--font-geist-mono)",
              scrollBeyondLastLine: false,
              padding: { top: 16 },
              readOnly: status !== "ACTIVE" || me?.hasFinished,
            }}
          />
          {status === "WAITING" && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <span className="font-mono-custom text-[11px] tracking-[0.2em] uppercase text-neutral-400">
                Waiting for match to start
              </span>
            </div>
          )}
        </div>

        {/* Events Terminal */}
        <div className="h-48 bg-[#0a0a0a] border-t border-neutral-800 flex flex-col">
          <div className="px-4 py-2 border-b border-neutral-800/60 bg-[#0f0f0f] flex justify-between items-center">
            <span className="font-mono-custom text-[9px] tracking-[0.2em] uppercase text-neutral-500">
              Live Events
            </span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto font-mono-custom text-[11px] space-y-1.5 custom-scrollbar">
            {events.length === 0 ? (
              <span className="text-neutral-700">No events yet...</span>
            ) : (
              events.map((ev, i) => (
                <div key={i} className="text-neutral-400">
                  <span className="text-neutral-600 mr-2">›</span>
                  {ev}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
