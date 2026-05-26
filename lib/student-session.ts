import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const STUDENT_SESSION_COOKIE = "math_quest_student_session";

export async function setStudentSession(sessionToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(STUDENT_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearStudentSession() {
  const cookieStore = await cookies();
  cookieStore.delete(STUDENT_SESSION_COOKIE);
}

export async function getStudentSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("get_student_session", {
      session_token: sessionToken,
    })
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as {
    class_code: string;
    class_id: string;
    class_name: string;
    seat_number: number;
    student_id: string;
    student_name: string;
  };
}
