"use server";

import { redirect } from "next/navigation";
import { clearStudentSession } from "@/lib/student-session";

export async function signOutStudent() {
  await clearStudentSession();
  redirect("/student-login");
}
