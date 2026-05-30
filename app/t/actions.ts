"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function studentLoginWithPassword(studentId: string, passwordHash: string) {
  const supabase = await createClient();

  // Validate password
  const { data: student, error } = await supabase
    .from("students")
    .select("id, password_hash, class_id")
    .eq("id", studentId)
    .single();

  if (error || !student) {
    return { error: "找不到該學生" };
  }

  if (student.password_hash !== passwordHash) {
    return { error: "密碼錯誤，請再試一次" };
  }

  // Update last login
  await supabase
    .from("students")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", studentId);

  // Set auth cookie for student (simulated auth since students aren't true auth.users)
  const cookieStore = await cookies();
  cookieStore.set("student_id", studentId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  
  cookieStore.set("class_id", student.class_id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return { success: true };
}
