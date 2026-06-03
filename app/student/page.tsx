import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/student-session";
import { signOutStudent } from "./actions";
import Link from "next/link";
import { PlayCircle, Clock } from "lucide-react";

export default async function StudentPage() {
  const student = await getStudentSession();

  if (!student) {
    redirect("/student-login");
  }

  const supabase = await createClient();
  const { data: assignments } = await supabase
    .rpc("get_student_active_assignments", {
      target_student_id: student.student_id
    });

  return (
    <main className="dashboard-content student-content shell" style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 16px" }}>
      <section className="section-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <p style={{ margin: 0, color: "var(--color-slate-500)", fontWeight: 600 }}>學生首頁</p>
          <h1 style={{ fontSize: "2rem", margin: "4px 0", color: "var(--color-indigo-900)" }}>{student.student_name}</h1>
          <p style={{ margin: 0, color: "var(--color-slate-500)" }}>
            {student.class_name} · {student.seat_number} 號
          </p>
        </div>
        <Link href="/student/classes" className="button secondary">
          切換班級
        </Link>
      </section>

      {!assignments || assignments.length === 0 ? (
        <section className="card" style={{ padding: "64px 24px", textAlign: "center" }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "8px", color: "var(--color-slate-800)" }}>目前沒有任務</h3>
          <p style={{ color: "var(--color-slate-500)" }}>等老師發布 Math Quest 任務後，就會出現在這裡。</p>
        </section>
      ) : (
        <section style={{ display: "grid", gap: "16px" }}>
          <h2 style={{ fontSize: "1.25rem", color: "var(--color-slate-700)", marginBottom: "8px" }}>🚀 你的任務列表</h2>
          {assignments.map((assignment: any) => (
            <div key={assignment.assignment_id} className="card hover:border-indigo-500" style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", margin: "0 0 8px 0", color: "var(--color-slate-800)" }}>{assignment.title}</h3>
                {assignment.description && (
                  <p style={{ margin: "0 0 12px 0", color: "var(--color-slate-500)", fontSize: "0.95rem" }}>{assignment.description}</p>
                )}
                <div style={{ display: "flex", gap: "16px", fontSize: "0.85rem", color: "var(--color-slate-500)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ 
                      padding: "2px 8px", 
                      borderRadius: "12px", 
                      backgroundColor: assignment.status === 'in_progress' ? "var(--color-amber-100)" : 
                                       assignment.status === 'completed' ? "var(--color-green-100)" : "var(--color-slate-100)",
                      color: assignment.status === 'in_progress' ? "var(--color-amber-700)" : 
                             assignment.status === 'completed' ? "var(--color-green-700)" : "var(--color-slate-600)",
                      fontWeight: 600
                    }}>
                      {assignment.status === 'completed' ? "已完成" : 
                       assignment.status === 'in_progress' ? "進行中" : "未開始"}
                    </span>
                  </div>
                  {assignment.due_date && (
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={14} />
                      <span>期限：{new Date(assignment.due_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {assignment.status === 'completed' ? (
                <div style={{ textAlign: "center", padding: "8px 16px", backgroundColor: "var(--color-green-50)", borderRadius: "8px" }}>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--color-green-600)" }}>{assignment.score}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-green-700)" }}>分數</div>
                </div>
              ) : (
                <Link href={`/student/assignments/${assignment.assignment_id}`} className="button primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <PlayCircle size={18} />
                  <span>{assignment.status === 'in_progress' ? "繼續闖關" : "開始闖關"}</span>
                </Link>
              )}
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
