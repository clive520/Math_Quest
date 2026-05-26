import Link from "next/link";
import QRCode from "qrcode";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ClassQrPageProps = {
  params: Promise<{
    classId: string;
  }>;
};

function getSiteUrlFromHeaders(host: string | null, protocol: string | null) {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (host) {
    return `${protocol ?? "https"}://${host}`;
  }

  return "https://math-quest-clive520s-projects.vercel.app";
}

export default async function ClassQrPage({ params }: ClassQrPageProps) {
  const { classId } = await params;
  const supabase = await createClient();
  const headerStore = await headers();
  const siteUrl = getSiteUrlFromHeaders(
    headerStore.get("host"),
    headerStore.get("x-forwarded-proto"),
  );

  const { data: classInfo } = await supabase
    .from("classes")
    .select("id, name, grade, semester, class_code")
    .eq("id", classId)
    .eq("archived", false)
    .maybeSingle();

  if (!classInfo) {
    notFound();
  }

  const joinUrl = `${siteUrl}/join/${classInfo.class_code}`;
  const qrCodeDataUrl = await QRCode.toDataURL(joinUrl, {
    margin: 1,
    width: 260,
  });

  return (
    <main className="dashboard-content">
      <section className="section-heading">
        <div>
          <p className="eyebrow">學生加入班級</p>
          <h2>{classInfo.name}</h2>
          <p className="muted-line">
            {classInfo.grade ? `${classInfo.grade} 年級` : "未設定年級"}
            {classInfo.semester ? ` · ${classInfo.semester}` : ""}
          </p>
        </div>
        <div className="section-actions">
          <Link className="text-link" href={`/dashboard/classes/${classInfo.id}`}>
            查看學生狀況
          </Link>
          <Link className="text-link" href="/dashboard/classes">
            返回班級列表
          </Link>
        </div>
      </section>

      <section className="join-card" aria-label="學生加入資訊">
        <div>
          <p className="eyebrow">班級代碼</p>
          <h3>{classInfo.class_code}</h3>
          <p>{joinUrl}</p>
          <div className="join-actions">
            <a className="primary-link" href={joinUrl}>
              開啟學生加入頁
            </a>
          </div>
        </div>
        <img alt={`${classInfo.name} 加入班級 QR Code`} src={qrCodeDataUrl} />
      </section>
    </main>
  );
}
