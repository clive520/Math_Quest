create table if not exists public.student_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  session_token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists student_sessions_student_id_idx
on public.student_sessions(student_id);

create index if not exists student_sessions_expires_at_idx
on public.student_sessions(expires_at);

alter table public.student_sessions enable row level security;

create or replace function public.get_class_by_code(input_class_code text)
returns table (
  id uuid,
  name text,
  grade smallint,
  semester text,
  class_code text
)
language sql
security definer
set search_path = public
as $$
  select classes.id, classes.name, classes.grade, classes.semester, classes.class_code
  from public.classes
  where classes.class_code = upper(trim(input_class_code))
    and classes.archived = false
  limit 1;
$$;

create or replace function public.join_class_by_code(
  input_class_code text,
  input_seat_number integer,
  input_name text,
  input_password text
)
returns table (
  student_id uuid,
  class_id uuid,
  class_name text,
  class_code text,
  session_token text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_class public.classes%rowtype;
  new_student_id uuid;
  raw_session_token text;
begin
  if input_seat_number is null or input_seat_number <= 0 then
    raise exception 'Seat number must be greater than 0'
      using errcode = '22023';
  end if;

  if input_name is null or length(trim(input_name)) = 0 then
    raise exception 'Student name is required'
      using errcode = '22023';
  end if;

  if input_password is null or length(input_password) < 4 then
    raise exception 'Password must be at least 4 characters'
      using errcode = '22023';
  end if;

  select *
  into target_class
  from public.classes
  where classes.class_code = upper(trim(input_class_code))
    and classes.archived = false
  limit 1;

  if target_class.id is null then
    raise exception 'Class not found'
      using errcode = '02000';
  end if;

  insert into public.students (
    class_id,
    name,
    seat_number,
    login_code,
    password_hash
  )
  values (
    target_class.id,
    trim(input_name),
    input_seat_number,
    input_seat_number::text,
    crypt(input_password, gen_salt('bf'))
  )
  returning id into new_student_id;

  raw_session_token := encode(gen_random_bytes(32), 'hex');

  insert into public.student_sessions (
    student_id,
    session_token_hash,
    expires_at
  )
  values (
    new_student_id,
    encode(digest(raw_session_token, 'sha256'), 'hex'),
    now() + interval '30 days'
  );

  return query
  select
    new_student_id,
    target_class.id,
    target_class.name,
    target_class.class_code,
    raw_session_token;
exception
  when unique_violation then
    raise exception 'Seat number already joined this class'
      using errcode = '23505';
end;
$$;

create or replace function public.login_student_by_class_code(
  input_class_code text,
  input_seat_number integer,
  input_password text
)
returns table (
  student_id uuid,
  student_name text,
  class_id uuid,
  class_name text,
  class_code text,
  session_token text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  found_student public.students%rowtype;
  found_class public.classes%rowtype;
  raw_session_token text;
begin
  select students.*
  into found_student
  from public.students
  join public.classes
    on classes.id = students.class_id
  where classes.class_code = upper(trim(input_class_code))
    and classes.archived = false
    and students.archived = false
    and students.seat_number = input_seat_number
    and students.password_hash = crypt(input_password, students.password_hash)
  limit 1;

  if found_student.id is null then
    raise exception 'Invalid student login'
      using errcode = '28000';
  end if;

  select *
  into found_class
  from public.classes
  where classes.id = found_student.class_id;

  update public.students
  set last_login_at = now()
  where students.id = found_student.id;

  raw_session_token := encode(gen_random_bytes(32), 'hex');

  insert into public.student_sessions (
    student_id,
    session_token_hash,
    expires_at
  )
  values (
    found_student.id,
    encode(digest(raw_session_token, 'sha256'), 'hex'),
    now() + interval '30 days'
  );

  return query
  select
    found_student.id,
    found_student.name,
    found_class.id,
    found_class.name,
    found_class.class_code,
    raw_session_token;
end;
$$;

create or replace function public.get_student_session(session_token text)
returns table (
  student_id uuid,
  student_name text,
  seat_number integer,
  class_id uuid,
  class_name text,
  class_code text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.student_sessions
  where expires_at <= now();

  return query
  select
    students.id,
    students.name,
    students.seat_number,
    classes.id,
    classes.name,
    classes.class_code
  from public.student_sessions
  join public.students
    on students.id = student_sessions.student_id
  join public.classes
    on classes.id = students.class_id
  where student_sessions.session_token_hash = encode(digest(session_token, 'sha256'), 'hex')
    and student_sessions.expires_at > now()
    and students.archived = false
    and classes.archived = false
  limit 1;
end;
$$;

grant execute on function public.get_class_by_code(text) to anon, authenticated;
grant execute on function public.join_class_by_code(text, integer, text, text) to anon, authenticated;
grant execute on function public.login_student_by_class_code(text, integer, text) to anon, authenticated;
grant execute on function public.get_student_session(text) to anon, authenticated;
