import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// JWT payload structure from SSO
interface SSOPayload {
  uid: string;
  username: string;
  name: string;
  role: "student" | "teacher" | "admin";
  iat: number;
  exp: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=Missing+Token", request.url));
  }

  const jwtSecret = process.env.SSO_JWT_SECRET;
  if (!jwtSecret) {
    console.error("SSO_JWT_SECRET is not configured");
    return NextResponse.redirect(new URL("/login?error=Server+Configuration+Error", request.url));
  }

  let payload: SSOPayload;
  try {
    payload = jwt.verify(token, jwtSecret) as SSOPayload;
  } catch (err) {
    console.error("Invalid JWT token:", err);
    return NextResponse.redirect(new URL("/login?error=Invalid+or+Expired+Token", request.url));
  }

  const { uid, role, name, username } = payload;
  const internalPassword = process.env.SSO_INTERNAL_PASSWORD || "fallback_internal_password_do_not_use_in_prod";

  if (role === "teacher" || role === "admin") {
    // ==== TEACHER LOGIN LOGIC (Supabase Auth mapping) ====
    const email = `${uid}@luyang.sso.local`;
    
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const supabaseServer = await createServerClient();

    let authResponse = await supabaseServer.auth.signInWithPassword({
      email,
      password: internalPassword
    });

    if (authResponse.error && authResponse.error.message.includes("Invalid login credentials")) {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
         return NextResponse.redirect(new URL("/login?error=Cannot+auto-create+account", request.url));
      }

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: internalPassword,
        email_confirm: true,
      });

      if (createError || !newUser.user) {
        const errorMsg = createError ? createError.message : "No user returned";
        return NextResponse.redirect(new URL("/login?error=Failed+to+create+account:+" + encodeURIComponent(errorMsg), request.url));
      }

      await supabaseAdmin.from("teachers").upsert({
        id: newUser.user.id,
        name: name,
        sso_uid: uid,
      });

      authResponse = await supabaseServer.auth.signInWithPassword({
        email,
        password: internalPassword
      });
    }

    if (authResponse.error) {
      return NextResponse.redirect(new URL("/login?error=Sign+in+failed", request.url));
    }

    return NextResponse.redirect(new URL("/dashboard", request.url));

  } else if (role === "student") {
    // ==== STUDENT LOGIN LOGIC (Custom Cookie mapping) ====
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    let { data: student } = await supabaseAdmin
      .from("students")
      .select("id, class_id, seat_number, name, login_code, classes(name)")
      .eq("sso_uid", uid)
      .single();

    if (!student) {
      const { data: matchedStudent } = await supabaseAdmin
        .from("students")
        .select("id, class_id, seat_number, name, login_code, classes(name)")
        .eq("username", username)
        .single();

      if (matchedStudent) {
        await supabaseAdmin
          .from("students")
          .update({ sso_uid: uid })
          .eq("id", matchedStudent.id);
        
        student = matchedStudent;
      } else {
        return NextResponse.redirect(new URL("/login?error=Student+record+not+found.+Please+ask+your+teacher+to+add+you.", request.url));
      }
    }

    const studentSessionData = {
      student_id: student.id,
      student_name: student.name,
      class_id: student.class_id,
      class_name: (student.classes as any)?.name || "未知班級",
      seat_number: student.seat_number,
      class_code: "sso-login",
    };

    const cookieStore = await cookies();
    cookieStore.set("student_session", JSON.stringify(studentSessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.redirect(new URL("/student", request.url));
  } else {
    return NextResponse.redirect(new URL("/login?error=Unknown+role", request.url));
  }
}
