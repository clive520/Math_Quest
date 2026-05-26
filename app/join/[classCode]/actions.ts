"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setStudentSession } from "@/lib/student-session";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function joinClass(formData: FormData) {
  const classCode = getFormValue(formData, "class_code").toUpperCase();
  const name = getFormValue(formData, "name");
  const seatNumberValue = getFormValue(formData, "seat_number");
  const password = getFormValue(formData, "password");
  const confirmPassword = getFormValue(formData, "confirm_password");
  const seatNumber = Number(seatNumberValue);

  if (!classCode || !name || !seatNumberValue || !password || !confirmPassword) {
    redirect(`/join/${classCode || "unknown"}?error=${encodeURIComponent("請完整填寫加入資料")}`);
  }

  if (!Number.isInteger(seatNumber) || seatNumber <= 0) {
    redirect(`/join/${classCode}?error=${encodeURIComponent("座號必須是大於 0 的整數")}`);
  }

  if (password.length < 4) {
    redirect(`/join/${classCode}?error=${encodeURIComponent("密碼至少需要 4 個字元")}`);
  }

  if (password !== confirmPassword) {
    redirect(`/join/${classCode}?error=${encodeURIComponent("兩次輸入的密碼不一致")}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("join_class_by_code", {
      input_class_code: classCode,
      input_name: name,
      input_password: password,
      input_seat_number: seatNumber,
    })
    .single();

  if (error || !data) {
    const message = error?.code === "23505" ? "這個座號已經加入班級" : "加入班級失敗";
    redirect(`/join/${classCode}?error=${encodeURIComponent(message)}`);
  }

  const result = data as { session_token: string };
  await setStudentSession(result.session_token);
  redirect("/student");
}
