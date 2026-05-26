import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordPanel } from "./ResetPasswordPanel";

type TeacherAccount = {
  created_at: string;
  display_name: string;
  email: string;
  id: string;
  is_admin: boolean;
  must_change_password: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  }).format(new Date(value));
}

export default async function AdminTeachersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: currentTeacher } = await supabase
    .from("teachers")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!currentTeacher?.is_admin) {
    redirect("/dashboard");
  }

  const { data, error } = await supabase.rpc("list_teacher_accounts");
  const teachers = (data ?? []) as TeacherAccount[];

  return (
    <main className="dashboard-content">
      <section className="section-heading">
        <div>
          <p className="eyebrow">系統管理</p>
          <h2>老師帳號管理</h2>
        </div>
      </section>

      {error ? (
        <p className="notice error">無法載入老師帳號，請確認資料庫權限設定已更新。</p>
      ) : null}

      <section className="table-panel" aria-label="老師帳號列表">
        {teachers.length > 0 ? (
          <div className="teacher-account-list">
            {teachers.map((teacher) => (
              <article className="teacher-account-row" key={teacher.id}>
                <div className="teacher-account-main">
                  <h3>{teacher.display_name}</h3>
                  <p>{teacher.email}</p>
                  <p>建立時間：{formatDate(teacher.created_at)}</p>
                </div>

                <div className="status-stack" aria-label="帳號狀態">
                  {teacher.is_admin ? <span className="status-pill admin">管理員</span> : null}
                  {teacher.must_change_password ? (
                    <span className="status-pill warning">需改密碼</span>
                  ) : (
                    <span className="status-pill">正常</span>
                  )}
                </div>

                <ResetPasswordPanel displayName={teacher.display_name} teacherId={teacher.id} />
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>尚無老師帳號</h3>
            <p>老師註冊後會出現在這裡。</p>
          </div>
        )}
      </section>
    </main>
  );
}
