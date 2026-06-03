import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getStudentSsoSession } from "@/lib/student-session";
import Link from "next/link";
import { enterClass } from "./actions";

type Props = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function StudentClassesPage({ searchParams }: Props) {
  const query = await searchParams;
  const ssoSession = await getStudentSsoSession();

  if (!ssoSession) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("id, class_id, seat_number, classes(name, teacher_id, teachers(display_name))")
    .eq("sso_uid", ssoSession.sso_uid)
    .eq("archived", false);

  return (
    <main className="dashboard-content student-content shell" style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 16px" }}>
      <section className="section-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <div>
          <p style={{ margin: 0, color: "var(--color-slate-500)", fontWeight: 600 }}>班級列表</p>
          <h1 style={{ fontSize: "2rem", margin: "4px 0", color: "var(--color-indigo-900)" }}>{ssoSession.name}</h1>
          <p style={{ margin: 0, color: "var(--color-slate-500)" }}>
            請選擇你要進入的班級
          </p>
        </div>
        <Link href="/student/join-class" className="button primary">
          加入新班級
        </Link>
      </section>

      {query.error && <p className="notice error">{query.error}</p>}
      {query.message && <p className="notice success">{query.message}</p>}

      {!students || students.length === 0 ? (
        <section className="card" style={{ padding: "64px 24px", textAlign: "center" }}>
          <h3 style={{ fontSize: "1.5rem", marginBottom: "8px", color: "var(--color-slate-800)" }}>尚未加入任何班級</h3>
          <p style={{ color: "var(--color-slate-500)", marginBottom: "24px" }}>請點擊上方按鈕，輸入老師提供的班級代碼來加入班級。</p>
          <Link href="/student/join-class" className="button primary" style={{ display: "inline-block" }}>
            立即加入班級
          </Link>
        </section>
      ) : (
        <section style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {students.map((student: any) => (
            <div key={student.id} className="card hover:border-indigo-500" style={{ padding: "24px", transition: "all 0.2s" }}>
              <h3 style={{ fontSize: "1.25rem", margin: "0 0 8px 0", color: "var(--color-slate-800)" }}>
                {student.classes.name}
              </h3>
              <p style={{ margin: "0 0 16px 0", color: "var(--color-slate-500)", fontSize: "0.95rem" }}>
                老師：{student.classes.teachers?.display_name || "未知"}<br/>
                座號：{student.seat_number}
              </p>
              <form action={enterClass}>
                <input type="hidden" name="student_id" value={student.id} />
                <button type="submit" className="button primary" style={{ width: '100%' }}>
                  進入班級
                </button>
              </form>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
