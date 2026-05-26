create or replace function public.update_student_for_teacher(
  target_student_id uuid,
  input_seat_number integer,
  input_name text,
  input_password text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_student public.students%rowtype;
begin
  if input_seat_number is null or input_seat_number <= 0 then
    raise exception 'Seat number must be greater than 0'
      using errcode = '22023';
  end if;

  if input_name is null or length(trim(input_name)) = 0 then
    raise exception 'Student name is required'
      using errcode = '22023';
  end if;

  select students.*
  into target_student
  from public.students
  join public.classes
    on classes.id = students.class_id
  where students.id = target_student_id
    and classes.teacher_id = auth.uid()
    and classes.archived = false
  limit 1;

  if target_student.id is null then
    raise exception 'Student not found'
      using errcode = '02000';
  end if;

  if input_password is not null and length(input_password) > 0 and length(input_password) < 4 then
    raise exception 'Password must be at least 4 characters'
      using errcode = '22023';
  end if;

  update public.students
  set
    login_code = input_seat_number::text,
    name = trim(input_name),
    password_hash = case
      when input_password is not null and length(input_password) > 0
        then extensions.crypt(input_password, extensions.gen_salt('bf'))
      else password_hash
    end,
    seat_number = input_seat_number
  where students.id = target_student_id;
exception
  when unique_violation then
    raise exception 'Seat number already exists in this class'
      using errcode = '23505';
end;
$$;

grant execute on function public.update_student_for_teacher(uuid, integer, text, text) to authenticated;
