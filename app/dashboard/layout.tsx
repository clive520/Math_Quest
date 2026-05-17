import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="dashboard-shell">
      <aside className="sidebar" aria-label="老師端導覽">
        <Link className="brand" href="/dashboard">
          Math Quest
        </Link>
        <nav>
          <Link href="/dashboard">總覽</Link>
          <Link href="/dashboard/classes">班級</Link>
          <Link href="/dashboard/settings">帳號設定</Link>
        </nav>
        <form action={signOut}>
          <button className="ghost-button" type="submit">
            登出
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
  );
}
