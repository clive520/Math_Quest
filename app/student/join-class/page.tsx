import Link from "next/link";
import { checkClassCode } from "./actions";

type Props = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function JoinClassPage({ searchParams }: Props) {
  const query = await searchParams;

  return (
    <main className="dashboard-content student-content shell" style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 16px" }}>
      <section className="section-heading" style={{ marginBottom: "32px" }}>
        <div>
          <p style={{ margin: 0, color: "var(--color-slate-500)", fontWeight: 600 }}>加入班級</p>
          <h1 style={{ fontSize: "2rem", margin: "4px 0", color: "var(--color-indigo-900)" }}>輸入班級代碼</h1>
        </div>
      </section>

      {query.error && <p className="notice error">{query.error}</p>}

      <section className="card" style={{ padding: "32px" }}>
        <form action={checkClassCode} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "8px", fontWeight: "bold" }}>
            班級代碼
            <input 
              name="class_code" 
              required 
              placeholder="例如: ABCDEF" 
              style={{ padding: "12px", fontSize: "1.1rem", textTransform: "uppercase" }} 
            />
          </label>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
            <button type="submit" className="button primary" style={{ flex: 1 }}>
              下一步
            </button>
            <Link href="/student/classes" className="button secondary" style={{ flex: 1, textAlign: "center" }}>
              取消
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
