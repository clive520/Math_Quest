"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function studentLoginWithPassword(studentId: string, passwordPlain: string) {
  const supabase = await createClient();

  // Validate password using RPC (handles bcrypt)
  const { data: classId, error } = await supabase
    .rpc("verify_student_password", {
      target_student_id: studentId,
      input_password: passwordPlain,
    });

  if (error || !classId) {
    return { error: "密碼錯誤，請再試一次" };
  }

  // Update last login
  await supabase
    .from("students")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", studentId);

  // Set auth cookie for student
  const cookieStore = await cookies();
  cookieStore.set("student_id", studentId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  
  cookieStore.set("class_id", classId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return { success: true };
}
