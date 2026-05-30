import { getTeacherBySlug, getPublicStudents } from "../../actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import StudentLoginGrid from "../../StudentLoginGrid";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; classId: string }> }) {
  const resolvedParams = await params;
  const teacher = await getTeacherBySlug(resolvedParams.slug);
  if (!teacher) return { title: "找不到頁面 | Math Quest" };
  return { title: `班級登入 - ${teacher.display_name} | Math Quest` };
}

export default async function ClassLoginPage({ params }: { params: Promise<{ slug: string; classId: string }> }) {
  const resolvedParams = await params;
  const teacher = await getTeacherBySlug(resolvedParams.slug);
  
  if (!teacher) {
    notFound();
  }

  // Get class name
  const supabase = await createClient();
  const { data: cls } = await supabase.from("classes").select("name").eq("id", resolvedParams.classId).single();
  if (!cls) {
    notFound();
  }

  const students = await getPublicStudents(resolvedParams.classId);

  return (
    <main className="shell">
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", color: "var(--color-indigo-900)" }}>{cls.name}</h1>
        <p style={{ color: "var(--color-slate-500)", marginTop: "8px" }}>請點擊你的座號與姓名</p>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {students.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ color: "var(--color-slate-500)" }}>這個班級目前還沒有建立學生名單喔！</p>
          </div>
        ) : (
          <StudentLoginGrid students={students} />
        )}
      </div>
      
      <div style={{ textAlign: "center", marginTop: "48px" }}>
        <Link href={`/t/${teacher.portal_slug}`} className="text-link">← 回上一步 (選擇班級)</Link>
      </div>
    </main>
  );
}
