import { createClient } from "@/lib/supabase/server";
import { updatePassword, updateProfile } from "./actions";

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: teacher } = await supabase
    .from("teachers")
    .select("display_name, must_change_password")
    .eq("id", user?.id)
    .maybeSingle();

  return (
    <main className="dashboard-content">
      <section className="section-heading">
        <div>
          <p className="eyebrow">帳號設定</p>
          <h2>老師資料與密碼</h2>
        </div>
      </section>

      {params.error ? <p className="notice error">{params.error}</p> : null}
      {params.message ? <p className="notice success">{params.message}</p> : null}
      {teacher?.must_change_password ? (
        <p className="notice warning">
          你目前使用的是臨時密碼。請先設定自己的新密碼，才能繼續使用老師工作台。
        </p>
      ) : null}

      <section className="settings-grid" aria-label="帳號設定表單">
        <form className="form management-form" action={updateProfile}>
          <h3>基本資料</h3>
          <label>
            登入 Email
            <input value={user?.email ?? ""} disabled readOnly />
          </label>
          <label>
            顯示名稱
            <input
              name="display_name"
              required
              defaultValue={teacher?.display_name ?? ""}
              placeholder="例如：高老師"
            />
          </label>
          <button type="submit">儲存老師資料</button>
        </form>

        <form className="form management-form" action={updatePassword}>
          <h3>修改密碼</h3>
          <label>
            目前密碼
            <input name="current_password" type="password" required />
          </label>
          <label>
            新密碼
            <input name="new_password" type="password" required minLength={6} />
          </label>
          <label>
            再輸入一次新密碼
            <input name="confirm_password" type="password" required minLength={6} />
          </label>
          <button type="submit">更新密碼</button>
        </form>
      </section>
    </main>
  );
}
