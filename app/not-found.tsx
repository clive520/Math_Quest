import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "64px", textAlign: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "16px", color: "var(--color-indigo-900)" }}>404</h1>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "24px", color: "var(--color-slate-600)" }}>
        找不到此頁面 (Page Not Found)
      </h2>
      <p style={{ marginBottom: "32px", color: "var(--color-slate-500)" }}>
        您要尋找的頁面不存在，或已被移除。
      </p>
      <Link href="/" className="button primary">
        返回首頁
      </Link>
    </div>
  );
}
