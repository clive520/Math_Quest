import { createClient } from "@/lib/supabase/server";
import { getStudentSession } from "@/lib/student-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AssignmentPlayer from "./AssignmentPlayer";

export default async function AssignmentPlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: assignmentId } = await params;
  const student = await getStudentSession();

  if (!student) {
    redirect("/student-login");
  }

  const supabase = await createClient();

  // Fetch assignment info
  const { data: assignment } = await supabase
    .from("assignments")
    .select("id, title, description, end_at, status")
    .eq("id", assignmentId)
    .single();

  if (!assignment || assignment.status !== "open") {
    redirect("/student?error=Assignment+not+available");
  }

  // Fetch questions for this assignment
  const { data: assignmentQuestions } = await supabase
    .from("assignment_questions")
    .select(`
      id,
      order_index,
      points,
      question_templates (
        id,
        title,
        template,
        variables,
        answer_rule,
        question_type,
        choices
      )
    `)
    .eq("assignment_id", assignmentId)
    .order("order_index", { ascending: true });

  if (!assignmentQuestions || assignmentQuestions.length === 0) {
    return (
      <div className="shell">
        <h2>此任務沒有題目。</h2>
        <Link href="/student" className="button secondary">返回</Link>
      </div>
    );
  }

  // Fetch previous attempts if any
  const { data: studentAnswers } = await supabase
    .rpc("get_student_answers", {
      target_student_id: student.student_id,
      target_assignment_id: assignmentId
    });

  return (
    <main className="dashboard-content student-content shell" style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Link href="/student" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--color-slate-500)", textDecoration: "none", marginBottom: "16px" }}>
          <ArrowLeft size={16} />
          <span>返回任務列表</span>
        </Link>
        <h1 style={{ fontSize: "1.75rem", color: "var(--color-slate-800)" }}>{assignment.title}</h1>
        {assignment.description && <p style={{ color: "var(--color-slate-500)" }}>{assignment.description}</p>}
      </div>

      <AssignmentPlayer 
        assignmentId={assignmentId}
        questions={assignmentQuestions.map(aq => ({
          ...aq.question_templates,
          points: aq.points,
        })) as any}
        previousAnswers={studentAnswers || []}
      />
    </main>
  );
}
