"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createAssignment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const classId = formData.get("class_id") as string;
  const dueDateTime = formData.get("end_at") as string; // 'YYYY-MM-DDTHH:mm'
  const questionIdsJson = formData.get("question_ids") as string;
  
  if (!title || !classId || !questionIdsJson) {
    redirect("/dashboard/assignments/new?error=Missing+required+fields");
  }

  let questionIds: string[] = [];
  try {
    questionIds = JSON.parse(questionIdsJson);
  } catch {
    redirect("/dashboard/assignments/new?error=Invalid+questions+data");
  }

  if (questionIds.length === 0) {
    redirect("/dashboard/assignments/new?error=You+must+select+at+least+one+question");
  }

  // Calculate end_at taking timezone into account if needed, but local datetime string works fine with timestamptz if formatted properly
  const endAt = dueDateTime ? new Date(dueDateTime).toISOString() : null;

  // Insert Assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .insert({
      title,
      description,
      class_id: classId,
      teacher_id: user.id,
      end_at: endAt,
      status: "open", // Directly publish it as open
    })
    .select("id")
    .single();

  if (assignmentError || !assignment) {
    redirect("/dashboard/assignments/new?error=Failed+to+create+assignment");
  }

  // Insert Assignment Questions
  const questionsToInsert = questionIds.map((qId, index) => ({
    assignment_id: assignment.id,
    question_template_id: qId,
    order_index: index,
    points: 1,
  }));

  const { error: questionsError } = await supabase
    .from("assignment_questions")
    .insert(questionsToInsert);

  if (questionsError) {
    redirect(`/dashboard/assignments/new?error=Failed+to+add+questions`);
  }

  revalidatePath("/dashboard/assignments");
  redirect(`/dashboard/assignments?message=Assignment+created+successfully`);
}
