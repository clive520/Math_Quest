"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updatePassword(formData: FormData) {
  const password = getFormValue(formData, "password");
  const confirmPassword = getFormValue(formData, "confirm_password");

  if (!password || !confirmPassword) {
    redirect("/reset-password?error=請輸入新密碼並再次確認");
  }

  if (password.length < 6) {
    redirect("/reset-password?error=密碼至少需要 6 個字元");
  }

  if (password !== confirmPassword) {
    redirect("/reset-password?error=兩次輸入的密碼不一致");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect(
      `/reset-password?error=${encodeURIComponent(
        "無法更新密碼，請重新申請重設密碼連結",
      )}`,
    );
  }

  await supabase.auth.signOut();
  redirect("/login?message=密碼已更新，請使用新密碼登入");
}
