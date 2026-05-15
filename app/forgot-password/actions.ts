"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function getSiteUrl() {
  const headerStore = await headers();
  return headerStore.get("origin") ?? "http://localhost:3000";
}

export async function sendPasswordResetEmail(formData: FormData) {
  const email = getFormValue(formData, "email");

  if (!email) {
    redirect("/forgot-password?error=請輸入 Email");
  }

  const supabase = await createClient();
  const siteUrl = await getSiteUrl();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    const message =
      error.code === "over_email_send_rate_limit"
        ? "重設密碼信寄送太頻繁，請稍候幾分鐘再試"
        : "無法寄出重設密碼信，請稍後再試";

    redirect(`/forgot-password?error=${encodeURIComponent(message)}`);
  }

  redirect(
    `/forgot-password?message=${encodeURIComponent(
      "如果這個 Email 已註冊，我們已寄出重設密碼連結",
    )}`,
  );
}
