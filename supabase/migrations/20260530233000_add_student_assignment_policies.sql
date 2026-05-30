-- Allow anyone (including anon students) to read published assignments
create policy "Anyone can read published assignments"
  on public.assignments for select
  to anon, authenticated
  using (status = 'open');

-- Allow anyone to read questions for published assignments
create policy "Anyone can read assignment questions for published assignments"
  on public.assignment_questions for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.assignments
      where assignments.id = assignment_questions.assignment_id
        and assignments.status = 'open'
    )
  );

-- RPC for getting active assignments for a student
create or replace function public.get_student_active_assignments(target_student_id uuid)
returns table (
  assignment_id uuid,
  title text,
  description text,
  due_date timestamptz,
  status text,
  score numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_class_id uuid;
begin
  select class_id into target_class_id from public.students where id = target_student_id;
  
  return query
  select 
    a.id,
    a.title,
    a.description,
    a.end_at as due_date,
    coalesce(aa.status::text, 'in_progress') as status,
    coalesce(aa.score, 0) as score
  from public.assignments a
  left join public.assignment_attempts aa 
    on aa.assignment_id = a.id and aa.student_id = target_student_id
  where a.class_id = target_class_id
    and a.status = 'open'
    and (a.end_at is null or a.end_at > now());
end;
$$;

grant execute on function public.get_student_active_assignments(uuid) to anon, authenticated;

-- RPC for submitting an answer
create or replace function public.submit_student_question_answer(
  target_student_id uuid,
  target_assignment_id uuid,
  target_question_template_id uuid,
  input_generated_values jsonb,
  input_rendered_question text,
  input_student_answer text,
  input_correct_answer text,
  input_is_correct boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_attempt_id uuid;
begin
  -- Find or create assignment attempt
  select id into current_attempt_id
  from public.assignment_attempts
  where student_id = target_student_id and assignment_id = target_assignment_id
  limit 1;
  
  if current_attempt_id is null then
    insert into public.assignment_attempts (student_id, assignment_id, attempt_number, status)
    values (target_student_id, target_assignment_id, 1, 'in_progress')
    returning id into current_attempt_id;
  end if;

  -- Insert or update student attempt
  insert into public.student_attempts (
    assignment_attempt_id, question_template_id, generated_values, rendered_question, student_answer, correct_answer, is_correct, answered_at
  ) values (
    current_attempt_id, target_question_template_id, input_generated_values, input_rendered_question, input_student_answer, input_correct_answer, input_is_correct, now()
  )
  on conflict (assignment_attempt_id, question_template_id)
  do update set
    generated_values = excluded.generated_values,
    rendered_question = excluded.rendered_question,
    student_answer = excluded.student_answer,
    correct_answer = excluded.correct_answer,
    is_correct = excluded.is_correct,
    answered_at = excluded.answered_at;
end;
$$;

grant execute on function public.submit_student_question_answer(uuid, uuid, uuid, jsonb, text, text, text, boolean) to anon, authenticated;

-- Function for students to get their own answers
create or replace function public.get_student_answers(
  target_student_id uuid,
  target_assignment_id uuid
)
returns table (
  question_template_id uuid,
  generated_values jsonb,
  student_answer text,
  correct_answer text,
  is_correct boolean,
  answered_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_attempt_id uuid;
begin
  select id into current_attempt_id
  from public.assignment_attempts
  where student_id = target_student_id and assignment_id = target_assignment_id
  limit 1;

  if current_attempt_id is not null then
    return query
    select 
      sa.question_template_id, 
      sa.generated_values, 
      sa.student_answer, 
      sa.correct_answer,
      sa.is_correct, 
      sa.answered_at
    from public.student_attempts sa
    where sa.assignment_attempt_id = current_attempt_id;
  end if;
end;
$$;

grant execute on function public.get_student_answers(uuid, uuid) to anon, authenticated;
