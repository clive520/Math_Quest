const milestones = [
  "多位老師註冊與班級管理",
  "動態數字題目與老師派題",
  "公開題庫共享與複製修改",
  "Vercel + Supabase 自動化部署",
];

export default function Home() {
  return (
    <main className="shell">
      <section className="intro" aria-labelledby="site-title">
        <p className="eyebrow">Math Quest</p>
        <h1 id="site-title">數學闖關網站正在準備中</h1>
        <p className="lead">
          這裡將會成為國小老師建立班級、設計動態題目、派發闖關任務，
          並與其他老師共享題庫的數學學習平台。
        </p>
      </section>

      <section className="panel" aria-label="目前規劃重點">
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
