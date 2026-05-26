"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setStudentSession } from "@/lib/student-session";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signInStudent(formData: FormData) {
  const classCode = getFormValue(formData, "class_code").toUpperCase();
  const seatNumberValue = getFormValue(formData, "seat_number");
  const password = getFormValue(formData, "password");
  const seatNumber = Number(seatNumberValue);

  if (!classCode || !seatNumberValue || !password) {
    redirect(`/student-login?error=${encodeURIComponent("請輸入班級代碼、座號和密碼")}`);
  }

  if (!Number.isInteger(seatNumber) || seatNumber <= 0) {
    redirect(`/student-login?error=${encodeURIComponent("座號必須是大於 0 的整數")}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("login_student_by_class_code", {
      input_class_code: classCode,
      input_password: password,
      input_seat_number: seatNumber,
    })
    .single();

  if (error || !data) {
    redirect(`/student-login?error=${encodeURIComponent("登入失敗，請確認班級代碼、座號和密碼")}`);
  }

  const result = data as { session_token: string };
  await setStudentSession(result.session_token);
  redirect("/student");
}
