import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { joinClass } from "./actions";

type JoinClassPageProps = {
  params: Promise<{
    classCode: string;
  }>;
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function JoinClassPage({ params, searchParams }: JoinClassPageProps) {
  const { classCode } = await params;
  const query = await searchParams;
  const normalizedClassCode = classCode.toUpperCase();
  const supabase = await createClient();
  const { data: classInfo } = await supabase
    .rpc("get_class_by_code", {
      input_class_code: normalizedClassCode,
    })
    .maybeSingle();

  if (!classInfo) {
    notFound();
  }

  const targetClass = classInfo as {
    class_code: string;
    grade: number | null;
    name: string;
    semester: string | null;
  };

  return (
    <main className="auth-shell">
      <section className="auth-intro" aria-labelledby="join-title">
        <p className="eyebrow">Math Quest</p>
        <h1 id="join-title">加入 {targetClass.name}</h1>
        <p className="lead">
          請輸入你的座號、姓名，並設定下次登入要使用的密碼。之後回到 Math Quest 時，就可以用班級代碼、座號和密碼登入。
        </p>
        <Link className="text-link" href="/student-login">
          我已經加入班級，要登入
        </Link>
      </section>

      <section className="auth-panel" aria-label="加入班級">
        {query.error ? <p className="notice error">{query.error}</p> : null}

        <div className="join-class-summary">
          <span>班級代碼</span>
          <strong>{targetClass.class_code}</strong>
          <p>
            {targetClass.grade ? `${targetClass.grade} 年級` : "未設定年級"}
            {targetClass.semester ? ` · ${targetClass.semester}` : ""}
          </p>
        </div>

        <form className="form" action={joinClass}>
          <input name="class_code" type="hidden" value={targetClass.class_code} />
          <label>
            座號
            <input name="seat_number" required inputMode="numeric" placeholder="例如：12" />
          </label>
          <label>
            姓名
            <input name="name" required placeholder="例如：王小明" />
          </label>
          <label>
            自訂密碼
            <input name="password" type="password" required minLength={4} />
          </label>
          <label>
            再輸入一次密碼
            <input name="confirm_password" type="password" required minLength={4} />
          </label>
          <button type="submit">加入班級</button>
        </form>
      </section>
    </main>
  );
}
