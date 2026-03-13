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
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
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
        return "text-amber-400";
      case "HARD":
        return "text-rose-400";
      default:
        return "text-neutral-500";
    }
  };

  const winRate =
    stats.battlesPlayed > 0
      ? Math.round((stats.battlesWon / stats.battlesPlayed) * 100)
      : 0;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-[#0a0a0a]">
        <div className="h-5 w-5 border-2 border-neutral-700 border-t-neutral-300 rounded-full animate-spin" />
      </div>
    );
  }

  if (!authStatus.isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-6 bg-[#0a0a0a]">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-neutral-800/80 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-neutral-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Sign in to battle
          </h2>
          <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
            Log in to compete against other coders in real-time.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="w-full py-2.5 rounded-lg bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
            Battle
          </h1>
          <p className="text-neutral-500 text-sm">
            Compete head-to-head. First to solve wins.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-px bg-neutral-800/50 rounded-xl overflow-hidden mb-12">
          <div className="bg-neutral-900/80 px-6 py-5">
            <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
              Rating
            </div>
            <div className="text-2xl font-semibold text-white tabular-nums">
              {stats.rating}
            </div>
          </div>
          <div className="bg-neutral-900/80 px-6 py-5">
            <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
              Battles
            </div>
            <div className="text-2xl font-semibold text-white tabular-nums">
              {stats.battlesPlayed}
            </div>
          </div>
          <div className="bg-neutral-900/80 px-6 py-5">
            <div className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
              Win Rate
            </div>
            <div className="text-2xl font-semibold text-white tabular-nums">
              {winRate}
              <span className="text-sm font-normal text-neutral-500 ml-0.5">
                %
              </span>
            </div>
          </div>
        </div>

        <div className="mb-14">
          {searching ? (
            <div className="flex flex-col items-center py-12 animate-fade-in">
              <div className="relative mb-6">
                <div className="absolute -inset-3 rounded-full bg-orange-500/10 animate-ping" />
                <div className="relative w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-neutral-700 border-t-orange-400 rounded-full animate-spin" />
                </div>
              </div>
              <p className="text-sm font-medium text-white mb-1">
                Searching for opponent
              </p>
              <p className="text-xs text-neutral-500 mb-6">
                This usually takes a few seconds
              </p>
              <button
                onClick={cancelSearching}
                className="text-sm text-neutral-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={startSearching}
              className="w-full py-3.5 rounded-xl bg-orange-500 text-white text-sm font-semibold transition-all duration-200 hover:bg-orange-400 active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Find Match
              </span>
            </button>
          )}
        </div>

        <div>
          <h2 className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-4">
            Recent Battles
          </h2>

          {history.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-neutral-800 rounded-xl">
              <p className="text-sm text-neutral-600">No battles yet</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/50">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => router.push(`/battle/${entry.id}`)}
                  className="flex items-center justify-between py-3.5 cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        entry.won
                          ? "bg-emerald-400"
                          : entry.draw
                            ? "bg-amber-400"
                            : "bg-rose-400"
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm text-neutral-200 font-medium truncate group-hover:text-white transition-colors">
                          {entry.question.title}
                        </span>
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wide ${getDifficultyColor(entry.question.difficulty)}`}
                        >
                          {entry.question.difficulty}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-600 mt-0.5">
                        vs{" "}
                        <span 
                           className="hover:text-white hover:underline underline-offset-2 transition-all cursor-pointer"
                           onClick={(e) => {
                             e.stopPropagation();
                             router.push(`/user/${entry.opponent}`);
                           }}
                        >
                          {entry.opponent}
                        </span>
                        <span className="mx-1.5">·</span>
                        {entry.opponentRating}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 shrink-0">
                    {entry.timeTaken && (
                      <span className="text-xs text-neutral-600 font-mono tabular-nums">
                        {formatTime(entry.timeTaken)}
                      </span>
                    )}
                    <span className="text-xs text-neutral-600 w-14 text-right">
                      {formatDate(entry.createdAt)}
                    </span>
                    <svg
                      className="w-3.5 h-3.5 text-neutral-700 group-hover:text-neutral-400 transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
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
