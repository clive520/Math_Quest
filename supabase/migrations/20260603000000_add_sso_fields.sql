-- Add SSO fields to students table
alter table public.students
add column sso_uid text unique,
add column username text unique;

-- Add SSO field to teachers table
alter table public.teachers
add column sso_uid text unique;

-- We can drop the password_hash and login_code constraints since we use SSO now,
-- but to avoid breaking existing data immediately, we just make them nullable.
alter table public.students
alter column login_code drop not null;
