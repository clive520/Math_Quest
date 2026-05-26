import Link from "next/link";
import { signInStudent } from "./actions";

type StudentLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function StudentLoginPage({ searchParams }: StudentLoginPageProps) {
  const params = await searchParams;

  return (
    <main className="auth-shell">
      <section className="auth-intro" aria-labelledby="student-login-title">
        <p className="eyebrow">Math Quest</p>
        <h1 id="student-login-title">學生登入</h1>
        <p className="lead">請輸入老師提供的班級代碼，以及你的座號和密碼。</p>
        <Link className="text-link" href="/">
          回首頁
        </Link>
      </section>

      <section className="auth-panel" aria-label="學生登入">
        {params.error ? <p className="notice error">{params.error}</p> : null}
        <form className="form" action={signInStudent}>
          <label>
            班級代碼
            <input name="class_code" required placeholder="例如：ABC123" />
          </label>
          <label>
            座號
            <input name="seat_number" required inputMode="numeric" placeholder="例如：12" />
          </label>
          <label>
            密碼
            <input name="password" type="password" required />
          </label>
          <button type="submit">登入學生頁面</button>
        </form>
      </section>
    </main>
  );
}
