import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle, FileText, Calendar, Users, ChevronRight } from "lucide-react";

export const metadata = {
  title: "任務管理 | Math Quest",
};

export default async function AssignmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Fetch classes for the dropdown or info
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch all assignments with their classes
  const { data: assignments } = await supabase
    .from("assignments")
    .select(`
      *,
      classes ( name ),
      assignment_questions ( count )
    `)
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="shell">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "2rem", color: "var(--color-slate-800)" }}>任務管理</h1>
          <p style={{ color: "var(--color-slate-500)", marginTop: "8px" }}>發布與管理派給班級的測驗任務</p>
        </div>
        
        <Link href="/dashboard/assignments/new" className="button primary" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <PlusCircle size={20} />
          <span>派發新任務</span>
        </Link>
      </div>

      {!classes || classes.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "64px 24px" }}>
          <div style={{ width: "64px", height: "64px", backgroundColor: "var(--color-indigo-50)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "var(--color-indigo-500)" }}>
            <Users size={32} />
          </div>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "8px" }}>您還沒有建立任何班級</h2>
          <p style={{ color: "var(--color-slate-500)", marginBottom: "24px", maxWidth: "400px", margin: "0 auto 24px" }}>
            在派發任務之前，請先前往「班級管理」建立一個班級並加入學生。
          </p>
          <Link href="/dashboard/classes" className="button secondary">
            前往班級管理
          </Link>
        </div>
      ) : !assignments || assignments.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "64px 24px" }}>
          <div style={{ width: "64px", height: "64px", backgroundColor: "var(--color-indigo-50)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "var(--color-indigo-500)" }}>
            <FileText size={32} />
          </div>
          <h2 style={{ fontSize: "1.25rem", marginBottom: "8px" }}>目前沒有任何任務</h2>
          <p style={{ color: "var(--color-slate-500)", marginBottom: "24px", maxWidth: "400px", margin: "0 auto 24px" }}>
            您尚未指派任何任務給班級。點擊右上角的「派發新任務」開始出題吧！
          </p>
          <Link href="/dashboard/assignments/new" className="button primary">
            派發新任務
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {assignments.map((assignment) => (
            <div key={assignment.id} className="card hover:border-indigo-500" style={{ padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "all 0.2s" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <span style={{ 
                    padding: "4px 10px", 
                    borderRadius: "20px", 
                    fontSize: "0.8rem", 
                    fontWeight: 600,
                    backgroundColor: assignment.status === 'open' ? "var(--color-green-100)" : 
                                     assignment.status === 'draft' ? "var(--color-slate-100)" : "var(--color-amber-100)",
                    color: assignment.status === 'open' ? "var(--color-green-700)" : 
                           assignment.status === 'draft' ? "var(--color-slate-600)" : "var(--color-amber-700)"
                  }}>
                    {assignment.status === 'open' ? '進行中' : 
                     assignment.status === 'draft' ? '草稿' : 
                     assignment.status === 'closed' ? '已結束' : assignment.status}
                  </span>
                  <h3 style={{ fontSize: "1.25rem", margin: 0 }}>{assignment.title}</h3>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "var(--color-slate-500)", fontSize: "0.9rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Users size={16} />
                    <span>對象：{assignment.classes?.name || "未指定"}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <FileText size={16} />
                    <span>題數：{assignment.assignment_questions?.[0]?.count || 0} 題</span>
                  </div>
                  {assignment.end_at && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Calendar size={16} />
                      <span>期限：{new Date(assignment.end_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Link href={`/dashboard/assignments/${assignment.id}`} className="button secondary" style={{ padding: "8px 16px", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>查看詳情</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
