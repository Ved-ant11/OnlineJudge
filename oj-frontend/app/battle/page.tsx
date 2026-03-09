"use client";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchAuthStatus, getBattleHistory } from "@/lib/api";

type BattleHistoryEntry = {
  id: string;
  status: string;
  won: boolean;
  draw: boolean;
  opponent: string;
  opponentRating: number;
  question: {
    id: string;
    title: string;
    difficulty: string;
  };
  timeTaken: number | null;
  createdAt: string;
  endedAt: string | null;
};

export default function Battle() {
  const router = useRouter();
  const { searching, battleId, startSearching, cancelSearching } =
    useMatchmaking();
  const [authStatus, setAuthStatus] = useState<{
    isLoggedIn: boolean;
    userId: string | null;
  }>({
    isLoggedIn: false,
    userId: null,
  });
  const [stats, setStats] = useState({
    rating: 1200,
    battlesPlayed: 0,
    battlesWon: 0,
  });
  const [history, setHistory] = useState<BattleHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const status = await fetchAuthStatus();
        if (status && status.username) {
          setAuthStatus({
            isLoggedIn: true,
            userId: status.username,
          });
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"}/user/me`,
            {
              credentials: "include",
            },
          );
          if (res.ok) {
            const userData = await res.json();
            setStats({
              rating: userData.rating || 1200,
              battlesPlayed: userData.battlesPlayed || 0,
              battlesWon: userData.battlesWon || 0,
            });
          }

          try {
            const battles = await getBattleHistory();
            setHistory(battles);
          } catch (err) {
            console.error("Failed to fetch battle history", err);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user data", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (battleId) {
      router.push(`/battle/${battleId}`);
    }
  }, [battleId, router]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}m ${s.toString().padStart(2, "0")}s`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toUpperCase()) {
      case "EASY":
        return "text-emerald-400";
      case "MEDIUM":
        return "text-yellow-400";
      case "HARD":
        return "text-rose-400";
      default:
        return "text-neutral-400";
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!authStatus.isLoggedIn) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6 dot-grid overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-orange-600/20 via-red-600/20 to-amber-500/20 rounded-full blur-[100px] animate-glow-pulse pointer-events-none" />
        <div className="relative z-10 w-full max-w-md text-center bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-10 shadow-2xl">
          <div className="mx-auto w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
            <svg
              className="w-8 h-8 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Sign in Required
          </h2>
          <p className="text-neutral-400 mb-8">
            You need to log in to participate in 1v1 Code Battles.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-neutral-200 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12 dot-grid overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-red-500/15 via-orange-500/15 to-amber-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-neutral-100 mb-4 flex items-center justify-center gap-3">
            <svg
              className="w-10 h-10 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Code Battle
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Match up against an opponent of similar skill. First to solve the
            problem wins.
          </p>
        </div>

        <div className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>

          <div className="grid grid-cols-3 gap-6 text-center mb-10 divide-x divide-neutral-800">
            <div className="flex flex-col items-center">
              <span className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>{" "}
                Rating
              </span>
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {stats.rating}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>{" "}
                Played
              </span>
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {stats.battlesPlayed}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>{" "}
                Won
              </span>
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {stats.battlesWon}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center pt-2">
            {searching ? (
              <div className="flex flex-col items-center gap-6 w-full animate-fade-in">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20 duration-1000"></div>
                  <div className="absolute inset-0 bg-orange-500 rounded-full animate-pulse opacity-40 blur-xl"></div>
                  <div className="relative rounded-full p-5 bg-neutral-900 border border-orange-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.3)]">
                    <svg
                      className="w-8 h-8 text-orange-400 animate-pulse"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-medium text-white mb-1">
                    Searching for opponent...
                  </h3>
                  <p className="text-neutral-400 text-sm">
                    Estimated wait time: ~10 seconds
                  </p>
                </div>

                <button
                  onClick={cancelSearching}
                  className="mt-2 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/20"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel Search
                </button>
              </div>
            ) : (
              <button
                onClick={startSearching}
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-bold text-lg text-white shadow-[0_0_40px_rgba(249,115,22,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(249,115,22,0.5)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-500 to-amber-500 transition-all duration-300 group-hover:opacity-90"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[url('/noise.svg')] mix-blend-overlay"></div>
                <svg
                  className="relative z-10 w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="relative z-10">Find Match</span>
              </button>
            )}
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">
            Recent Battles
          </h3>

          {history.length === 0 ? (
            <div className="bg-neutral-900/30 border border-neutral-800 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center">
              <svg
                className="w-8 h-8 text-neutral-700 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <p className="text-neutral-500 font-medium">
                Your match history will appear here.
              </p>
              <p className="text-neutral-600 text-sm mt-1">
                Play your first battle to see it here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-neutral-900/50 border border-neutral-800 rounded-xl px-5 py-4 flex items-center justify-between hover:bg-neutral-900/80 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/battle/${entry.id}`)}
                >
                  {/* Left: Result + Question */}
                  <div className="flex items-center gap-4 text-left min-w-0">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        entry.won
                          ? "bg-emerald-500/15 border border-emerald-500/30"
                          : entry.draw
                            ? "bg-yellow-500/15 border border-yellow-500/30"
                            : "bg-rose-500/15 border border-rose-500/30"
                      }`}
                    >
                      {entry.won ? (
                        <svg
                          className="w-5 h-5 text-emerald-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : entry.draw ? (
                        <svg
                          className="w-5 h-5 text-yellow-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M20 12H4"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-rose-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-neutral-200 truncate">
                          {entry.question.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${getDifficultyColor(entry.question.difficulty)}`}
                        >
                          {entry.question.difficulty}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500">
                        vs{" "}
                        <span className="text-neutral-400 font-medium">
                          {entry.opponent}
                        </span>
                        <span className="text-neutral-600 ml-1">
                          ({entry.opponentRating})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {entry.timeTaken && (
                      <span className="text-xs text-neutral-500 font-mono">
                        {formatTime(entry.timeTaken)}
                      </span>
                    )}
                    <div className="flex flex-col items-end">
                      <span
                        className={`text-xs font-bold ${
                          entry.won
                            ? "text-emerald-400"
                            : entry.draw
                              ? "text-yellow-400"
                              : "text-rose-400"
                        }`}
                      >
                        {entry.won ? "WON" : entry.draw ? "DRAW" : "LOST"}
                      </span>
                      <span className="text-[10px] text-neutral-600">
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>
                    <svg
                      className="w-4 h-4 text-neutral-700 group-hover:text-neutral-500 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
