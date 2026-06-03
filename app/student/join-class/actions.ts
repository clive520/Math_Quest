"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function checkClassCode(formData: FormData) {
  const classCode = formData.get("class_code") as string;
  if (!classCode) {
    redirect("/student/join-class?error=請輸入班級代碼");
  }

  const supabase = await createClient();
  const { data: classInfo } = await supabase
    .from("classes")
    .select("id")
    .eq("class_code", classCode.trim().toUpperCase())
    .eq("archived", false)
    .single();

  if (!classInfo) {
    redirect("/student/join-class?error=找不到此班級，請確認代碼是否正確");
  }

  redirect(`/student/join-class/${classInfo.id}`);
}
