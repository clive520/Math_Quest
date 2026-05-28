"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuestion, updateQuestion } from "./actions";

type QuestionFormProps = {
  initialData?: any;
};

export default function QuestionForm({ initialData }: QuestionFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [variables, setVariables] = useState<Record<string, { min: number, max: number }>>(
    initialData?.variables || {}
  );
  
  const [template, setTemplate] = useState(initialData?.template || "{{a}} + {{b}} = ?");
  const [answerRule, setAnswerRule] = useState(initialData?.answer_rule || "a + b");
  
  // 預覽功能用
  const [previewQuestion, setPreviewQuestion] = useState("");
  const [previewAnswer, setPreviewAnswer] = useState("");

  const handleAddVariable = (varName: string) => {
    if (!varName) return;
    if (variables[varName]) return;
    setVariables(prev => ({ ...prev, [varName]: { min: 1, max: 10 } }));
  };

  const handleRemoveVariable = (varName: string) => {
    const newVars = { ...variables };
    delete newVars[varName];
    setVariables(newVars);
  };

  const updateVariable = (varName: string, field: 'min' | 'max', value: number) => {
    setVariables(prev => ({
      ...prev,
      [varName]: {
        ...prev[varName],
        [field]: value
      }
    }));
  };

  const generatePreview = () => {
    try {
      let previewTpl = template;
      let evaluatedAns = answerRule;
      const values: Record<string, number> = {};

      Object.keys(variables).forEach(v => {
        const min = variables[v].min;
        const max = variables[v].max;
        const val = Math.floor(Math.random() * (max - min + 1)) + min;
        values[v] = val;
        
        // 替換題目中的 {{var}}
        previewTpl = previewTpl.split(`{{${v}}}`).join(val.toString());
      });

      // 簡單替換答案規則中的變數
      // 注意：這只是簡易替換做預覽，實際可能會需要用安全的 math evaluator
      Object.keys(values).forEach(v => {
        // 使用正則避免把例如 ab 替換掉，確保替換獨立變數
        const regex = new RegExp(`\\b${v}\\b`, 'g');
        evaluatedAns = evaluatedAns.replace(regex, values[v].toString());
      });

      // 嘗試計算答案 (⚠️ 注意：這裡只用於老師預覽測試，請確保不要執行危險代碼)
      // eslint-disable-next-line no-new-func
      const ansFunc = new Function(`return ${evaluatedAns}`);
      const finalAns = ansFunc();

      setPreviewQuestion(previewTpl);
      setPreviewAnswer(finalAns?.toString() || "");
      setErrorMsg("");
    } catch (e: any) {
      setErrorMsg("預覽失敗，請檢查題目模板與答案規則是否正確。");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    formData.set("variables", JSON.stringify(variables));

    let result;
    if (isEdit) {
      result = await updateQuestion(initialData.id, formData);
    } else {
      result = await createQuestion(formData);
    }

    if (result.error) {
      setErrorMsg(result.error);
      setIsPending(false);
    } else {
      router.push("/dashboard/questions");
    }
  };

  return (
    <div style={{ display: "grid", gap: "24px", gridTemplateColumns: "2fr 1fr", alignItems: "start" }}>
      <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {errorMsg && (
          <div style={{ padding: "12px", backgroundColor: "var(--color-red-50)", color: "var(--color-red-700)", borderRadius: "6px" }}>
            {errorMsg}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="title">標題</label>
          <input type="text" id="title" name="title" required defaultValue={initialData?.title} placeholder="例如：二位數加法進階" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className="form-group">
            <label htmlFor="grade">年級</label>
            <input type="number" id="grade" name="grade" min="1" max="6" defaultValue={initialData?.grade} placeholder="1-6" />
          </div>
          <div className="form-group">
            <label htmlFor="unit">單元</label>
            <input type="text" id="unit" name="unit" defaultValue={initialData?.unit} placeholder="例如：第一單元" />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="question_type">題型</label>
          <select id="question_type" name="question_type" defaultValue={initialData?.question_type || "short_answer"}>
            <option value="short_answer">填空題 (計算題)</option>
            {/* 第一版以四則運算填空題為主，選擇題暫時隱藏或保留 */}
          </select>
        </div>

        <div className="form-group">
          <label>動態變數設定</label>
          <div style={{ fontSize: "0.9rem", color: "var(--color-slate-500)", marginBottom: "8px" }}>
            輸入變數名稱 (例如 a, b) 並設定隨機產生的數字範圍。
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "16px", backgroundColor: "var(--color-slate-50)", borderRadius: "6px" }}>
            {Object.entries(variables).map(([v, range]) => (
              <div key={v} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ fontWeight: 600, width: "30px" }}>{v}</span>
                <input 
                  type="number" 
                  value={range.min} 
                  onChange={e => updateVariable(v, 'min', parseInt(e.target.value))} 
                  style={{ width: "80px" }}
                  title="最小值"
                />
                <span>~</span>
                <input 
                  type="number" 
                  value={range.max} 
                  onChange={e => updateVariable(v, 'max', parseInt(e.target.value))} 
                  style={{ width: "80px" }}
                  title="最大值"
                />
                <button type="button" onClick={() => handleRemoveVariable(v)} className="button ghost" style={{ color: "var(--color-red-600)", padding: "4px 8px" }}>刪除</button>
              </div>
            ))}
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button 
                type="button" 
                className="button secondary" 
                onClick={() => {
                  const name = window.prompt("請輸入新變數名稱 (只能為英文字母):");
                  if (name && /^[a-zA-Z]+$/.test(name)) handleAddVariable(name);
                }}
              >
                + 新增變數
              </button>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="template">題目內容 (包含變數)</label>
          <div style={{ fontSize: "0.9rem", color: "var(--color-slate-500)", marginBottom: "8px" }}>
            使用 <code>{"{{"}變數名稱{"}}"}</code> 來插入變數，例如： <code>{"{{"}a{"}}"} + {"{{"}b{"}}"} = ?</code>
          </div>
          <textarea 
            id="template" 
            name="template" 
            required 
            rows={4} 
            value={template}
            onChange={e => setTemplate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="answer_rule">答案計算規則</label>
          <div style={{ fontSize: "0.9rem", color: "var(--color-slate-500)", marginBottom: "8px" }}>
            輸入數學運算式，例如 <code>a + b</code> 或 <code>a * b</code>。
          </div>
          <input 
            type="text" 
            id="answer_rule" 
            name="answer_rule" 
            required 
            value={answerRule}
            onChange={e => setAnswerRule(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
          <button type="button" className="button secondary" onClick={() => router.push("/dashboard/questions")} disabled={isPending}>
            取消
          </button>
          <button type="submit" className="button primary" disabled={isPending}>
            {isPending ? "儲存中..." : (isEdit ? "更新題目" : "建立題目")}
          </button>
        </div>
      </form>

      <div className="card" style={{ position: "sticky", top: "24px" }}>
        <h3>題目預覽</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--color-slate-500)", marginBottom: "16px" }}>
          點擊按鈕，測試動態變數產生的結果是否符合預期。
        </p>
        
        <button type="button" className="button secondary" style={{ width: "100%", marginBottom: "24px" }} onClick={generatePreview}>
          產生隨機預覽
        </button>

        <div style={{ minHeight: "150px" }}>
          {previewQuestion ? (
            <>
              <div style={{ marginBottom: "16px" }}>
                <strong>題目：</strong>
                <div style={{ marginTop: "8px", padding: "12px", backgroundColor: "var(--color-slate-50)", borderRadius: "6px", fontSize: "1.2rem" }}>
                  {previewQuestion}
                </div>
              </div>
              <div>
                <strong>計算答案：</strong>
                <div style={{ marginTop: "8px", padding: "12px", backgroundColor: "var(--color-slate-50)", borderRadius: "6px", fontSize: "1.2rem", color: "var(--color-indigo-700)", fontWeight: "bold" }}>
                  {previewAnswer}
                </div>
              </div>
            </>
          ) : (
            <div style={{ color: "var(--color-slate-400)", textAlign: "center", paddingTop: "40px" }}>
              點擊上方按鈕產生預覽
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
