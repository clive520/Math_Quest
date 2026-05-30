"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getPublicTeachers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teachers")
    .select("id, display_name, portal_slug")
    .order("display_name");

  if (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }
  return data;
}

export async function getTeacherBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teachers")
    .select("id, display_name, portal_slug")
    .eq("portal_slug", slug)
    .single();

  if (error) {
    return null;
  }
  return data;
}

export async function getPublicClasses(teacherId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select("id, name, grade, semester")
    .eq("teacher_id", teacherId)
    .eq("archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
  return data;
}

export async function getPublicStudents(classId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, name, seat_number")
    .eq("class_id", classId)
    .eq("archived", false)
    .order("seat_number", { ascending: true });

  if (error) {
    console.error("Error fetching students:", error);
    return [];
  }
  return data;
}

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
