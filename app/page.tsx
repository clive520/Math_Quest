import Link from "next/link";

const milestones = [
  "老師建立班級與管理學生名單",
  "學生用班級代碼與座號登入",
  "題目、任務與學習紀錄逐步擴充",
  "Vercel + Supabase 正式網站部署",
];

export default function Home() {
  return (
    <main className="shell">
      <section className="intro" aria-labelledby="site-title">
        <p className="eyebrow">Math Quest</p>
        <h1 id="site-title">讓數學練習變成可以前進的任務</h1>
        <p className="lead">
          老師可以建立班級、管理學生資料，學生則透過班級代碼加入班級並登入。接下來會把題目任務、闖關紀錄和學習回饋逐步接上。
        </p>
        <div className="hero-actions">
          <Link className="primary-link" href="/login">
            老師登入
          </Link>
          <Link className="secondary-link" href="/student-login">
            學生登入
          </Link>
        </div>
      </section>

      <section className="panel" aria-label="目前進度">
        {milestones.map((item) => (
          <div className="item" key={item}>
            <span aria-hidden="true" />
            <p>{item}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
