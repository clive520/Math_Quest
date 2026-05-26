# Math Quest Supabase 設定流程

本文件記錄 Math Quest 與 Supabase 的設定方式。Supabase 會負責老師登入、學生資料、班級資料、題庫資料、派題資料與作答紀錄。

## 一、目前採用方式

本專案使用 Supabase 官方建議的 Next.js SSR 整合方式：

- `@supabase/supabase-js`
- `@supabase/ssr`
- Cookie-based Auth
- Next.js `proxy.ts` 自動刷新 Auth session

環境變數採用：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
```

目前 Supabase project：

```text
Project name: Math Quest
Project ref: loewbggrxtyvdcgtkmzo
Region: ap-northeast-1
Project URL: https://loewbggrxtyvdcgtkmzo.supabase.co
Status: ACTIVE_HEALTHY
```

## 二、已完成的程式設定

已新增：

- `.env.example`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/proxy.ts`
- `proxy.ts`

用途：

- `client.ts`：給瀏覽器端 Client Component 使用。
- `server.ts`：給 Server Component、Server Action、Route Handler 使用。
- `proxy.ts`：讓 Supabase Auth session 可以透過 cookie 更新。

## 三、建立 Supabase 專案

之後需要在 Supabase Dashboard 建立一個專案。

建議設定：

- Project name：`Math Quest`
- Database password：由使用者自行保存，不要提交到 GitHub。
- Region：選擇距離主要使用者較近的區域。

建立完成後，到 Supabase 專案的 Connect 或 API Keys 頁面取得：

- Project URL
- Publishable key

## 四、本機環境變數

複製 `.env.example` 成 `.env.local`，並填入 Supabase 資訊：

```text
NEXT_PUBLIC_SUPABASE_URL=你的 Supabase Project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=你的 Supabase Publishable Key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

注意：

- `.env.local` 不可提交到 GitHub。
- 不要把 Supabase secret key 或 service role key 放到前端程式碼。
- 目前第一階段只需要 publishable key。

## 五、Vercel 環境變數

正式部署時，需要在 Vercel Project 設定相同環境變數：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
```

設定後需要重新部署，Vercel 才會讀取新的環境變數。

目前已設定：

- Production：已設定。
- Development：已設定。
- Preview：尚未設定，等需要 Pull Request 或分支預覽時再補。

正式網站的 `NEXT_PUBLIC_SITE_URL` 應設定為：

```text
https://math-quest-clive520s-projects.vercel.app
```

## 六、後續資料庫規劃

已建立第一批 Supabase migration：

```text
supabase/migrations/20260515021520_initial_core_schema.sql
supabase/migrations/20260515043000_add_teacher_profile_trigger.sql
supabase/migrations/20260526090000_add_teacher_admin_password_reset.sql
```

第一批資料表：

- teachers
- classes
- students
- question_templates
- assignments
- assignment_attempts
- assignment_questions
- student_attempts
- student_progress

已加入：

- `updated_at` trigger。
- 常用查詢 index。
- `assignment_attempts` 作為學生一次闖關挑戰的主紀錄，`student_attempts` 作為單題作答明細。
- `student_attempts` 已加入 `(assignment_attempt_id, question_template_id)` 唯一限制，避免同一次闖關重複產生同一題。
- 老師註冊後，`auth.users` trigger 會自動建立 `teachers` profile。
- Row Level Security。
- 老師只能管理自己的班級、學生、派題與私人題目。
- 老師可以讀取公開題目。
- 學生端第一版預計透過 Next.js Server Action / API 驗證學生 session 後寫入作答資料，不直接使用 Supabase Auth。

管理員與臨時密碼機制：

- `teachers.is_admin`：標記系統管理員。
- `teachers.must_change_password`：標記老師是否必須先修改臨時密碼。
- `public.list_teacher_accounts()`：系統管理員列出老師帳號。
- `public.reset_teacher_temporary_password(target_teacher_id, temporary_password)`：系統管理員重設老師臨時密碼，並將該老師標記為必須修改密碼。
- 目前已將 `clive520@lyps.tc.edu.tw` 設為系統管理員。

## 七、安全原則

- GitHub 只保存程式碼與公開設定範本。
- `.env.local`、資料庫密碼、secret key、service role key 都不可提交。
- 老師只能讀寫自己擁有的班級、學生、派題與私人題目。
- 公開題庫只公開題目內容，不公開學生資料或作答紀錄。

## 八、Auth 連結與密碼重設

老師註冊 Email 驗證與忘記密碼功能會透過 Supabase Auth Email 發送連結，並導回網站：

```text
/auth/callback
```

目前程式使用：

- 註冊驗證：`/auth/callback?next=/dashboard`
- 忘記密碼：`/auth/callback?next=/reset-password`

Supabase Dashboard 的 Auth URL 設定應允許正式網站網址作為 Site URL，並允許以下 redirect URL：

```text
https://math-quest-clive520s-projects.vercel.app/auth/callback
https://math-quest-clive520s-projects.vercel.app/auth/callback**
```

若本機開發需要測試，也可加入：

```text
http://localhost:3000/auth/callback
```

若 redirect URL 未列入允許清單，使用者點擊驗證信或重設密碼信後可能無法正確回到 Math Quest。

若信件中的 `redirect_to` 仍出現 `http://localhost:3000`，優先檢查：

1. Supabase Auth 的 Site URL 是否仍設定為 `http://localhost:3000`。
2. Supabase Auth 的 Redirect URLs 是否包含正式網站 `/auth/callback` 與 `/auth/callback**`。
3. Vercel 是否已設定 `NEXT_PUBLIC_SITE_URL=https://math-quest-clive520s-projects.vercel.app` 並重新部署。

## 2026-05-26 學生加入班級與登入

老師更新學生資料與密碼：
```text
supabase/migrations/20260526153000_add_teacher_student_update_rpc.sql
```

新增 RPC：
```text
update_student_for_teacher(target_student_id, input_seat_number, input_name, input_password)
```

用途：
- 老師可更新自己班級中的學生座號與姓名。
- `input_password` 為選填；留空時不修改密碼。
- 若輸入新密碼，資料庫會使用 `extensions.crypt(..., extensions.gen_salt('bf'))` 重新雜湊保存。
- 函式會檢查學生是否屬於目前登入老師的班級，避免跨班或跨老師修改。

修正 migration：
```text
supabase/migrations/20260526143000_fix_student_pgcrypto_schema.sql
```

Supabase 的 `pgcrypto` 函式位於 `extensions` schema。學生加入與登入 RPC 需要明確使用：
```text
extensions.crypt
extensions.gen_salt
extensions.gen_random_bytes
extensions.digest
```

如果未明確指定 schema，`security definer` 函式在 `search_path = public` 時會找不到 `gen_salt()`，造成學生加入班級失敗。

新增 migration：
```text
supabase/migrations/20260526100000_add_student_join_sessions.sql
```

這次新增的資料庫能力：
- `student_sessions`：保存學生登入 session。實際 token 只存在瀏覽器 cookie，資料庫只保存 SHA-256 雜湊值。
- `get_class_by_code(input_class_code)`：依班級代碼查詢可加入的班級。
- `join_class_by_code(input_class_code, input_seat_number, input_name, input_password)`：學生用班級代碼、座號、姓名與自訂密碼加入班級。
- `login_student_by_class_code(input_class_code, input_seat_number, input_password)`：學生用班級代碼、座號與密碼登入。
- `get_student_session(session_token)`：由學生 cookie session 取回學生與班級資料。

注意事項：
- 學生密碼使用 PostgreSQL `crypt(..., gen_salt('bf'))` 保存，不保存明文密碼。
- 同一班級內座號不可重複；老師可在班級詳情頁編輯座號與姓名，或將學生封存刪除。
- 這套學生登入不使用 Supabase Auth 寄信，因此不受 Supabase 預設每小時 2 封信的限制。
