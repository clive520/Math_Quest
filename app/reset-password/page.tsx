import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updatePassword } from "./actions";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="auth-shell">
      <section className="auth-intro" aria-labelledby="reset-password-title">
        <p className="eyebrow">Math Quest</p>
        <h1 id="reset-password-title">設定新密碼</h1>
        <p className="lead">
          請輸入新的老師帳號密碼。完成後系統會登出目前 session，讓你用新密碼重新登入。
        </p>
        <Link className="text-link" href="/login">
          回登入頁
        </Link>
      </section>

      <section className="auth-panel" aria-label="設定新密碼">
        {params.error ? <p className="notice error">{params.error}</p> : null}

        {user ? (
          <form className="form" action={updatePassword}>
            <label>
              新密碼
              <input name="password" type="password" required minLength={6} />
            </label>
            <label>
              再輸入一次新密碼
              <input name="confirm_password" type="password" required minLength={6} />
            </label>
            <button type="submit">更新密碼</button>
          </form>
        ) : (
          <div className="empty-state">
            <h3>重設連結已失效</h3>
            <p>請重新申請一封重設密碼信，再從 Email 中的連結回到這裡。</p>
            <Link className="primary-link" href="/forgot-password">
              重新申請
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
