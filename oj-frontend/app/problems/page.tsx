import { fetchQuestions } from "@/lib/api";
import Link from "next/link";

export default async function ProblemsPage() {
  const questions = await fetchQuestions();

  return (
    <div>
      <h1>Problems</h1>
      <ul>
        {questions.map(
          (question: { id: string; title: string; difficulty: string }) => (
            <li key={question.id}>
              <span>
                {question.title} ({question.difficulty})
              </span>{" "}
              <Link href={`/problems/${question.id}`}>View</Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
