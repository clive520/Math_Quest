import Link from "next/link";
import { sendPasswordResetEmail } from "./actions";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;

  return (
    <main className="auth-shell">
      <section className="auth-intro" aria-labelledby="forgot-password-title">
        <p className="eyebrow">Math Quest</p>
        <h1 id="forgot-password-title">重設老師密碼</h1>
        <p className="lead">
          輸入註冊用的 Email，系統會寄出一封重設密碼信，讓老師重新設定密碼。
        </p>
        <Link className="text-link" href="/login">
          回登入頁
        </Link>
      </section>

      <section className="auth-panel" aria-label="忘記密碼">
        {params.error ? <p className="notice error">{params.error}</p> : null}
        {params.message ? <p className="notice success">{params.message}</p> : null}

        <form className="form" action={sendPasswordResetEmail}>
          <label>
            Email
            <input name="email" type="email" required placeholder="teacher@example.com" />
          </label>
          <button type="submit">寄出重設密碼信</button>
        </form>
      </section>
    </main>
  );
}
