import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/student-session";
import { signOutStudent } from "./actions";

export default async function StudentPage() {
  const student = await getStudentSession();

  if (!student) {
    redirect("/student-login");
  }

  return (
    <main className="dashboard-content student-content">
      <section className="section-heading">
        <div>
          <p className="eyebrow">學生頁面</p>
          <h1>{student.student_name}</h1>
          <p className="muted-line">
            {student.class_name} · {student.seat_number} 號 · 班級代碼 {student.class_code}
          </p>
        </div>
        <form action={signOutStudent}>
          <button className="text-button" type="submit">
            登出
          </button>
        </form>
      </section>

      <section className="empty-state">
        <h3>目前沒有任務</h3>
        <p>等老師發布 Math Quest 任務後，就會出現在這裡。</p>
      </section>
    </main>
  );
}
