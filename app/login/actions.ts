"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signIn(formData: FormData) {
  const email = getFormValue(formData, "email");
  const password = getFormValue(formData, "password");

  if (!email || !password) {
    redirect("/login?error=請輸入 Email 和密碼");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent("登入失敗，請確認帳號與密碼")}`);
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = getFormValue(formData, "email");
  const password = getFormValue(formData, "password");
  const displayName = getFormValue(formData, "display_name");

  if (!email || !password) {
    redirect("/login?mode=signup&error=請輸入 Email 和密碼");
  }

  if (password.length < 6) {
    redirect("/login?mode=signup&error=密碼至少需要 6 個字元");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split("@")[0],
      },
    },
  });

  if (error) {
    redirect(`/login?mode=signup&error=${encodeURIComponent("註冊失敗，請稍後再試")}`);
  }

  if (!data.session) {
    redirect("/login?message=註冊成功，請先完成 Email 驗證後再登入");
  }

  redirect("/dashboard");
}
