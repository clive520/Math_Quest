alter table public.teachers
add column if not exists is_admin boolean not null default false,
add column if not exists must_change_password boolean not null default false;

update public.teachers
set is_admin = true
where id in (
  select id
  from auth.users
  where email = 'clive520@lyps.tc.edu.tw'
);

create or replace function public.current_teacher_is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.teachers
    where id = auth.uid()
      and is_admin = true
  );
$$;

drop policy if exists "Admins can read all teacher profiles" on public.teachers;

create policy "Admins can read all teacher profiles"
on public.teachers for select
to authenticated
using (public.current_teacher_is_admin());

create or replace function public.list_teacher_accounts()
returns table (
  id uuid,
  display_name text,
  email text,
  is_admin boolean,
  must_change_password boolean,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_teacher_is_admin() then
    raise exception 'Only admins can list teacher accounts'
      using errcode = '42501';
  end if;

  return query
  select
    teachers.id,
    teachers.display_name,
    auth_users.email::text,
    teachers.is_admin,
    teachers.must_change_password,
    teachers.created_at,
    teachers.updated_at
  from public.teachers
  join auth.users as auth_users
    on auth_users.id = teachers.id
  order by teachers.created_at desc;
end;
$$;

create or replace function public.reset_teacher_temporary_password(
  target_teacher_id uuid,
  temporary_password text
)
returns table (
  id uuid,
  display_name text,
  email text,
  must_change_password boolean
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_teacher_is_admin() then
    raise exception 'Only admins can reset teacher passwords'
      using errcode = '42501';
  end if;

  if temporary_password is null or length(temporary_password) < 8 then
    raise exception 'Temporary password must be at least 8 characters'
      using errcode = '22023';
  end if;

  if not exists (select 1 from public.teachers where teachers.id = target_teacher_id) then
    raise exception 'Teacher account not found'
      using errcode = '02000';
  end if;

  update auth.users
  set encrypted_password = crypt(temporary_password, gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      confirmation_sent_at = null,
      recovery_sent_at = null,
      updated_at = now()
  where auth.users.id = target_teacher_id;

  update public.teachers
  set must_change_password = true
  where teachers.id = target_teacher_id;

  return query
  select
    teachers.id,
    teachers.display_name,
    auth_users.email::text,
    teachers.must_change_password
  from public.teachers
  join auth.users as auth_users
    on auth_users.id = teachers.id
  where teachers.id = target_teacher_id;
end;
$$;

grant execute on function public.current_teacher_is_admin() to authenticated;
grant execute on function public.list_teacher_accounts() to authenticated;
grant execute on function public.reset_teacher_temporary_password(uuid, text) to authenticated;
