"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { studentLoginWithPassword } from "./actions";

type Student = {
  id: string;
  name: string;
  seat_number: number;
};

export default function StudentLoginGrid({ students }: { students: Student[] }) {
  const router = useRouter();
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !password) return;

    setIsPending(true);
    setErrorMsg("");

    const result = await studentLoginWithPassword(selectedStudentId, password);
    if (result.error) {
      setErrorMsg(result.error);
      setIsPending(false);
    } else {
      router.push("/student");
    }
  };

  return (
    <div className="card" style={{ padding: "32px", maxWidth: "480px", margin: "0 auto", backgroundColor: "white" }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {errorMsg && (
          <div style={{ padding: "12px", backgroundColor: "var(--color-red-50)", color: "var(--color-red-700)", borderRadius: "6px", textAlign: "center" }}>
            {errorMsg}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label htmlFor="student-select" style={{ fontWeight: 600, color: "var(--color-slate-700)" }}>選擇學生</label>
          <select 
            id="student-select"
            value={selectedStudentId} 
            onChange={e => {
              setSelectedStudentId(e.target.value);
              setErrorMsg("");
            }}
            style={{ 
              padding: "12px", 
              borderRadius: "6px", 
              border: "1px solid var(--color-slate-300)",
              fontSize: "1.1rem"
            }}
          >
            <option value="" disabled>-- 請選擇你的名字 --</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.seat_number}號 - {student.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label htmlFor="password-input" style={{ fontWeight: 600, color: "var(--color-slate-700)" }}>通關密碼</label>
          <input 
            id="password-input"
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="請輸入密碼"
            style={{ 
              padding: "12px", 
              borderRadius: "6px", 
              border: "1px solid var(--color-slate-300)",
              fontSize: "1.1rem",
              letterSpacing: "2px"
            }}
          />
        </div>

        <button type="submit" className="button primary" disabled={isPending || !selectedStudentId || !password} style={{ marginTop: "16px" }}>
          {isPending ? "登入中..." : "登入開始闖關！"}
        </button>
      </form>
    </div>
  );
}
