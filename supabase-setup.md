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
```

設定後需要重新部署，Vercel 才會讀取新的環境變數。

## 六、後續資料庫規劃

後續會建立 Supabase migration，逐步加入：

- teachers
- classes
- students
- question_templates
- assignments
- assignment_questions
- student_attempts
- student_progress

所有涉及不同老師資料隔離的資料表，都需要啟用 Row Level Security。

## 七、安全原則

- GitHub 只保存程式碼與公開設定範本。
- `.env.local`、資料庫密碼、secret key、service role key 都不可提交。
- 老師只能讀寫自己擁有的班級、學生、派題與私人題目。
- 公開題庫只公開題目內容，不公開學生資料或作答紀錄。

