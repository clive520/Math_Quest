import Link from "next/link";
import { signIn, signUp } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
    mode?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const isSignup = params.mode === "signup";

  return (
    <main className="auth-shell">
      <section className="auth-intro" aria-labelledby="login-title">
        <p className="eyebrow">Math Quest</p>
        <h1 id="login-title">老師工作台</h1>
        <p className="lead">
          登入後可以建立班級、管理學生，並開始準備第一批數學闖關任務。
        </p>
        <Link className="text-link" href="/">
          回首頁
        </Link>
      </section>

      <section className="auth-panel" aria-label="老師登入與註冊">
        {params.error ? <p className="notice error">{params.error}</p> : null}
        {params.message ? <p className="notice success">{params.message}</p> : null}

        <div className="tabs" aria-label="登入模式">
          <Link className={!isSignup ? "active" : ""} href="/login">
            登入
          </Link>
          <Link className={isSignup ? "active" : ""} href="/login?mode=signup">
            註冊
          </Link>
        </div>

        {isSignup ? (
          <form className="form" action={signUp}>
            <label>
              顯示名稱
              <input name="display_name" placeholder="例如：高老師" />
            </label>
            <label>
              Email
              <input name="email" type="email" required placeholder="teacher@example.com" />
            </label>
            <label>
              密碼
              <input name="password" type="password" required minLength={6} />
            </label>
            <button type="submit">建立老師帳號</button>
          </form>
        ) : (
          <form className="form" action={signIn}>
            <label>
              Email
              <input name="email" type="email" required placeholder="teacher@example.com" />
            </label>
            <label>
              密碼
              <input name="password" type="password" required />
            </label>
            <button type="submit">登入老師工作台</button>
            <div className="form-footer">
              <Link className="text-link" href="/forgot-password">
                忘記密碼？
              </Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
