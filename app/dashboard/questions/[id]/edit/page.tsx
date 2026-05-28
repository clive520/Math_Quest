import QuestionForm from "../../QuestionForm";
import Link from "next/link";
import { getQuestion } from "../../actions";
import { notFound } from "next/navigation";

export const metadata = {
  title: "編輯題目 | Math Quest",
};

export default async function EditQuestionPage({ params }: { params: { id: string } }) {
  let question;
  try {
    question = await getQuestion(params.id);
  } catch (error) {
    notFound();
  }

  if (!question) {
    notFound();
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <Link href="/dashboard/questions" style={{ color: "var(--color-slate-500)", textDecoration: "none", display: "inline-block", marginBottom: "8px" }}>
          ← 返回題庫
        </Link>
        <h2>編輯動態題目</h2>
      </div>

      <QuestionForm initialData={question} />
    </div>
  );
}
