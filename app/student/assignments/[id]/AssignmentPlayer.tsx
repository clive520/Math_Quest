"use client";

import { useState, useEffect } from "react";
import { submitAnswerAction } from "./actions";
import { CheckCircle2, XCircle, ArrowRight, Trophy } from "lucide-react";

type Question = {
  id: string;
  title: string;
  template: string;
  variables: any;
  answer_rule: string;
  question_type: string;
  choices: any;
  points: number;
};

type PreviousAnswer = {
  question_template_id: string;
  generated_values: Record<string, number>;
  student_answer: string;
  correct_answer: string;
  is_correct: boolean;
};

export default function AssignmentPlayer({
  assignmentId,
  questions,
  previousAnswers
}: {
  assignmentId: string;
  questions: Question[];
  previousAnswers: PreviousAnswer[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // State for the current question
  const [generatedValues, setGeneratedValues] = useState<Record<string, number>>({});
  const [renderedTemplate, setRenderedTemplate] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  
  // Student input state
  const [studentAnswer, setStudentAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const currentQuestion = questions[currentIndex];
  const previousAnswer = previousAnswers.find(pa => pa.question_template_id === currentQuestion?.id);

  // Initialize question
  useEffect(() => {
    if (!currentQuestion) return;

    if (previousAnswer) {
      // If already answered, use previous values
      setGeneratedValues(previousAnswer.generated_values);
      setStudentAnswer(previousAnswer.student_answer);
      setFeedback(previousAnswer.is_correct ? "correct" : "incorrect");
      
      let temp = currentQuestion.template;
      Object.entries(previousAnswer.generated_values).forEach(([key, val]) => {
        temp = temp.replace(new RegExp(`{{${key}}}`, "g"), String(val));
      });
      setRenderedTemplate(temp);
      setCorrectAnswer(previousAnswer.correct_answer);
    } else {
      // Generate new variables
      const vars = currentQuestion.variables || [];
      const newValues: Record<string, number> = {};
      
      // Default fallback if variables is empty but template has {{A}}, {{B}}
      // Actually we will parse variables json. Let's assume it's an array [{name: 'A', min:1, max:10}]
      let parsedVars = [];
      if (Array.isArray(vars)) {
        parsedVars = vars;
      } else if (typeof vars === 'object' && vars !== null) {
        // Handle object format {"A": {"min": 1, "max": 10}}
        parsedVars = Object.entries(vars).map(([name, conf]: [string, any]) => ({ name, ...conf }));
      }
      
      // If no variables defined but template has placeholders, generate default 1-10
      const matches = currentQuestion.template.match(/{{(.*?)}}/g);
      if (matches && parsedVars.length === 0) {
        matches.forEach(m => {
          const name = m.replace(/{{|}}/g, '');
          if (!parsedVars.find(v => v.name === name)) {
            parsedVars.push({ name, min: 1, max: 10 });
          }
        });
      }

      parsedVars.forEach(v => {
        const min = v.min || 1;
        const max = v.max || 10;
        newValues[v.name] = Math.floor(Math.random() * (max - min + 1)) + min;
      });

      setGeneratedValues(newValues);

      // Render template
      let temp = currentQuestion.template;
      Object.entries(newValues).forEach(([key, val]) => {
        temp = temp.replace(new RegExp(`{{${key}}}`, "g"), String(val));
      });
      setRenderedTemplate(temp);

      // Calculate correct answer
      try {
        let rule = currentQuestion.answer_rule;
        Object.entries(newValues).forEach(([key, val]) => {
          rule = rule.replace(new RegExp(`\\b${key}\\b`, "g"), String(val));
        });
        // eslint-disable-next-line no-new-func
        const result = new Function(`return ${rule}`)();
        setCorrectAnswer(String(result));
      } catch (err) {
        console.error("Failed to calculate answer", err);
        setCorrectAnswer("Error");
      }
      
      setStudentAnswer("");
      setFeedback(null);
    }
  }, [currentIndex, currentQuestion, previousAnswer]);

  if (!currentQuestion) {
    return (
      <div className="card" style={{ padding: "64px", textAlign: "center" }}>
        <Trophy size={64} color="var(--color-yellow-500)" style={{ margin: "0 auto 24px" }} />
        <h2 style={{ fontSize: "2rem", marginBottom: "16px" }}>闖關完成！</h2>
        <p style={{ color: "var(--color-slate-500)", fontSize: "1.1rem" }}>你已經完成所有的題目，太棒了！</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer || isSubmitting || previousAnswer) return;

    setIsSubmitting(true);
    
    // Check answer
    const isCorrect = studentAnswer.trim() === correctAnswer.trim();
    setFeedback(isCorrect ? "correct" : "incorrect");

    try {
      await submitAnswerAction(
        assignmentId,
        currentQuestion.id,
        generatedValues,
        renderedTemplate,
        studentAnswer,
        correctAnswer,
        isCorrect
      );
    } catch (err) {
      console.error(err);
      alert("提交失敗，請重試");
      setFeedback(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextQuestion = () => {
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <div className="card" style={{ padding: "32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.25rem", color: "var(--color-slate-700)", margin: 0 }}>
          第 {currentIndex + 1} 題 / 共 {questions.length} 題
        </h2>
        <span style={{ backgroundColor: "var(--color-slate-100)", padding: "4px 12px", borderRadius: "16px", fontSize: "0.9rem", fontWeight: 600 }}>
          {currentQuestion.points} 分
        </span>
      </div>

      <div style={{ 
        padding: "32px", 
        backgroundColor: "var(--color-slate-50)", 
        borderRadius: "12px", 
        fontSize: "1.5rem", 
        marginBottom: "32px",
        border: "1px solid var(--color-slate-200)",
        whiteSpace: "pre-wrap"
      }}>
        {renderedTemplate}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label htmlFor="answer" style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>你的答案：</label>
          <input
            id="answer"
            type="text"
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            disabled={!!previousAnswer || feedback !== null || isSubmitting}
            placeholder="請輸入答案"
            style={{ 
              width: "100%", 
              padding: "16px", 
              fontSize: "1.25rem", 
              borderRadius: "8px", 
              border: `2px solid ${feedback === 'correct' ? 'var(--color-green-500)' : feedback === 'incorrect' ? 'var(--color-red-500)' : 'var(--color-slate-300)'}`
            }}
            autoFocus
          />
        </div>

        {feedback && (
          <div style={{ 
            padding: "16px", 
            borderRadius: "8px", 
            backgroundColor: feedback === 'correct' ? "var(--color-green-50)" : "var(--color-red-50)",
            color: feedback === 'correct' ? "var(--color-green-700)" : "var(--color-red-700)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 600
          }}>
            {feedback === 'correct' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
            <span>{feedback === 'correct' ? "答對了！太棒了！" : `答錯了。正確答案是：${correctAnswer}`}</span>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
          {(!feedback && !previousAnswer) ? (
            <button type="submit" className="button primary" disabled={!studentAnswer || isSubmitting}>
              {isSubmitting ? "批改中..." : "送出答案"}
            </button>
          ) : (
            <button type="button" className="button primary" onClick={nextQuestion} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{currentIndex === questions.length - 1 ? "完成任務" : "下一題"}</span>
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
