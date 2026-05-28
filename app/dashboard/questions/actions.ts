"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getKnowledgePoints() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("knowledge_points")
    .select("*")
    .order("grade", { ascending: true })
    .order("code", { ascending: true });
    
  if (error) {
    console.error("Error fetching knowledge points:", error);
    return [];
  }
  return data;
}

export async function getQuestions() {
  const supabase = await createClient();

  const { data: userResponse, error: authError } = await supabase.auth.getUser();
  if (authError || !userResponse.user) {
    throw new Error("Unauthorized");
  }

  const { data: questions, error } = await supabase
    .from("question_templates")
    .select("*, question_knowledge_points(knowledge_points(*))")
    .eq("owner_teacher_id", userResponse.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching questions:", error);
    throw new Error("Failed to fetch questions");
  }

  return questions;
}

export async function getQuestion(id: string) {
  const supabase = await createClient();

  const { data: userResponse, error: authError } = await supabase.auth.getUser();
  if (authError || !userResponse.user) {
    throw new Error("Unauthorized");
  }

  const { data: question, error } = await supabase
    .from("question_templates")
    .select("*, question_knowledge_points(knowledge_points(*))")
    .eq("id", id)
    .eq("owner_teacher_id", userResponse.user.id)
    .single();

  if (error) {
    console.error("Error fetching question:", error);
    throw new Error("Failed to fetch question");
  }

  return question;
}

export async function createQuestion(formData: FormData) {
  const supabase = await createClient();
  const { data: userResponse, error: authError } = await supabase.auth.getUser();
  
  if (authError || !userResponse.user) {
    return { error: "尚未登入，請重新登入" };
  }

  const title = formData.get("title")?.toString().trim();
  const grade = formData.get("grade")?.toString();
  const unit = formData.get("unit")?.toString().trim();
  const question_type = formData.get("question_type")?.toString();
  const template = formData.get("template")?.toString().trim();
  const answer_rule = formData.get("answer_rule")?.toString().trim();
  const variablesStr = formData.get("variables")?.toString().trim();
  const knowledgePointIds = formData.getAll("knowledge_point_ids") as string[];
  
  if (!title || !template) {
    return { error: "標題與題目內容為必填" };
  }

  if (question_type !== 'short_answer' && question_type !== 'multiple_choice' && question_type !== 'true_false') {
    return { error: "無效的題型" };
  }

  let variables = {};
  if (variablesStr) {
    try {
      variables = JSON.parse(variablesStr);
    } catch (e) {
      return { error: "變數設定格式錯誤 (需為 JSON)" };
    }
  }

  const { data, error } = await supabase
    .from("question_templates")
    .insert([
      {
        owner_teacher_id: userResponse.user.id,
        title,
        grade: grade ? parseInt(grade, 10) : null,
        unit,
        question_type,
        template,
        variables,
        answer_rule: answer_rule || "",
        visibility: "private" // 預設為私人
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating question:", error);
    return { error: "建立失敗: " + error.message };
  }

  if (knowledgePointIds && knowledgePointIds.length > 0) {
    const mappings = knowledgePointIds.map((kpId) => ({
      question_id: data.id,
      knowledge_point_id: kpId,
    }));
    await supabase.from("question_knowledge_points").insert(mappings);
  }

  revalidatePath("/dashboard/questions");
  return { success: true, id: data.id };
}

export async function updateQuestion(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: userResponse, error: authError } = await supabase.auth.getUser();
  
  if (authError || !userResponse.user) {
    return { error: "尚未登入，請重新登入" };
  }

  const title = formData.get("title")?.toString().trim();
  const grade = formData.get("grade")?.toString();
  const unit = formData.get("unit")?.toString().trim();
  const question_type = formData.get("question_type")?.toString();
  const template = formData.get("template")?.toString().trim();
  const answer_rule = formData.get("answer_rule")?.toString().trim();
  const variablesStr = formData.get("variables")?.toString().trim();
  const knowledgePointIds = formData.getAll("knowledge_point_ids") as string[];

  if (!title || !template) {
    return { error: "標題與題目內容為必填" };
  }

  let variables = {};
  if (variablesStr) {
    try {
      variables = JSON.parse(variablesStr);
    } catch (e) {
      return { error: "變數設定格式錯誤 (需為 JSON)" };
    }
  }

  const { error } = await supabase
    .from("question_templates")
    .update({
      title,
      grade: grade ? parseInt(grade, 10) : null,
      unit,
      question_type,
      template,
      variables,
      answer_rule: answer_rule || "",
    })
    .eq("id", id)
    .eq("owner_teacher_id", userResponse.user.id);

  if (error) {
    console.error("Error updating question:", error);
    return { error: "更新失敗: " + error.message };
  }

  if (knowledgePointIds) {
    await supabase.from("question_knowledge_points").delete().eq("question_id", id);
    if (knowledgePointIds.length > 0) {
      const mappings = knowledgePointIds.map((kpId) => ({
        question_id: id,
        knowledge_point_id: kpId,
      }));
      await supabase.from("question_knowledge_points").insert(mappings);
    }
  }

  revalidatePath("/dashboard/questions");
  revalidatePath(`/dashboard/questions/${id}/edit`);
  return { success: true };
}

export async function deleteQuestion(id: string) {
  const supabase = await createClient();
  const { data: userResponse, error: authError } = await supabase.auth.getUser();
  
  if (authError || !userResponse.user) {
    return { error: "尚未登入，請重新登入" };
  }

  const { error } = await supabase
    .from("question_templates")
    .delete()
    .eq("id", id)
    .eq("owner_teacher_id", userResponse.user.id);

  if (error) {
    console.error("Error deleting question:", error);
    return { error: "刪除失敗: " + error.message };
  }

  revalidatePath("/dashboard/questions");
  return { success: true };
}
