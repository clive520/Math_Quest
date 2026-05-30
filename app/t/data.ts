import { createClient } from "@/lib/supabase/server";

export async function getPublicTeachers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teachers")
    .select("id, display_name, portal_slug")
    .order("display_name");

  if (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }
  return data;
}

export async function getTeacherBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teachers")
    .select("id, display_name, portal_slug")
    .eq("portal_slug", slug)
    .single();

  if (error) {
    return null;
  }
  return data;
}

export async function getPublicClasses(teacherId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select("id, name, grade, semester")
    .eq("teacher_id", teacherId)
    .eq("archived", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching classes:", error);
    return [];
  }
  return data;
}

export async function getPublicStudents(classId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select("id, name, seat_number")
    .eq("class_id", classId)
    .eq("archived", false)
    .order("seat_number", { ascending: true });

  if (error) {
    console.error("Error fetching students:", error);
    return [];
  }
  return data;
}
