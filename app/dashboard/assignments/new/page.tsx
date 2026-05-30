import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NewAssignmentForm from "./NewAssignmentForm";

export const metadata = {
  title: "派發新任務 | Math Quest",
};

export default async function NewAssignmentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch classes
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, grade")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  if (!classes || classes.length === 0) {
    return (
      <div className="shell">
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <h2>請先建立班級</h2>
          <p style={{ color: "var(--color-slate-500)", marginBottom: "24px" }}>您需要至少一個班級才能指派任務。</p>
          <Link href="/dashboard/classes" className="button primary">
            前往班級管理
          </Link>
        </div>
      </div>
    );
  }

  // Fetch all questions owned by teacher or public
  const { data: questions } = await supabase
    .from("question_templates")
    .select("id, title, grade, unit, is_public")
    .or(`owner_teacher_id.eq.${user.id},visibility.eq.public`)
    .order("created_at", { ascending: false });

  return (
    <div className="shell" style={{ maxWidth: "800px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Link href="/dashboard/assignments" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--color-slate-500)", textDecoration: "none", marginBottom: "16px" }}>
          <ArrowLeft size={16} />
          <span>返回任務管理</span>
        </Link>
        <h1 style={{ fontSize: "1.75rem", color: "var(--color-slate-800)" }}>派發新任務</h1>
      </div>

      <div className="card" style={{ padding: "32px" }}>
        <NewAssignmentForm classes={classes} questions={questions || []} />
      </div>
    </div>
  );
}
