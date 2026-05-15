import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ count: classCount }, { count: studentCount }, { count: questionCount }] =
    await Promise.all([
      supabase.from("classes").select("*", { count: "exact", head: true }).eq("archived", false),
      supabase.from("students").select("*", { count: "exact", head: true }).eq("archived", false),
      supabase.from("question_templates").select("*", { count: "exact", head: true }),
    ]);

  return (
    <main className="dashboard-content">
      <section className="summary-grid" aria-label="目前資料概況">
        <div className="summary-card">
          <span>班級</span>
          <strong>{classCount ?? 0}</strong>
        </div>
        <div className="summary-card">
          <span>學生</span>
          <strong>{studentCount ?? 0}</strong>
        </div>
        <div className="summary-card">
          <span>題目</span>
          <strong>{questionCount ?? 0}</strong>
        </div>
      </section>

      <section className="workband">
        <div>
          <h2>先建立第一個班級</h2>
          <p>
            班級建立後會自動產生班級代碼，之後學生登入會使用這個代碼。
          </p>
        </div>
        <Link className="primary-link" href="/dashboard/classes">
          管理班級
        </Link>
      </section>

      <p className="muted-line">目前登入帳號：{user?.email}</p>
    </main>
  );
}
