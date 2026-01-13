import { fetchQuestionById } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import CodeSubmission from "@/components/CodeSubmission";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProblemDetailPage({ params }: PageProps) {
  const {id} = await params;
  const question = await fetchQuestionById(id);

  return (
    <div>
      <h1>{question.title}</h1>
      <p>Difficulty: {question.difficulty}</p>

      <ReactMarkdown>{question.statement}</ReactMarkdown>

      <h2>Examples</h2>
      {question.examples.map(
        (
          example: {
            input: string;
            output: string;
            explanation?: string;
          },
          index: number
        ) => (
          <div key={index}>
            <h3>Example {index + 1}</h3>

            <strong>Input:</strong>
            <pre>{example.input}</pre>

            <strong>Output:</strong>
            <pre>{example.output}</pre>

            {example.explanation && (
              <>
                <strong>Explanation:</strong>
                <p>{example.explanation}</p>
              </>
            )}
          </div>
        )
      )}

      <h2>Constraints</h2>
      <ReactMarkdown>{question.constraints}</ReactMarkdown>
      <CodeSubmission questionId={question.id} />
    </div>
  );
}
