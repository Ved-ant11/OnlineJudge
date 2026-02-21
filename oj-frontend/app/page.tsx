import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-100">
          Online Judge
        </h1>
        <p className="mt-3 text-sm text-neutral-500 leading-relaxed">
          Practice coding problems. Write solutions. Get instant feedback.
        </p>
        <Link
          href="/problems"
          className="mt-8 inline-flex h-9 items-center justify-center rounded-md bg-neutral-100 px-5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
        >
          Browse Problems
        </Link>
      </div>
    </div>
  );
}
