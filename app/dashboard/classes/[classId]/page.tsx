import Link from "next/link";
import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { archiveStudent, updateStudent } from "./actions";

type ClassDetailPageProps = {
  params: Promise<{
    classId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

function getSiteUrlFromHeaders(host: string | null, protocol: string | null) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (host) {
    return `${protocol ?? "https"}://${host}`;
  }

  return "https://math-quest-clive520s-projects.vercel.app";
}

export default async function ClassDetailPage({ params, searchParams }: ClassDetailPageProps) {
  const { classId } = await params;
  const query = await searchParams;
  const supabase = await createClient();
  const headerStore = await headers();
  const siteUrl = getSiteUrlFromHeaders(
    headerStore.get("host"),
    headerStore.get("x-forwarded-proto"),
  );

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
    .select("id, name, seat_number, login_code, created_at")
    .eq("class_id", classId)
    .eq("archived", false)
    .order("seat_number", { ascending: true });

  const joinUrl = `${siteUrl}/join/${classInfo.class_code}`;
  const qrCodeDataUrl = await QRCode.toDataURL(joinUrl, {
    margin: 1,
    width: 220,
  });

  return (
    <main className="dashboard-content">
      <section className="section-heading">
        <div>
          <p className="eyebrow">班級管理</p>
          <h2>{classInfo.name}</h2>
          <p className="muted-line">
            {classInfo.grade ? `${classInfo.grade} 年級` : "未設定年級"}
            {classInfo.semester ? ` · ${classInfo.semester}` : ""}
          </p>
        </div>
        <Link className="text-link" href="/dashboard/classes">
          返回班級列表
        </Link>
      </section>

      {query.error ? <p className="notice error">{query.error}</p> : null}
      {query.message ? <p className="notice success">{query.message}</p> : null}

      <section className="join-card" aria-label="學生加入資訊">
        <div>
          <p className="eyebrow">學生加入班級</p>
          <h3>班級代碼：{classInfo.class_code}</h3>
          <p>{joinUrl}</p>
          <div className="join-actions">
            <a className="primary-link" href={joinUrl}>
              開啟加入頁面
            </a>
          </div>
        </div>
        <img alt={`${classInfo.name} 加入班級 QR Code`} src={qrCodeDataUrl} />
      </section>

      <section className="table-panel" aria-label="學生名單">
        {students && students.length > 0 ? (
          <div className="student-list">
            {students.map((student) => (
              <article className="student-row" key={student.id}>
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
                  <label>
                    姓名
                    <input name="name" required defaultValue={student.name} />
                  </label>
                  <button type="submit">儲存</button>
                </form>
                <form action={archiveStudent}>
                  <input name="class_id" type="hidden" value={classInfo.id} />
                  <input name="student_id" type="hidden" value={student.id} />
                  <button className="text-button" type="submit">
                    刪除
                  </button>
                </form>
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
