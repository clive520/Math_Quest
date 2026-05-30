import { getTeacherBySlug, getPublicClasses } from "../data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Users } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const teacher = await getTeacherBySlug(slug);
  if (!teacher) return { title: "找不到頁面 | Math Quest" };
  return { title: `${teacher.display_name} 的專屬入口 | Math Quest` };
}

export default async function TeacherPortalPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const teacher = await getTeacherBySlug(slug);
  
  if (!teacher) {
    notFound();
  }

  const classes = await getPublicClasses(teacher.id);

  return (
    <main className="shell">
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", color: "var(--color-indigo-900)" }}>{teacher.display_name} 的專屬登入區</h1>
        <p style={{ color: "var(--color-slate-500)", marginTop: "8px" }}>請在下方點擊你的班級，再選擇自己的名字進入。</p>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {classes.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "48px 0" }}>
            <p style={{ color: "var(--color-slate-500)" }}>老師目前還沒有建立任何班級喔！</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
            {classes.map((cls) => (
              <Link 
                key={cls.id} 
                href={`/t/${teacher.portal_slug}/${cls.id}`}
                style={{ textDecoration: "none" }}
              >
                <div className="card hover:border-indigo-500" style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "16px", 
                  padding: "24px",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  border: "2px solid transparent"
                }}>
                  <div style={{ 
                    width: "48px", 
                    height: "48px", 
                    borderRadius: "50%", 
                    backgroundColor: "var(--color-indigo-100)", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    color: "var(--color-indigo-600)"
                  }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "1.25rem", margin: 0, color: "var(--color-slate-800)" }}>{cls.name}</h2>
                    <p style={{ fontSize: "0.9rem", color: "var(--color-slate-500)", margin: "4px 0 0 0" }}>
                      {cls.grade ? `${cls.grade}年級` : ""} {cls.semester ? `(${cls.semester})` : ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      <div style={{ textAlign: "center", marginTop: "48px" }}>
        <Link href="/" className="text-link">← 回首頁</Link>
      </div>
    </main>
  );
}
