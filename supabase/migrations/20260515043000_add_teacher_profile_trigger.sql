create or replace function public.handle_new_teacher_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.teachers (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(split_part(new.email, '@', 1), ''),
      '老師'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_teacher on auth.users;

create trigger on_auth_user_created_create_teacher
after insert on auth.users
for each row execute function public.handle_new_teacher_user();
