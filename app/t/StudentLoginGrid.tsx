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
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setPassword("");
    setErrorMsg("");
  };

  const handleClose = () => {
    setSelectedStudent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !password) return;

    setIsPending(true);
    setErrorMsg("");

    const result = await studentLoginWithPassword(selectedStudent.id, password);
    if (result.error) {
      setErrorMsg(result.error);
      setIsPending(false);
    } else {
      router.push("/student");
    }
  };

  return (
    <>
      <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
        {students.map((student) => (
          <button
            key={student.id}
            onClick={() => handleStudentClick(student)}
            style={{
              padding: "16px",
              backgroundColor: "white",
              border: "1px solid var(--color-slate-200)",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--color-indigo-500)";
              e.currentTarget.style.backgroundColor = "var(--color-indigo-50)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--color-slate-200)";
              e.currentTarget.style.backgroundColor = "white";
            }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "var(--color-slate-100)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.2rem",
              fontWeight: "bold",
              color: "var(--color-slate-600)"
            }}>
              {student.seat_number}
            </div>
            <span style={{ fontWeight: 600, color: "var(--color-slate-800)" }}>{student.name}</span>
          </button>
        ))}
      </div>

      {selectedStudent && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px", zIndex: 1000
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "400px", padding: "32px", position: "relative" }}>
            <button 
              onClick={handleClose}
              style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "var(--color-slate-400)" }}
            >
              ×
            </button>
            <h2 style={{ textAlign: "center", marginBottom: "8px" }}>哈囉，{selectedStudent.name}！</h2>
            <p style={{ textAlign: "center", color: "var(--color-slate-500)", marginBottom: "24px" }}>請輸入你的通關密碼</p>
            
            {errorMsg && (
              <div style={{ padding: "12px", backgroundColor: "var(--color-red-50)", color: "var(--color-red-700)", borderRadius: "6px", marginBottom: "16px", textAlign: "center" }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
                placeholder="密碼"
                style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "4px" }}
              />
              <button type="submit" className="button primary" disabled={isPending || !password}>
                {isPending ? "登入中..." : "開始闖關！"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
