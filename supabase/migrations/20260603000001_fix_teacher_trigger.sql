-- Fix trigger for creating teacher profile
-- Since portal_slug is NOT NULL, the trigger must provide a value for it.

create or replace function public.handle_new_teacher_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.teachers (id, display_name, portal_slug)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(split_part(new.email, '@', 1), ''),
      '老師'
    ),
    substring(new.id::text from 1 for 8)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
