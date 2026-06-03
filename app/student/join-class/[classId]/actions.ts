"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStudentSsoSession, setStudentSession } from "@/lib/student-session";

export async function bindSeat(formData: FormData) {
  const classId = formData.get("class_id") as string;
  const seatNumber = Number(formData.get("seat_number"));
  const ssoSession = await getStudentSsoSession();

  if (!classId || !seatNumber || !ssoSession) {
    redirect("/student/join-class?error=缺少必要資料");
  }

  const supabase = await createClient();

  // Verify the seat is actually available (sso_uid IS NULL)
  const { data: seatInfo } = await supabase
    .from("students")
    .select("id, sso_uid")
    .eq("class_id", classId)
    .eq("seat_number", seatNumber)
    .single();

  if (!seatInfo || seatInfo.sso_uid !== null) {
    redirect(`/student/join-class/${classId}?error=該座號已被綁定`);
  }

  // Update the student record
  const { error: updateError } = await supabase
    .from("students")
    .update({
      sso_uid: ssoSession.sso_uid,
      username: ssoSession.username,
      name: ssoSession.name,
    })
    .eq("id", seatInfo.id);

  if (updateError) {
    // Possibly unique constraint violation on (class_id, sso_uid)
    if (updateError.code === "23505") {
      redirect(`/student/join-class/${classId}?error=您已經加入這個班級了`);
    }
    redirect(`/student/join-class/${classId}?error=綁定座號失敗`);
  }

  // Generate session token
  const { data: sessionData, error: sessionError } = await supabase.rpc("create_sso_student_session", {
    target_student_id: seatInfo.id,
  }).single();

  if (sessionError || !sessionData) {
    redirect("/student/classes?message=成功加入班級，請重新進入");
  }

  await setStudentSession(sessionData.session_token);
  redirect("/student");
}
