"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getSignUpErrorMessage(errorCode?: string, errorMessage?: string) {
  if (errorCode === "over_email_send_rate_limit") {
    return "驗證信寄送太頻繁，請稍候幾分鐘再註冊";
  }

  if (errorCode === "email_exists" || errorMessage?.toLowerCase().includes("already registered")) {
    return "這個 Email 已經註冊過，請改用登入";
  }

  if (errorCode === "weak_password") {
    return "密碼強度不足，請換一組較安全的密碼";
  }

  return "註冊失敗，請稍後再試";
}

async function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  const headerStore = await headers();
  return headerStore.get("origin") ?? "https://math-quest-clive520s-projects.vercel.app";
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
  const siteUrl = await getSiteUrl();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
      data: {
        display_name: displayName || email.split("@")[0],
      },
    },
  });

  if (error) {
    const message = getSignUpErrorMessage(error.code, error.message);
    redirect(`/login?mode=signup&error=${encodeURIComponent(message)}`);
  }

  if (!data.session) {
    redirect("/login?message=註冊成功，請先完成 Email 驗證後再登入");
  }

  redirect("/dashboard");
}
