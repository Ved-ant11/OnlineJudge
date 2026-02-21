import SubmissionStatus from "@/components/SubmissionStatus";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SubmissionPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/problems"
        className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors mb-8"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M10 7H4M4 7L6.5 4.5M4 7L6.5 9.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to Problems
      </Link>

      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-100 mb-2">
          Submission
        </h1>
        <code className="text-xs font-mono text-neutral-600 select-all">
          {id}
        </code>
      </div>

      <SubmissionStatus submissionId={id} />
    </div>
  );
}
