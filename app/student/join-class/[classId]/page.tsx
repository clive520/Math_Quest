import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { bindSeat } from "./actions";
import { getStudentSsoSession } from "@/lib/student-session";

type Props = {
  params: Promise<{
    classId: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function SelectSeatPage({ params, searchParams }: Props) {
  const { classId } = await params;
  const query = await searchParams;

  const ssoSession = await getStudentSsoSession();
  if (!ssoSession) {
    redirect("/login");
  }

  const supabase = await createClient();

  const { data: classInfo } = await supabase
    .from("classes")
    .select("name, teachers(display_name)")
    .eq("id", classId)
    .eq("archived", false)
    .single();

  if (!classInfo) {
    notFound();
  }

  // Get available empty seats
  const { data: emptySeats } = await supabase
    .from("students")
    .select("seat_number")
    .eq("class_id", classId)
    .is("sso_uid", null)
    .eq("archived", false)
    .order("seat_number", { ascending: true });

  return (
    <main className="dashboard-content student-content shell" style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 16px" }}>
      <section className="section-heading" style={{ marginBottom: "32px" }}>
        <div>
          <p style={{ margin: 0, color: "var(--color-slate-500)", fontWeight: 600 }}>確認加入班級</p>
          <h1 style={{ fontSize: "2rem", margin: "4px 0", color: "var(--color-indigo-900)" }}>{classInfo.name}</h1>
          <p style={{ margin: 0, color: "var(--color-slate-500)" }}>
            老師：{(classInfo.teachers as any)?.display_name || (Array.isArray(classInfo.teachers) ? classInfo.teachers[0]?.display_name : "未知")}
          </p>
        </div>
      </section>

      {query.error && <p className="notice error">{query.error}</p>}

      <section className="card" style={{ padding: "32px" }}>
        {emptySeats && emptySeats.length > 0 ? (
          <form action={bindSeat} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input type="hidden" name="class_id" value={classId} />
            <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: "bold" }}>
              請選擇你的座號
              <select name="seat_number" required style={{ padding: "12px", fontSize: "1.1rem" }}>
                <option value="">-- 選擇座號 --</option>
                {emptySeats.map((seat) => (
                  <option key={seat.seat_number} value={seat.seat_number}>
                    {seat.seat_number} 號
                  </option>
                ))}
              </select>
            </label>
            
            <div style={{ backgroundColor: "var(--color-indigo-50)", padding: "16px", borderRadius: "8px", marginTop: "16px" }}>
              <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-indigo-900)" }}>
                <strong>綁定身分：</strong><br/>
                系統將把此座號與你的帳號「<strong>{ssoSession.name}</strong> ({ssoSession.username})」進行綁定。如果選錯座號，需請老師從後台為你解除綁定。
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              <button type="submit" className="button primary" style={{ flex: 1 }}>
                確認加入
              </button>
              <Link href="/student/join-class" className="button secondary" style={{ flex: 1, textAlign: "center" }}>
                上一步
              </Link>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <p style={{ color: "var(--color-slate-500)", marginBottom: "24px" }}>
              這個班級目前沒有空的座號可供加入。如果有任何問題，請聯絡您的老師。
            </p>
            <Link href="/student/join-class" className="button secondary">
              回上一頁
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
