create or replace function public.verify_student_password(
  target_student_id uuid,
  input_password text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_class_id uuid;
begin
  select students.class_id
  into target_class_id
  from public.students
  where id = target_student_id
    and password_hash = extensions.crypt(input_password, password_hash);

  return target_class_id;
end;
$$;

grant execute on function public.verify_student_password(uuid, text) to anon, authenticated;
