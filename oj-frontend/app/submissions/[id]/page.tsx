import SubmissionStatus from "@/components/SubmissionStatus";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SubmissionPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div>
      <h1>Submission Status</h1>
      <SubmissionStatus submissionId={id} />
    </div>
  );
}
