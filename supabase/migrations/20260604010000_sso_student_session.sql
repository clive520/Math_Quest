create or replace function public.create_sso_student_session(
  target_student_id uuid
)
returns table (
  session_token text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_session_token text;
begin
  raw_session_token := encode(gen_random_bytes(32), 'hex');

  insert into public.student_sessions (
    student_id,
    session_token_hash,
    expires_at
  )
  values (
    target_student_id,
    encode(digest(raw_session_token, 'sha256'), 'hex'),
    now() + interval '30 days'
  );

  update public.students
  set last_login_at = now()
  where id = target_student_id;

  return query select raw_session_token;
end;
$$;

grant execute on function public.create_sso_student_session(uuid) to anon, authenticated;
