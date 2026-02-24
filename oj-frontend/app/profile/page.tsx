"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchProfile } from "@/lib/api";
import Link from "next/link";

interface Submission {
  id: string;
  language: string;
  verdict: string | null;
  createdAt: string;
  question: {
    id: string;
    title: string;
  };
}

interface Profile {
  username: string;
  email: string;
  createdAt: string;
  submissions: Submission[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        setProfile(data);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3rem)]">
        <svg className="h-6 w-6 animate-spin text-neutral-500" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (!profile) return null;

  const totalSubmissions = profile.submissions.length;
  const accepted = profile.submissions.filter((s) => s.verdict === "AC").length;
  const successRate = totalSubmissions > 0 ? ((accepted / totalSubmissions) * 100).toFixed(1) : "0";

  const verdictColor: Record<string, string> = {
    AC: "text-emerald-400",
    WA: "text-red-400",
    TLE: "text-yellow-400",
    RTE: "text-orange-400",
    CE: "text-orange-400",
  };

  const verdictLabel: Record<string, string> = {
    AC: "Accepted",
    WA: "Wrong Answer",
    TLE: "Time Limit Exceeded",
    RTE: "Runtime Error",
    CE: "Compilation Error",
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800 text-xl font-bold text-neutral-100">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-100">
              {profile.username}
            </h1>
            <p className="text-sm text-neutral-500">{profile.email}</p>
            <p className="text-xs text-neutral-600 mt-0.5">
              Member since{" "}
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
          <p className="text-2xl font-bold text-neutral-100">{totalSubmissions}</p>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mt-1">
            Total Submissions
          </p>
        </div>
        <div className="rounded-lg border border-emerald-900/50 bg-emerald-950/20 p-4">
          <p className="text-2xl font-bold text-emerald-400">{accepted}</p>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mt-1">
            Accepted
          </p>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
          <p className="text-2xl font-bold text-neutral-100">{successRate}%</p>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mt-1">
            Success Rate
          </p>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-neutral-100 mb-4">Recent Submissions</h2>

        {totalSubmissions === 0 ? (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 py-12 text-center">
            <p className="text-sm text-neutral-500">No submissions yet.</p>
            <Link
              href="/problems"
              className="inline-block mt-3 text-sm text-neutral-400 hover:text-neutral-200 transition-colors underline underline-offset-4"
            >
              Go solve some problems →
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-neutral-800 overflow-hidden">
            <div className="grid grid-cols-[1fr_90px_120px_100px] gap-4 px-4 py-2.5 bg-neutral-900/60 border-b border-neutral-800 text-xs font-medium text-neutral-500 uppercase tracking-wide">
              <span>Problem</span>
              <span>Language</span>
              <span>Verdict</span>
              <span className="text-right">Date</span>
            </div>

            <div className="divide-y divide-neutral-800/60">
              {profile.submissions
                .slice()
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((submission) => (
                  <Link
                    key={submission.id}
                    href={`/problems/${submission.question.id}`}
                    className="grid grid-cols-[1fr_90px_120px_100px] gap-4 px-4 py-3 items-center transition-colors hover:bg-neutral-800/40 group"
                  >
                    <span className="text-sm text-neutral-300 group-hover:text-neutral-100 transition-colors truncate">
                      {submission.question.title}
                    </span>
                    <span className="text-xs text-neutral-400 capitalize">
                      {submission.language}
                    </span>
                    <span className={`text-xs font-medium ${verdictColor[submission.verdict || ""] || "text-neutral-500"}`}>
                      {submission.verdict ? (verdictLabel[submission.verdict] || submission.verdict) : "Pending"}
                    </span>
                    <span className="text-xs text-neutral-600 text-right">
                      {new Date(submission.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
