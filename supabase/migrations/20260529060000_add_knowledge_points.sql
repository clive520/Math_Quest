create table public.knowledge_points (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  grade smallint check (grade between 1 and 6),
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.question_knowledge_points (
  question_id uuid not null references public.question_templates(id) on delete cascade,
  knowledge_point_id uuid not null references public.knowledge_points(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (question_id, knowledge_point_id)
);

create trigger set_knowledge_points_updated_at
before update on public.knowledge_points
for each row execute function public.set_updated_at();

alter table public.knowledge_points enable row level security;
alter table public.question_knowledge_points enable row level security;

-- 任何人登入後都可以讀取知識點清單
create policy "Anyone can read knowledge points"
on public.knowledge_points for select
to authenticated
using (true);

-- question_knowledge_points 讀取權限：如果是老師，可以讀取。
create policy "Anyone can read question knowledge points"
on public.question_knowledge_points for select
to authenticated
using (true);

-- question_knowledge_points 寫入權限：只有題目擁有者可以寫入/刪除
create policy "Question owners can insert knowledge points mapping"
on public.question_knowledge_points for insert
to authenticated
with check (
  exists (
    select 1 from public.question_templates
    where id = question_id and owner_teacher_id = auth.uid()
  )
);

create policy "Question owners can delete knowledge points mapping"
on public.question_knowledge_points for delete
to authenticated
using (
  exists (
    select 1 from public.question_templates
    where id = question_id and owner_teacher_id = auth.uid()
  )
);

-- 預設插入一些國小數學基礎指標作為測試
insert into public.knowledge_points (code, name, grade, description) values
('N-1-1', '100以內的數', 1, '含唱數、點數、做數'),
('N-1-2', '加法與減法', 1, '基本加減法計算'),
('N-1-3', '長度的認識', 1, '生活中的長度單位與比較'),
('S-1-1', '平面與立體形狀', 1, '認識基本的形狀'),
('N-2-1', '1000以內的數', 2, '位值與數的計算'),
('N-2-2', '二位數加減直式', 2, '直式計算與進退位'),
('N-2-3', '基本乘法', 2, '九九乘法表'),
('N-3-1', '10000以內的數', 3, '大數的認識'),
('N-3-2', '除法的基本概念', 3, '包含除與平分除'),
('N-3-3', '分數的初步認識', 3, '幾分之幾'),
('N-4-1', '一億以內的數', 4, '極大數的計算與位值'),
('N-4-2', '小數的認識', 4, '一位與二位小數'),
('S-4-1', '角度的認識', 4, '使用量角器測量'),
('N-5-1', '因數與倍數', 5, '公因數與公倍數'),
('N-5-2', '異分母分數加減', 5, '擴分與約分'),
('N-6-1', '小數與分數的四則運算', 6, '混合運算'),
('N-6-2', '比例與比值', 6, '正比例'),
('S-6-1', '圓面積與圓周長', 6, '圓周率的應用');
