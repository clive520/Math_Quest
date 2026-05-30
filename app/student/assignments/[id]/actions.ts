"use server";

import { createClient } from "@/lib/supabase/server";
import { getStudentSession } from "@/lib/student-session";
import { revalidatePath } from "next/cache";

export async function submitAnswerAction(
  assignmentId: string,
  questionTemplateId: string,
  generatedValues: Record<string, number>,
  renderedQuestion: string,
  studentAnswer: string,
  correctAnswer: string,
  isCorrect: boolean
) {
  const student = await getStudentSession();
  if (!student) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  const { error } = await supabase.rpc("submit_student_question_answer", {
    target_student_id: student.student_id,
    target_assignment_id: assignmentId,
    target_question_template_id: questionTemplateId,
    input_generated_values: generatedValues,
    input_rendered_question: renderedQuestion,
    input_student_answer: studentAnswer,
    input_correct_answer: correctAnswer,
    input_is_correct: isCorrect
  });

  if (error) {
    console.error("Failed to submit answer:", error);
    throw new Error("Failed to submit answer");
  }

  revalidatePath(`/student/assignments/${assignmentId}`);
}
