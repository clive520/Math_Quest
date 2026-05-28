import Link from "next/link";
import { getQuestions } from "./actions";
import DeleteButton from "./DeleteButton";
import { Plus } from "lucide-react";

export const metadata = {
  title: "我的題庫 | Math Quest",
};

export default async function QuestionsPage() {
  const questions = await getQuestions();

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2>我的題庫</h2>
        <Link href="/dashboard/questions/new" className="button" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={18} />
          新增題目
        </Link>
      </div>

      {questions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-slate-500)" }}>
          <p>您目前還沒有建立任何題目。</p>
          <p style={{ marginTop: "8px" }}>點擊上方按鈕，開始建立您的專屬題庫吧！</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {questions.map((q) => (
            <div key={q.id} style={{ padding: "16px", border: "1px solid var(--color-slate-200)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", marginBottom: "4px" }}>{q.title}</h3>
                <div style={{ display: "flex", gap: "12px", fontSize: "0.9rem", color: "var(--color-slate-500)" }}>
                  <span>題型: {q.question_type === 'short_answer' ? '填空題' : q.question_type === 'multiple_choice' ? '選擇題' : '是非題'}</span>
                  {q.grade && <span>年級: {q.grade}</span>}
                  {q.unit && <span>單元: {q.unit}</span>}
                  <span style={{ 
                    padding: "2px 6px", 
                    borderRadius: "4px", 
                    fontSize: "0.8rem",
                    backgroundColor: q.visibility === 'public' ? "var(--color-indigo-100)" : "var(--color-slate-100)",
                    color: q.visibility === 'public' ? "var(--color-indigo-700)" : "var(--color-slate-600)"
                  }}>
                    {q.visibility === 'public' ? '公開' : '私人'}
                  </span>
                </div>
                {q.question_knowledge_points && q.question_knowledge_points.length > 0 && (
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                    {q.question_knowledge_points.map((mapping: any) => (
                      <span key={mapping.knowledge_points.id} style={{
                        padding: "2px 8px",
                        backgroundColor: "var(--color-teal-50)",
                        color: "var(--color-teal-700)",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        border: "1px solid var(--color-teal-200)"
                      }}>
                        {mapping.knowledge_points.code}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <Link href={`/dashboard/questions/${q.id}/edit`} className="button secondary">
                  編輯
                </Link>
                <DeleteButton id={q.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
