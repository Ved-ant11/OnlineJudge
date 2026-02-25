import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center px-6 dot-grid overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-blue-600/20 via-violet-600/20 to-cyan-500/20 rounded-full blur-[100px] animate-glow-pulse pointer-events-none" />
      <div className="relative z-10 w-full max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-neutral-100 animate-fade-in-up">
          Online <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Judge</span>
        </h1>
        <p className="mt-4 text-base text-neutral-400 leading-relaxed max-w-md mx-auto animate-fade-in-up animation-delay-100">
          Practice coding problems. Write solutions. Get instant feedback.
        </p>
        <div className="mt-8 animate-fade-in-up animation-delay-200">
          <Link
            href="/problems"
            className="group relative inline-flex h-10 items-center justify-center rounded-lg bg-neutral-100 px-6 text-sm font-semibold text-neutral-900 transition-all duration-300 hover:bg-white hover:shadow-[0_0_24px_rgba(255,255,255,0.15)]"
          >
            Browse Problems
            <svg className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
