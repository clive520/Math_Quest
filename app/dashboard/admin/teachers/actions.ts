"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ResetTeacherPasswordState = {
  displayName?: string;
  email?: string;
  error?: string;
  mailtoHref?: string;
  message?: string;
  temporaryPassword?: string;
};

const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function generateTemporaryPassword() {
  const groups: string[] = [];

  for (let groupIndex = 0; groupIndex < 3; groupIndex++) {
    let group = "";
    const bytes = crypto.getRandomValues(new Uint8Array(4));

    for (const byte of bytes) {
      group += PASSWORD_ALPHABET[byte % PASSWORD_ALPHABET.length];
    }

    groups.push(group);
  }

  return `MQ-${groups.join("-")}`;
}

function buildMailtoHref(email: string, displayName: string, temporaryPassword: string) {
  const subject = "Math Quest 老師帳號臨時密碼";
  const body = `${displayName} 老師您好：

您的 Math Quest 老師帳號已由系統管理員重設為臨時密碼：

${temporaryPassword}

請使用這組臨時密碼登入 Math Quest。登入後，系統會要求您立即修改密碼，修改完成後才能繼續使用老師工作台。

Math Quest 正式網址：
https://math-quest-clive520s-projects.vercel.app/login`;

  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;
}

export async function resetTeacherPassword(
  _previousState: ResetTeacherPasswordState,
  formData: FormData,
): Promise<ResetTeacherPasswordState> {
  const teacherId = getFormValue(formData, "teacher_id");

  if (!teacherId) {
    return { error: "找不到老師帳號" };
  }

  const temporaryPassword = generateTemporaryPassword();
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("reset_teacher_temporary_password", {
      target_teacher_id: teacherId,
      temporary_password: temporaryPassword,
    })
    .single();

  if (error || !data) {
    return { error: "重設臨時密碼失敗，請確認你有系統管理員權限" };
  }

  const teacher = data as {
    display_name: string;
    email: string;
  };

  revalidatePath("/dashboard/admin/teachers");

  return {
    displayName: teacher.display_name,
    email: teacher.email,
    mailtoHref: buildMailtoHref(teacher.email, teacher.display_name, temporaryPassword),
    message: "臨時密碼已產生，老師下次登入後必須先修改密碼",
    temporaryPassword,
  };
}
