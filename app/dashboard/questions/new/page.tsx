import QuestionForm from "../QuestionForm";
import Link from "next/link";

export const metadata = {
  title: "新增題目 | Math Quest",
};

export default function NewQuestionPage() {
  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <Link href="/dashboard/questions" style={{ color: "var(--color-slate-500)", textDecoration: "none", display: "inline-block", marginBottom: "8px" }}>
          ← 返回題庫
        </Link>
        <h2>新增動態題目</h2>
        <p style={{ color: "var(--color-slate-500)", marginTop: "4px" }}>
          設定題目變數範圍與運算規則，學生每次挑戰都會看到不同的數字。
        </p>
      </div>

      <QuestionForm />
    </div>
  );
}
