import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Trophy, Users } from "lucide-react";
import { getPublicTeachers } from "./t/data";

export default async function Home() {
  const teachers = await getPublicTeachers();

  return (
    <main className="shell">
      <section className="intro" aria-labelledby="site-title">
        <p className="eyebrow">Math Quest</p>
        <h1 id="site-title">讓數學練習變成可以前進的任務</h1>
        <p className="lead">
          為國小數學設計的互動闖關平台，結合動態變數出題與教育部數學指標，幫助學生更有效地學習。
        </p>
        <div className="hero-actions">
          <Link className="primary-link" href="/login">
            老師登入/註冊
          </Link>
        </div>
      </section>

      <section className="panel" aria-label="學生登入入口">
        <h2 style={{ marginBottom: "16px", color: "var(--color-slate-800)" }}>選擇老師專屬登入入口</h2>
        {teachers.length === 0 ? (
          <p style={{ color: "var(--color-slate-500)" }}>目前尚未有老師建立專屬入口。</p>
        ) : (
          <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
            {teachers.map(teacher => (
              <Link 
                key={teacher.id} 
                href={`/t/${teacher.portal_slug}`}
                style={{
                  display: "block",
                  padding: "16px",
                  backgroundColor: "white",
                  border: "1px solid var(--color-slate-200)",
                  borderRadius: "8px",
                  textDecoration: "none",
                  color: "var(--color-indigo-700)",
                  fontWeight: "bold",
                  textAlign: "center",
                  transition: "all 0.2s ease"
                }}
              >
                {teacher.display_name} 的班級
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
