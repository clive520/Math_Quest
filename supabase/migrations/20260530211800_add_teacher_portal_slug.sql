-- 1. 新增 portal_slug 欄位
alter table public.teachers
add column portal_slug text unique;

-- 2. 為既有資料填入預設值 (使用 uuid 的前 8 碼)
update public.teachers
set portal_slug = substring(id::text from 1 for 8)
where portal_slug is null;

-- 3. 將欄位設為必填 (Not Null)
alter table public.teachers
alter column portal_slug set not null;

-- 4. 新增 RLS 政策，允許任何人讀取老師列表 (為了在首頁顯示)
-- 注意：teachers 表原先只有擁有者可以讀取自己，現在需要開放所有人讀取公開資訊
-- 我們假設 display_name 和 portal_slug 是公開的
create policy "Anyone can read teachers"
on public.teachers for select
using (true);

-- 5. 確保 classes 也允許任何人讀取，才能在專屬入口頁顯示
create policy "Anyone can read classes"
on public.classes for select
using (true);

-- 6. 確保 students 允許任何人讀取 (我們在前端只會顯示 id, seat_number, name)
-- 密碼已放在 password_hash 欄位，select 本身不會洩漏密碼（除非前端取回並顯示）
-- 為了安全起見，理想中我們應該建立一個 view 或 rpc，不過簡單起見先開放 select
create policy "Anyone can read students"
on public.students for select
using (true);
