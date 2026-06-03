import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { archiveStudent, updateStudent, unlinkStudent } from "./actions";

type ClassDetailPageProps = {
  params: Promise<{
    classId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ClassDetailPage({ params, searchParams }: ClassDetailPageProps) {
  const { classId } = await params;
  const query = await searchParams;
  const supabase = await createClient();

  const { data: classInfo } = await supabase
    .from("classes")
    .select("id, name, grade, semester, class_code, created_at")
    .eq("id", classId)
    .eq("archived", false)
    .maybeSingle();

  if (!classInfo) {
    notFound();
  }

  const { data: students } = await supabase
    .from("students")
    .select("id, name, seat_number, username, sso_uid, created_at")
    .eq("class_id", classId)
    .eq("archived", false)
    .order("seat_number", { ascending: true });

  return (
    <main className="dashboard-content">
      <section className="section-heading">
        <div>
          <p className="eyebrow">學生狀況</p>
          <h2>{classInfo.name}</h2>
          <p className="muted-line">
            {classInfo.grade ? `${classInfo.grade} 年級` : "未設定年級"}
            {classInfo.semester ? ` · ${classInfo.semester}` : ""}
          </p>
        </div>
        <div className="section-actions">
          <Link className="text-link" href={`/dashboard/classes/${classInfo.id}/qr`}>
            學生加入 QR Code
          </Link>
          <Link className="text-link" href="/dashboard/classes">
            返回班級列表
          </Link>
        </div>
      </section>

      {query.error ? <p className="notice error">{query.error}</p> : null}
      {query.message ? <p className="notice success">{query.message}</p> : null}



      <section className="table-panel" aria-label="學生名單">
        {students && students.length > 0 ? (
          <div className="student-table">
            <div className="student-table-header" aria-hidden="true">
              <span>座號</span>
              <span>姓名</span>
              <span>操作</span>
            </div>
            {students.map((student) => (
              <article className="student-record" key={student.id}>
                <div className="student-record-summary">
                  <strong>{student.seat_number}</strong>
                  <span>{student.name} {student.username ? <small style={{color: 'var(--color-indigo-600)'}}>(SSO: {student.username})</small> : <small style={{color: 'var(--color-slate-400)'}}>(尚未綁定)</small>}</span>
                  <div className="student-record-actions">
                    <details>
                      <summary>編輯</summary>
                      <form className="student-edit-form" action={updateStudent}>
                        <input name="class_id" type="hidden" value={classInfo.id} />
                        <input name="student_id" type="hidden" value={student.id} />
                        <label>
                          座號
                          <input
                            name="seat_number"
                            required
                            defaultValue={student.seat_number ?? ""}
                            inputMode="numeric"
                          />
                        </label>
                        <button type="submit">儲存變更</button>
                      </form>
                    </details>
                    {student.sso_uid && (
                      <form action={unlinkStudent}>
                        <input name="class_id" type="hidden" value={classInfo.id} />
                        <input name="student_id" type="hidden" value={student.id} />
                        <button className="text-button" type="submit">
                          解除綁定
                        </button>
                      </form>
                    )}
                    <form action={archiveStudent}>
                      <input name="class_id" type="hidden" value={classInfo.id} />
                      <input name="student_id" type="hidden" value={student.id} />
                      <button className="text-button danger-link" type="submit">
                        刪除
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>目前沒有學生</h3>
            <p>請學生掃描 QR Code 或開啟加入連結，輸入座號、姓名與密碼後加入班級。</p>
          </div>
        )}
      </section>
    </main>
  );
}
