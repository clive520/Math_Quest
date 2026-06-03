"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setStudentSession, getStudentSsoSession } from "@/lib/student-session";

export async function enterClass(formData: FormData) {
  const studentId = formData.get("student_id") as string;
  const ssoSession = await getStudentSsoSession();

  if (!studentId || !ssoSession) {
    redirect("/login?error=SessionExpired");
  }

  const supabase = await createClient();
  
  // Verify that the student belongs to this SSO user
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("id", studentId)
    .eq("sso_uid", ssoSession.sso_uid)
    .single();

  if (!student) {
    redirect("/student/classes?error=AccessDenied");
  }

  const { data, error } = await supabase.rpc("create_sso_student_session", {
    target_student_id: studentId,
  }).single();

  if (error || !data) {
    redirect("/student/classes?error=SessionCreationError");
  }

  await setStudentSession(data.session_token);
  redirect("/student");
}
