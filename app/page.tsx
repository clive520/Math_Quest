import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Trophy, Users } from "lucide-react";

export default function Home() {
  return (
    <main className="shell">
      <section className="intro" aria-labelledby="site-title" style={{ textAlign: "center", padding: "64px 24px" }}>
        <p className="eyebrow" style={{ justifyContent: "center" }}>Math Quest</p>
        <h1 id="site-title">讓數學練習變成可以前進的任務</h1>
        <p className="lead" style={{ margin: "0 auto", maxWidth: "600px", marginBottom: "32px" }}>
          為國小數學設計的互動闖關平台，結合動態變數出題與教育部數學指標，幫助學生更有效地學習。
        </p>
        <div className="hero-actions" style={{ justifyContent: "center" }}>
          <Link className="primary-link button" href="/login" style={{ fontSize: "1.25rem", padding: "16px 32px" }}>
            進入系統 (SSO 登入)
          </Link>
        </div>
      </section>

      <section className="panel" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", marginTop: "48px" }}>
        <div className="card" style={{ padding: "32px", textAlign: "center" }}>
          <Brain size={48} color="var(--color-indigo-500)" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: "1.25rem", marginBottom: "8px" }}>動態出題引擎</h3>
          <p style={{ color: "var(--color-slate-500)" }}>防弊機制完美結合，每位學生都能獲得獨一無二的數字組合，真正檢驗學習成效。</p>
        </div>
        <div className="card" style={{ padding: "32px", textAlign: "center" }}>
          <Trophy size={48} color="var(--color-yellow-500)" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: "1.25rem", marginBottom: "8px" }}>遊戲化學習</h3>
          <p style={{ color: "var(--color-slate-500)" }}>將指派作業化為闖關任務，讓學生在解題過程中獲得成就感與前進的動力。</p>
        </div>
        <div className="card" style={{ padding: "32px", textAlign: "center" }}>
          <Users size={48} color="var(--color-green-500)" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ fontSize: "1.25rem", marginBottom: "8px" }}>單一認證無縫接軌</h3>
          <p style={{ color: "var(--color-slate-500)" }}>支援學校專屬的 SSO 單一認證，老師不需匯入名單，學生一鍵就能進入專屬闖關大廳。</p>
        </div>
      </section>
    </main>
  );
}
