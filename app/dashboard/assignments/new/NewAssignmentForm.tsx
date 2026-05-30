"use client";

import { useState } from "react";
import { createAssignment } from "../actions";
import { Search, CheckCircle2 } from "lucide-react";

type ClassData = { id: string; name: string; grade: number | null };
type QuestionData = { id: string; title: string; grade: number | null; unit: string | null; is_public: boolean };

export default function NewAssignmentForm({ 
  classes, 
  questions 
}: { 
  classes: ClassData[];
  questions: QuestionData[];
}) {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (q.unit && q.unit.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleQuestion = (id: string) => {
    setSelectedQuestions(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  return (
    <form action={createAssignment} onSubmit={() => setIsSubmitting(true)} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* 隱藏欄位傳送題目 ID */}
      <input type="hidden" name="question_ids" value={JSON.stringify(selectedQuestions)} />

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label htmlFor="title" style={{ fontWeight: 600 }}>任務名稱 <span style={{ color: "var(--color-red-500)" }}>*</span></label>
        <input 
          id="title" 
          name="title" 
          required 
          placeholder="例如：第一單元綜合測驗" 
          style={{ padding: "12px", borderRadius: "6px", border: "1px solid var(--color-slate-300)" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label htmlFor="class_id" style={{ fontWeight: 600 }}>指派對象 (班級) <span style={{ color: "var(--color-red-500)" }}>*</span></label>
          <select 
            id="class_id" 
            name="class_id" 
            required 
            defaultValue=""
            style={{ padding: "12px", borderRadius: "6px", border: "1px solid var(--color-slate-300)" }}
          >
            <option value="" disabled>請選擇班級</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.id}>{cls.name} {cls.grade ? `(${cls.grade}年級)` : ""}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label htmlFor="end_at" style={{ fontWeight: 600 }}>截止時間 <span style={{ color: "var(--color-slate-400)", fontWeight: "normal", fontSize: "0.9rem" }}>(選填)</span></label>
          <input 
            id="end_at" 
            name="end_at" 
            type="datetime-local" 
            style={{ padding: "12px", borderRadius: "6px", border: "1px solid var(--color-slate-300)" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <label htmlFor="description" style={{ fontWeight: 600 }}>任務說明 <span style={{ color: "var(--color-slate-400)", fontWeight: "normal", fontSize: "0.9rem" }}>(選填)</span></label>
        <textarea 
          id="description" 
          name="description" 
          rows={2}
          placeholder="給學生的話，例如：請在放學前完成作答。" 
          style={{ padding: "12px", borderRadius: "6px", border: "1px solid var(--color-slate-300)" }}
        />
      </div>

      <hr style={{ border: 0, borderTop: "1px solid var(--color-slate-200)", margin: "8px 0" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>挑選題目</h3>
            <p style={{ margin: "4px 0 0 0", color: "var(--color-slate-500)", fontSize: "0.9rem" }}>已選取 {selectedQuestions.length} 題</p>
          </div>
          <div style={{ position: "relative", width: "250px" }}>
            <input 
              type="text" 
              placeholder="搜尋題目..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: "8px 12px 8px 36px", width: "100%", borderRadius: "6px", border: "1px solid var(--color-slate-300)" }}
            />
            <Search size={16} style={{ position: "absolute", left: "12px", top: "10px", color: "var(--color-slate-400)" }} />
          </div>
        </div>

        <div style={{ 
          border: "1px solid var(--color-slate-200)", 
          borderRadius: "8px", 
          maxHeight: "350px", 
          overflowY: "auto",
          backgroundColor: "var(--color-slate-50)"
        }}>
          {filteredQuestions.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "var(--color-slate-500)" }}>找不到符合的題目</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {filteredQuestions.map(q => {
                const isSelected = selectedQuestions.includes(q.id);
                return (
                  <div 
                    key={q.id} 
                    onClick={() => toggleQuestion(q.id)}
                    style={{ 
                      padding: "16px", 
                      borderBottom: "1px solid var(--color-slate-200)",
                      backgroundColor: isSelected ? "var(--color-indigo-50)" : "white",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      cursor: "pointer",
                      transition: "background-color 0.2s"
                    }}
                  >
                    <div style={{ 
                      width: "24px", 
                      height: "24px", 
                      borderRadius: "4px", 
                      border: `2px solid ${isSelected ? "var(--color-indigo-500)" : "var(--color-slate-300)"}`,
                      backgroundColor: isSelected ? "var(--color-indigo-500)" : "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {isSelected && <CheckCircle2 size={16} color="white" />}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: isSelected ? "var(--color-indigo-900)" : "var(--color-slate-800)" }}>{q.title}</h4>
                      <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "var(--color-slate-500)" }}>
                        {q.grade ? `${q.grade}年級` : ""} {q.unit ? ` - ${q.unit}` : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
        <button type="submit" className="button primary" disabled={isSubmitting || selectedQuestions.length === 0}>
          {isSubmitting ? "發布中..." : "發布任務"}
        </button>
      </div>

    </form>
  );
}
