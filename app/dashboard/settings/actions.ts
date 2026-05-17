"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateProfile(formData: FormData) {
  const displayName = getFormValue(formData, "display_name");

  if (!displayName) {
    redirect("/dashboard/settings?error=請輸入顯示名稱");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error: profileError } = await supabase
    .from("teachers")
    .update({ display_name: displayName })
    .eq("id", user.id);

  if (profileError) {
    redirect(`/dashboard/settings?error=${encodeURIComponent("更新老師資料失敗")}`);
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      display_name: displayName,
    },
  });

  if (authError) {
    redirect(`/dashboard/settings?error=${encodeURIComponent("更新登入資料失敗")}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?message=老師資料已更新");
}

export async function updatePassword(formData: FormData) {
  const currentPassword = getFormValue(formData, "current_password");
  const newPassword = getFormValue(formData, "new_password");
  const confirmPassword = getFormValue(formData, "confirm_password");

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect("/dashboard/settings?error=請完整輸入目前密碼與新密碼");
  }

  if (newPassword.length < 6) {
    redirect("/dashboard/settings?error=新密碼至少需要 6 個字元");
  }

  if (newPassword !== confirmPassword) {
    redirect("/dashboard/settings?error=兩次輸入的新密碼不一致");
  }

  if (currentPassword === newPassword) {
    redirect("/dashboard/settings?error=新密碼不能和目前密碼相同");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    redirect("/dashboard/settings?error=目前密碼不正確");
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    redirect(`/dashboard/settings?error=${encodeURIComponent("更新密碼失敗，請稍後再試")}`);
  }

  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?message=密碼已更新");
}
