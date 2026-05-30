import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { archiveClass, createClass } from "./actions";

type ClassesPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ClassesPage({ searchParams }: ClassesPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: userResponse } = await supabase.auth.getUser();
  const userId = userResponse?.user?.id;
  
  let teacherProfile = null;
  if (userId) {
    const { data } = await supabase.from("teachers").select("portal_slug").eq("id", userId).single();
    teacherProfile = data;
  }

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, grade, semester, class_code, created_at")
    .eq("archived", false)
    .order("created_at", { ascending: false });

  return (
    <main className="dashboard-content">
      <section className="section-heading">
        <div>
          <p className="eyebrow">班級管理</p>
          <h2>建立與查看班級</h2>
        </div>
      </section>

      {teacherProfile?.portal_slug && (
        <section className="panel" style={{ marginBottom: "24px", padding: "16px", backgroundColor: "var(--color-indigo-50)", border: "1px solid var(--color-indigo-200)", borderRadius: "8px" }}>
          <h3 style={{ margin: "0 0 8px 0", color: "var(--color-indigo-900)" }}>🔗 您的專屬學生登入入口</h3>
          <p style={{ margin: 0, color: "var(--color-slate-700)" }}>
            請將此網址提供給學生，他們不需記住班級代碼即可登入：
            <br />
            <a href={`/t/${teacherProfile.portal_slug}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "8px", fontWeight: "bold", color: "var(--color-indigo-700)" }}>
              /t/{teacherProfile.portal_slug}
            </a>
          </p>
        </section>
      )}

      {params.error ? <p className="notice error">{params.error}</p> : null}
      {params.message ? <p className="notice success">{params.message}</p> : null}

      <section className="split-layout classes-layout">
        <section className="table-panel" aria-label="班級列表">
          {classes && classes.length > 0 ? (
            <div className="class-list">
              {classes.map((item) => (
                <article className="class-row" key={item.id}>
                  <div>
                    <h3>
                      <Link className="class-title-link" href={`/dashboard/classes/${item.id}`}>
                        {item.name}
                      </Link>
                    </h3>
                    <p>
                      {item.grade ? `${item.grade} 年級` : "未設定年級"}
                      {item.semester ? ` · ${item.semester}` : ""}
                    </p>
                  </div>
                  <div className="class-actions">
                    <span className="code-pill">{item.class_code}</span>
                    <Link className="text-link" href={`/dashboard/classes/${item.id}/qr`}>
                      學生加入 QR Code
                    </Link>
                    <form action={archiveClass}>
                      <input name="class_id" type="hidden" value={item.id} />
                      <button className="text-button" type="submit">
                        封存
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>目前沒有班級</h3>
              <p>先建立第一個班級，之後就可以讓學生加入並查看學習狀況。</p>
            </div>
          )}
        </section>

        <form className="form management-form" action={createClass}>
          <h3>新增班級</h3>
          <label>
            班級名稱
            <input name="name" required placeholder="例如：三年甲班" />
          </label>
          <label>
            年級
            <select name="grade" defaultValue="">
              <option value="">未設定</option>
              <option value="1">一年級</option>
              <option value="2">二年級</option>
              <option value="3">三年級</option>
              <option value="4">四年級</option>
              <option value="5">五年級</option>
              <option value="6">六年級</option>
            </select>
          </label>
          <label>
            學期
            <input name="semester" placeholder="例如：114 學年度下學期" />
          </label>
          <button type="submit">建立班級</button>
        </form>
      </section>
    </main>
  );
}
