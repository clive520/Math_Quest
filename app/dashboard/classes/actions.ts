"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const CLASS_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function generateClassCode(length = 6) {
  let code = "";
  const bytes = crypto.getRandomValues(new Uint8Array(length));

  for (const byte of bytes) {
    code += CLASS_CODE_ALPHABET[byte % CLASS_CODE_ALPHABET.length];
  }

  return code;
}

export async function createClass(formData: FormData) {
  const name = getFormValue(formData, "name");
  const semester = getFormValue(formData, "semester");
  const gradeValue = getFormValue(formData, "grade");
  const grade = gradeValue ? Number(gradeValue) : null;

  if (!name) {
    redirect("/dashboard/classes?error=請輸入班級名稱");
  }

  if (grade !== null && (!Number.isInteger(grade) || grade < 1 || grade > 6)) {
    redirect("/dashboard/classes?error=年級需介於 1 到 6");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabase.from("classes").insert({
      teacher_id: user.id,
      name,
      grade,
      semester: semester || null,
      class_code: generateClassCode(),
    });

    if (!error) {
      revalidatePath("/dashboard");
      revalidatePath("/dashboard/classes");
      redirect("/dashboard/classes?message=班級已建立");
    }

    if (error.code !== "23505") {
      redirect(`/dashboard/classes?error=${encodeURIComponent("建立班級失敗，請稍後再試")}`);
    }
  }

  redirect("/dashboard/classes?error=班級代碼產生失敗，請再試一次");
}

export async function archiveClass(formData: FormData) {
  const classId = getFormValue(formData, "class_id");

  if (!classId) {
    redirect("/dashboard/classes?error=找不到班級");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("classes")
    .update({ archived: true })
    .eq("id", classId)
    .eq("teacher_id", user.id);

  if (error) {
    redirect(`/dashboard/classes?error=${encodeURIComponent("封存班級失敗")}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/classes");
  redirect("/dashboard/classes?message=班級已封存");
}
