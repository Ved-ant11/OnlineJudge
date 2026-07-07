"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchTopicGuide, fetchTopicGuides } from "@/lib/api";

interface ThinkingStep {
  step: string;
  detail: string;
}

interface Trap {
  trap: string;
  howToAvoid: string;
}

interface Resource {
  title: string;
  url: string;
  type: string;
  why: string;
}

interface TopicGuide {
  id: string;
  name: string;
  icon: string;
  prerequisites: string[];
  coreIntuition: string;
  mentalModel: string;
  whenToUse: string[];
  thinkingFramework: ThinkingStep[];
  commonTraps: Trap[];
  interviewVariantStrategy: string;
  resources: Resource[];
}

interface TopicSummary {
  id: string;
  name: string;
  icon: string;
}

const resourceTypeConfig: Record<string, { icon: string; label: string; color: string }> = {
  article: { icon: "📄", label: "Article", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  video: { icon: "🎬", label: "Video", color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  visualizer: { icon: "🔧", label: "Visualizer", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  course: { icon: "📚", label: "Course", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  book: { icon: "📖", label: "Book", color: "text-rose-400 bg-rose-400/10 border-rose-400/20" },
};

export default function TopicGuidePage() {
  const params = useParams();
  const topicId = params.topic as string;

  const [guide, setGuide] = useState<TopicGuide | null>(null);
  const [allTopics, setAllTopics] = useState<TopicSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTraps, setExpandedTraps] = useState<Set<number>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const [guideData, topicsData] = await Promise.all([
          fetchTopicGuide(topicId),
          fetchTopicGuides(),
        ]);
        setGuide(guideData);
        setAllTopics(topicsData.topics || []);
      } catch {
        setError("Topic guide not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [topicId]);

  const toggleTrap = (index: number) => {
    setExpandedTraps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const getPrereqId = (name: string) => {
    const match = allTopics.find((t) => t.name === name);
    return match?.id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3rem)]">
        <svg className="h-5 w-5 animate-spin text-neutral-700" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] gap-4">
        <span className="text-[40px]">🔍</span>
        <span className="font-mono-custom text-[12px] text-neutral-500">{error || "Guide not found"}</span>
        <Link
          href="/practice"
          className="font-mono-custom text-[10px] tracking-[0.18em] uppercase text-neutral-600 hover:text-neutral-300 transition-colors border-b border-neutral-800 hover:border-neutral-600 pb-px"
        >
          ← Back to Practice
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-lg px-8 py-14">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          href="/practice"
          className="font-mono-custom text-[10px] tracking-[0.18em] uppercase text-neutral-600 hover:text-neutral-400 transition-colors duration-200"
        >
          ← Practice
        </Link>
      </div>

      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-[48px] leading-none">{guide.icon}</span>
          <div>
            <span className="font-mono-custom text-[9px] tracking-[0.28em] uppercase text-neutral-700 block mb-1.5">
              Deep Learning Guide
            </span>
            <h1 className="font-sans text-[36px] font-bold tracking-[-0.04em] text-white leading-none">
              {guide.name}
            </h1>
          </div>
        </div>

        {/* Prerequisites */}
        {guide.prerequisites.length > 0 && (
          <div className="flex items-center gap-2 mt-5">
            <span className="font-mono-custom text-[9px] tracking-[0.15em] uppercase text-neutral-700">
              Prerequisites:
            </span>
            {guide.prerequisites.map((prereq) => {
              const prereqId = getPrereqId(prereq);
              return prereqId ? (
                <Link
                  key={prereq}
                  href={`/practice/learn/${prereqId}`}
                  className="font-mono-custom text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors duration-200 border border-neutral-800/60 rounded-md px-2.5 py-1 hover:border-neutral-700"
                >
                  {prereq}
                </Link>
              ) : (
                <span
                  key={prereq}
                  className="font-mono-custom text-[10px] text-neutral-600 border border-neutral-800/60 rounded-md px-2.5 py-1"
                >
                  {prereq}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Core Intuition */}
      <section className="mb-14">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-5 bg-gradient-to-b from-amber-500 to-amber-500/30 rounded-full" />
          <h2 className="font-sans text-[20px] font-bold tracking-[-0.02em] text-white">
            Core Intuition
          </h2>
        </div>
        <div className="border border-amber-500/15 rounded-lg bg-amber-500/[0.03] p-6">
          <p className="font-sans text-[15px] leading-[1.8] text-neutral-300">
            {guide.coreIntuition}
          </p>
        </div>
      </section>

      {/* Mental Model */}
      <section className="mb-14">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-5 bg-gradient-to-b from-purple-400 to-purple-400/30 rounded-full" />
          <h2 className="font-sans text-[20px] font-bold tracking-[-0.02em] text-white">
            Mental Model — How to Think About It
          </h2>
        </div>
        <div className="border border-purple-400/15 rounded-lg bg-purple-400/[0.03] p-6">
          <p className="font-sans text-[15px] leading-[1.8] text-neutral-300">
            {guide.mentalModel}
          </p>
        </div>
      </section>

      {/* When to Use */}
      <section className="mb-14">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-emerald-500/30 rounded-full" />
          <h2 className="font-sans text-[20px] font-bold tracking-[-0.02em] text-white">
            When to Use — Recognition Signals
          </h2>
        </div>
        <div className="space-y-2">
          {guide.whenToUse.map((signal, i) => (
            <div
              key={i}
              className="flex items-start gap-3 border border-neutral-800/60 rounded-lg bg-[#0d0d0d] px-5 py-3.5"
            >
              <span className="text-emerald-500/60 mt-0.5 text-[12px]">→</span>
              <p className="font-sans text-[13px] text-neutral-400 leading-relaxed">{signal}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Thinking Framework */}
      <section className="mb-14">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-5 bg-gradient-to-b from-blue-400 to-blue-400/30 rounded-full" />
          <h2 className="font-sans text-[20px] font-bold tracking-[-0.02em] text-white">
            Thinking Framework — Step by Step
          </h2>
        </div>
        <p className="font-mono-custom text-[10px] text-neutral-600 mb-5 ml-3.5">
          Follow these steps for ANY problem in this category — not solution steps, but THINKING steps.
        </p>
        <div className="space-y-3">
          {guide.thinkingFramework.map((step, i) => (
            <div
              key={i}
              className="border border-neutral-800/60 rounded-lg bg-[#0d0d0d] overflow-hidden"
            >
              <div className="px-5 py-4">
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="font-mono-custom text-[10px] font-bold text-blue-400/80 bg-blue-400/10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <h3 className="font-sans text-[14px] font-semibold text-neutral-200 tracking-[-0.01em]">
                    {step.step.replace(/^\d+\.\s*/, "")}
                  </h3>
                </div>
                <p className="font-sans text-[13px] text-neutral-500 leading-relaxed ml-9">
                  {step.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Common Traps */}
      <section className="mb-14">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-5 bg-gradient-to-b from-red-400 to-red-400/30 rounded-full" />
          <h2 className="font-sans text-[20px] font-bold tracking-[-0.02em] text-white">
            Common Traps — What Trips People Up
          </h2>
        </div>
        <div className="space-y-2">
          {guide.commonTraps.map((trap, i) => (
            <div
              key={i}
              className="border border-neutral-800/60 rounded-lg bg-[#0d0d0d] overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleTrap(i)}
                className="w-full px-5 py-4 flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-red-400/60 text-[14px]">⚠</span>
                  <span className="font-sans text-[13px] font-medium text-neutral-300 group-hover:text-neutral-200 transition-colors">
                    {trap.trap}
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-neutral-700 transition-transform duration-300 ${
                    expandedTraps.has(i) ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {expandedTraps.has(i) && (
                <div className="px-5 pb-4 pt-0 border-t border-neutral-800/40">
                  <div className="flex items-start gap-3 mt-3">
                    <span className="text-emerald-500/60 text-[12px] mt-0.5">✓</span>
                    <p className="font-sans text-[13px] text-neutral-500 leading-relaxed">
                      {trap.howToAvoid}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Interview Variant Strategy */}
      <section className="mb-14">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-5 bg-gradient-to-b from-cyan-400 to-cyan-400/30 rounded-full" />
          <h2 className="font-sans text-[20px] font-bold tracking-[-0.02em] text-white">
            Interview Variants — How Interviewers Twist Problems
          </h2>
        </div>
        <div className="border border-cyan-400/15 rounded-lg bg-cyan-400/[0.03] p-6">
          <p className="font-sans text-[15px] leading-[1.8] text-neutral-300">
            {guide.interviewVariantStrategy}
          </p>
        </div>
      </section>

      {/* Resources */}
      <section className="mb-14">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-1 h-5 bg-gradient-to-b from-orange-400 to-orange-400/30 rounded-full" />
          <h2 className="font-sans text-[20px] font-bold tracking-[-0.02em] text-white">
            Curated Resources
          </h2>
        </div>
        <p className="font-mono-custom text-[10px] text-neutral-600 mb-5 ml-3.5">
          Hand-picked, free, top-quality resources. Each one is here for a reason.
        </p>
        <div className="space-y-3">
          {guide.resources.map((resource, i) => {
            const config = resourceTypeConfig[resource.type] || resourceTypeConfig.article;
            return (
              <a
                key={i}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-neutral-800/60 rounded-lg bg-[#0d0d0d] p-5 group hover:border-neutral-700 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className={`font-mono-custom text-[9px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-full border ${config.color}`}>
                        {config.icon} {config.label}
                      </span>
                    </div>
                    <h3 className="font-sans text-[14px] font-semibold text-neutral-300 group-hover:text-neutral-100 transition-colors tracking-[-0.01em] mb-1.5">
                      {resource.title}
                    </h3>
                    <p className="font-sans text-[12px] text-neutral-600 leading-relaxed">
                      {resource.why}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-neutral-700 group-hover:text-neutral-500 transition-colors flex-shrink-0 mt-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Bottom Navigation */}
      <div className="border-t border-neutral-800/60 pt-8 flex items-center justify-between">
        <Link
          href="/practice"
          className="font-mono-custom text-[10px] tracking-[0.18em] uppercase text-neutral-600 hover:text-neutral-300 transition-colors duration-200"
        >
          ← Back to Practice
        </Link>
        <Link
          href="/problems"
          className="inline-flex items-center gap-2 font-mono-custom text-[10px] tracking-[0.18em] uppercase text-neutral-600 hover:text-neutral-300 transition-colors duration-200"
        >
          Solve Problems →
        </Link>
      </div>
    </div>
  );
}
