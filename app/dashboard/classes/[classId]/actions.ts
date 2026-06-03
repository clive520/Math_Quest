"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function updateStudent(formData: FormData) {
  const classId = getFormValue(formData, "class_id");
  const studentId = getFormValue(formData, "student_id");
  const name = getFormValue(formData, "name");
  const password = getFormValue(formData, "password");
  const seatNumberValue = getFormValue(formData, "seat_number");
  const seatNumber = Number(seatNumberValue);

  if (!classId || !studentId || !name || !seatNumberValue) {
    redirect(`/dashboard/classes/${classId || ""}?error=${encodeURIComponent("請完整填寫學生資料")}`);
  }

  if (!Number.isInteger(seatNumber) || seatNumber <= 0) {
    redirect(`/dashboard/classes/${classId}?error=${encodeURIComponent("座號必須是大於 0 的整數")}`);
  }

  if (password && password.length < 4) {
    redirect(`/dashboard/classes/${classId}?error=${encodeURIComponent("新密碼至少需要 4 個字元")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_student_for_teacher", {
    input_name: name,
    input_password: password || null,
    input_seat_number: seatNumber,
    target_student_id: studentId,
  });

  if (error) {
    const message = error.code === "23505" ? "這個座號已經有人使用" : "更新學生資料失敗";
    redirect(`/dashboard/classes/${classId}?error=${encodeURIComponent(message)}`);
  }

  revalidatePath(`/dashboard/classes/${classId}`);
  redirect(`/dashboard/classes/${classId}?message=${encodeURIComponent("學生資料已更新")}`);
}

export async function archiveStudent(formData: FormData) {
  const classId = getFormValue(formData, "class_id");
  const studentId = getFormValue(formData, "student_id");

  if (!classId || !studentId) {
    redirect(`/dashboard/classes/${classId || ""}?error=${encodeURIComponent("缺少學生資料")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ archived: true })
    .eq("id", studentId)
    .eq("class_id", classId);

  if (error) {
    redirect(`/dashboard/classes/${classId}?error=${encodeURIComponent("刪除學生失敗")}`);
  }

  revalidatePath(`/dashboard/classes/${classId}`);
  redirect(`/dashboard/classes/${classId}?message=${encodeURIComponent("學生已刪除")}`);
}

export async function unlinkStudent(formData: FormData) {
  const classId = getFormValue(formData, "class_id");
  const studentId = getFormValue(formData, "student_id");

  if (!classId || !studentId) {
    redirect(`/dashboard/classes/${classId || ""}?error=${encodeURIComponent("缺少學生資料")}`);
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({ sso_uid: null, username: null, name: '未註冊' })
    .eq("id", studentId)
    .eq("class_id", classId);

  if (error) {
    redirect(`/dashboard/classes/${classId}?error=${encodeURIComponent("解除綁定失敗")}`);
  }

  revalidatePath(`/dashboard/classes/${classId}`);
  redirect(`/dashboard/classes/${classId}?message=${encodeURIComponent("已解除綁定，座號已空出")}`);
}
