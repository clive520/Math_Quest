-- 1. Drop the global unique constraints on sso_uid and username
alter table public.students drop constraint if exists students_sso_uid_key;
alter table public.students drop constraint if exists students_username_key;

-- 2. Add class-level unique constraint for sso_uid so one student can't join the same class twice
alter table public.students add constraint students_class_id_sso_uid_key unique (class_id, sso_uid);

-- 3. Make students.name nullable to support empty unbound seats
alter table public.students alter column name drop not null;
