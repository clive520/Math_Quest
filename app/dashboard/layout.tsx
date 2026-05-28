import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, Users, BookOpen, Settings, LogOut, ShieldCheck } from "lucide-react";

async function signOut() {
  "use server";

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: teacher } = await supabase
    .from("teachers")
    .select("display_name, is_admin, must_change_password")
    .eq("id", user.id)
    .maybeSingle();

  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") ?? "";

  if (teacher?.must_change_password && !pathname.startsWith("/dashboard/settings")) {
    redirect(
      `/dashboard/settings?error=${encodeURIComponent("請先修改密碼，才能繼續使用老師工作台")}`,
    );
  }

  return (
    <>
      <input className="sidebar-toggle-check" id="sidebar-toggle" type="checkbox" />
      <div className="dashboard-shell">
        <aside className="sidebar" aria-label="老師工作台導覽">
          <div className="sidebar-head">
            <Link className="brand" href="/dashboard">
              <span className="brand-full">Math Quest</span>
              <span className="brand-short">MQ</span>
            </Link>
            <label className="sidebar-toggle-button" htmlFor="sidebar-toggle">
              <span className="toggle-open">收合</span>
              <span className="toggle-closed">展開</span>
            </label>
          </div>
          <nav>
            <Link href="/dashboard">
              <LayoutDashboard size={20} className="nav-icon" />
              <span className="nav-label">總覽</span>
            </Link>
            <Link href="/dashboard/classes">
              <Users size={20} className="nav-icon" />
              <span className="nav-label">班級</span>
            </Link>
            <Link href="/dashboard/questions">
              <BookOpen size={20} className="nav-icon" />
              <span className="nav-label">我的題庫</span>
            </Link>
            {teacher?.is_admin ? (
              <Link href="/dashboard/admin/teachers">
                <ShieldCheck size={20} className="nav-icon" />
                <span className="nav-label">老師帳號</span>
              </Link>
            ) : null}
            <Link href="/dashboard/settings">
              <Settings size={20} className="nav-icon" />
              <span className="nav-label">帳號設定</span>
            </Link>
          </nav>
          <form action={signOut}>
            <button className="ghost-button" type="submit" style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", justifyContent: "flex-start" }}>
              <LogOut size={20} className="nav-icon" />
              <span className="nav-label">登出</span>
            </button>
          </form>
        </aside>

        <div className="dashboard-main">
          <header className="topbar">
            <div>
              <p className="eyebrow">老師工作台</p>
              <h1>{teacher?.display_name ?? user.email}</h1>
            </div>
          </header>
          {children}
        </div>
      </div>
    </>
  );
}
