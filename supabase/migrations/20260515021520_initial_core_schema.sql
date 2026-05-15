create extension if not exists pgcrypto;

create type public.question_visibility as enum ('private', 'public', 'unlisted');
create type public.question_type as enum ('short_answer', 'multiple_choice', 'true_false');
create type public.assignment_status as enum ('draft', 'scheduled', 'open', 'closed', 'archived');
create type public.assignment_attempt_status as enum ('in_progress', 'completed', 'abandoned');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.teachers (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  name text not null,
  grade smallint check (grade between 1 and 6),
  semester text,
  class_code text not null unique,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  name text not null,
  seat_number integer check (seat_number > 0),
  login_code text not null,
  password_hash text,
  archived boolean not null default false,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, login_code),
  unique (class_id, seat_number)
);

create table public.question_templates (
  id uuid primary key default gen_random_uuid(),
  owner_teacher_id uuid not null references public.teachers(id) on delete cascade,
  source_question_id uuid references public.question_templates(id) on delete set null,
  title text not null,
  subject text not null default 'math',
  grade smallint check (grade between 1 and 6),
  unit text,
  question_type public.question_type not null default 'short_answer',
  template text not null,
  variables jsonb not null default '{}'::jsonb,
  answer_rule text not null,
  explanation text,
  choices jsonb not null default '[]'::jsonb,
  visibility public.question_visibility not null default 'private',
  copied_count integer not null default 0 check (copied_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  description text,
  start_at timestamptz,
  end_at timestamptz,
  status public.assignment_status not null default 'draft',
  pass_rule jsonb not null default '{"type": "completion"}'::jsonb,
  allow_retry boolean not null default true,
  show_answers text not null default 'after_completion',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at is null or start_at is null or end_at > start_at)
);

create table public.assignment_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  attempt_number integer not null check (attempt_number > 0),
  status public.assignment_attempt_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  score numeric(6, 2) not null default 0,
  max_score numeric(6, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, assignment_id, attempt_number),
  check (completed_at is null or completed_at >= started_at)
);

create table public.assignment_questions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  question_template_id uuid not null references public.question_templates(id) on delete restrict,
  order_index integer not null check (order_index >= 0),
  points integer not null default 1 check (points > 0),
  created_at timestamptz not null default now(),
  unique (assignment_id, order_index),
  unique (assignment_id, question_template_id)
);

create table public.student_attempts (
  id uuid primary key default gen_random_uuid(),
  assignment_attempt_id uuid not null references public.assignment_attempts(id) on delete cascade,
  question_template_id uuid not null references public.question_templates(id) on delete restrict,
  generated_values jsonb not null default '{}'::jsonb,
  rendered_question text not null,
  student_answer text,
  correct_answer text,
  is_correct boolean,
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  unique (assignment_attempt_id, question_template_id)
);

create table public.student_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  completed_at timestamptz,
  score numeric(6, 2) not null default 0,
  max_score numeric(6, 2) not null default 0,
  star_count smallint not null default 0 check (star_count between 0 and 3),
  updated_at timestamptz not null default now(),
  unique (student_id, assignment_id)
);

create index classes_teacher_id_idx on public.classes(teacher_id);
create index students_class_id_idx on public.students(class_id);
create index question_templates_owner_teacher_id_idx on public.question_templates(owner_teacher_id);
create index question_templates_public_search_idx on public.question_templates(visibility, grade, unit);
create index assignments_teacher_id_idx on public.assignments(teacher_id);
create index assignments_class_id_idx on public.assignments(class_id);
create index assignment_attempts_student_assignment_idx on public.assignment_attempts(student_id, assignment_id);
create index assignment_attempts_assignment_id_idx on public.assignment_attempts(assignment_id);
create index assignment_questions_assignment_id_idx on public.assignment_questions(assignment_id);
create index student_attempts_assignment_attempt_id_idx on public.student_attempts(assignment_attempt_id);
create index student_progress_student_id_idx on public.student_progress(student_id);

create trigger set_teachers_updated_at
before update on public.teachers
for each row execute function public.set_updated_at();

create trigger set_classes_updated_at
before update on public.classes
for each row execute function public.set_updated_at();

create trigger set_students_updated_at
before update on public.students
for each row execute function public.set_updated_at();

create trigger set_question_templates_updated_at
before update on public.question_templates
for each row execute function public.set_updated_at();

create trigger set_assignments_updated_at
before update on public.assignments
for each row execute function public.set_updated_at();

create trigger set_assignment_attempts_updated_at
before update on public.assignment_attempts
for each row execute function public.set_updated_at();

create trigger set_student_progress_updated_at
before update on public.student_progress
for each row execute function public.set_updated_at();

alter table public.teachers enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.question_templates enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_attempts enable row level security;
alter table public.assignment_questions enable row level security;
alter table public.student_attempts enable row level security;
alter table public.student_progress enable row level security;

create policy "Teachers can read own profile"
on public.teachers for select
to authenticated
using (id = auth.uid());

create policy "Teachers can insert own profile"
on public.teachers for insert
to authenticated
with check (id = auth.uid());

create policy "Teachers can update own profile"
on public.teachers for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Teachers can manage own classes"
on public.classes for all
to authenticated
using (teacher_id = auth.uid())
with check (teacher_id = auth.uid());

create policy "Teachers can manage students in own classes"
on public.students for all
to authenticated
using (
  exists (
    select 1 from public.classes
    where classes.id = students.class_id
      and classes.teacher_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.classes
    where classes.id = students.class_id
      and classes.teacher_id = auth.uid()
  )
);

create policy "Teachers can read own and public question templates"
on public.question_templates for select
to authenticated
using (
  owner_teacher_id = auth.uid()
  or visibility = 'public'
);

create policy "Teachers can insert own question templates"
on public.question_templates for insert
to authenticated
with check (owner_teacher_id = auth.uid());

create policy "Teachers can update own question templates"
on public.question_templates for update
to authenticated
using (owner_teacher_id = auth.uid())
with check (owner_teacher_id = auth.uid());

create policy "Teachers can delete own question templates"
on public.question_templates for delete
to authenticated
using (owner_teacher_id = auth.uid());

create policy "Teachers can manage assignments for own classes"
on public.assignments for all
to authenticated
using (
  teacher_id = auth.uid()
  and exists (
    select 1 from public.classes
    where classes.id = assignments.class_id
      and classes.teacher_id = auth.uid()
  )
)
with check (
  teacher_id = auth.uid()
  and exists (
    select 1 from public.classes
    where classes.id = assignments.class_id
      and classes.teacher_id = auth.uid()
  )
);

create policy "Teachers can manage assignment questions for own assignments"
on public.assignment_questions for all
to authenticated
using (
  exists (
    select 1 from public.assignments
    where assignments.id = assignment_questions.assignment_id
      and assignments.teacher_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.assignments
    where assignments.id = assignment_questions.assignment_id
      and assignments.teacher_id = auth.uid()
  )
);

create policy "Teachers can read assignment attempts for own assignments"
on public.assignment_attempts for select
to authenticated
using (
  exists (
    select 1 from public.assignments
    where assignments.id = assignment_attempts.assignment_id
      and assignments.teacher_id = auth.uid()
  )
);

create policy "Teachers can read attempts for own assignments"
on public.student_attempts for select
to authenticated
using (
  exists (
    select 1
    from public.assignment_attempts
    join public.assignments
      on assignments.id = assignment_attempts.assignment_id
    where assignment_attempts.id = student_attempts.assignment_attempt_id
      and assignments.teacher_id = auth.uid()
  )
);

create policy "Teachers can manage progress for own assignments"
on public.student_progress for all
to authenticated
using (
  exists (
    select 1 from public.assignments
    where assignments.id = student_progress.assignment_id
      and assignments.teacher_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.assignments
    where assignments.id = student_progress.assignment_id
      and assignments.teacher_id = auth.uid()
  )
);
