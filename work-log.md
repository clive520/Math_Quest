# Math Quest 工作日誌

本檔案用來記錄 Math Quest 數學闖關網站的規劃、設計、開發與修改歷程。之後每次進行重要變更時，都應該在這裡新增一筆紀錄，方便後續追蹤網站改過哪些內容、為什麼修改，以及影響到哪些檔案。

## 記錄格式

每筆紀錄建議包含：

- 日期
- 變更類型
- 變更摘要
- 變更原因
- 影響檔案
- 後續待辦

## 2026-05-15

### 建立老師登入與班級管理第一版

變更類型：功能開發與資料庫結構

變更摘要：

- 新增 migration：`supabase/migrations/20260515043000_add_teacher_profile_trigger.sql`。
- 新增 `auth.users` trigger，自動在老師註冊後建立 `teachers` profile。
- 將第一批 migration 套用到 Supabase 遠端資料庫。
- 新增老師登入 / 註冊頁：`app/login/page.tsx` 與 `app/login/actions.ts`。
- 新增老師 dashboard auth guard：`app/dashboard/layout.tsx`。
- 新增老師首頁：`app/dashboard/page.tsx`。
- 新增班級管理頁與 Server Actions：`app/dashboard/classes/page.tsx`、`app/dashboard/classes/actions.ts`。
- 班級代碼由 server action 產生 6 碼大寫英數，避開容易混淆字元。
- 首頁新增進入老師工作台的連結。
- 擴充 `app/globals.css`，支援登入頁、老師後台、班級列表與表單樣式。

變更原因：

- 依照目前 MVP 順序，先完成老師登入與班級管理，讓後續學生管理、題目管理與派題功能有可用的老師端基礎。
- 老師 profile 改由資料庫 trigger 建立，避免註冊流程中因網路或前端中斷造成 Auth 使用者與 `teachers` 資料不同步。

影響檔案：

- `app/page.tsx`
- `app/globals.css`
- `app/login/actions.ts`
- `app/login/page.tsx`
- `app/dashboard/layout.tsx`
- `app/dashboard/page.tsx`
- `app/dashboard/classes/actions.ts`
- `app/dashboard/classes/page.tsx`
- `supabase/migrations/20260515043000_add_teacher_profile_trigger.sql`
- `work-log.md`

後續待辦：

- 實作學生管理 CRUD。
- 實作題目模板建立介面。
- 實作任務指派流程。

### 建立第一批 Supabase Migration

變更類型：資料庫結構

變更摘要：

- 建立 migration：`supabase/migrations/20260515021520_initial_core_schema.sql`。
- 新增 enum：`question_visibility`、`question_type`、`assignment_status`、`assignment_attempt_status`。
- 新增資料表：`teachers`、`classes`、`students`、`question_templates`、`assignments`、`assignment_attempts`、`assignment_questions`、`student_attempts`、`student_progress`。
- `assignment_attempts` 用來記錄學生一次完整闖關，`student_attempts` 用來記錄該次闖關中的單題明細。
- `student_attempts` 加入 `(assignment_attempt_id, question_template_id)` 唯一限制，避免同一次闖關重複產生同一題。
- 新增 `updated_at` trigger function 與各主要資料表 trigger。
- 新增常用查詢 index。
- 啟用 Row Level Security。
- 加入第一版老師端 RLS policy：老師只能管理自己的班級、學生、派題與私人題目。
- 加入公開題庫讀取 policy：已登入老師可讀取公開題目。
- 更新 `supabase-setup.md`，記錄第一批資料庫結構。

變更原因：

- Math Quest 需要先建立穩定的資料庫基礎，才能開始開發老師註冊、班級管理、學生管理、題庫、派題與作答紀錄功能。
- 所有資料庫結構需透過 migration 檔案版本控制，方便未來追蹤與部署。

影響檔案：

- `supabase/migrations/20260515021520_initial_core_schema.sql`
- `supabase-setup.md`
- `work-log.md`

後續待辦：

- 將 migration 套用到 Supabase 雲端資料庫。
- 確認遠端資料表建立成功。
- 後續實作學生登入 session 與 server-side 作答 API。

### 建立 Supabase 雲端專案並設定 Vercel 環境變數

變更類型：Supabase 雲端設定與部署設定

變更摘要：

- 完成 Supabase CLI 登入。
- 建立 Supabase project：`Math Quest`。
- Supabase project ref：`loewbggrxtyvdcgtkmzo`。
- Supabase region：`ap-northeast-1`。
- Supabase project URL：`https://loewbggrxtyvdcgtkmzo.supabase.co`。
- 確認 Supabase project 狀態為 `ACTIVE_HEALTHY`。
- 將 `NEXT_PUBLIC_SUPABASE_URL` 設定到 Vercel Production 與 Development。
- 將 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 設定到 Vercel Production 與 Development。
- 將 `supabase/.temp` 加入 `.gitignore`，避免提交 Supabase CLI 本機暫存資料。
- 更新 `supabase-setup.md` 與 `deployment-process.md`，記錄 Supabase project 資訊。

變更原因：

- Math Quest 後續需要 Supabase 作為登入、資料庫、班級、學生、題庫與作答紀錄的基礎。
- Vercel 正式部署需要 Supabase 環境變數，才能啟用 Supabase SSR/Auth 基礎設施。

影響檔案：

- `.gitignore`
- `supabase-setup.md`
- `deployment-process.md`
- `work-log.md`

後續待辦：

- 推送文件更新並觸發 Vercel 重新部署。
- 確認正式網站在 Supabase 環境變數設定後仍可正常開啟。
- 之後建立第一批資料庫 migration。

### 建立 Supabase 基礎串接

變更類型：Supabase 整合準備

變更摘要：

- 安裝 Supabase 相關套件到 lock file：`@supabase/supabase-js`、`@supabase/ssr`。
- 新增 `.env.example`，記錄需要的 Supabase 環境變數。
- 新增 `lib/supabase/client.ts`，供瀏覽器端 Client Component 使用。
- 新增 `lib/supabase/server.ts`，供 Server Component、Server Action、Route Handler 使用。
- 新增 `lib/supabase/proxy.ts` 與根目錄 `proxy.ts`，用於更新 Supabase Auth cookie session。
- 更新 `tsconfig.json`，加入 `@/*` path alias。
- 新增 `supabase-setup.md`，記錄 Supabase 專案建立、環境變數與安全原則。
- 更新 `deployment-process.md`，改用目前 Supabase 建議的 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`。

變更原因：

- 下一階段需要開始串接 Supabase，作為老師登入、班級資料、學生資料、題庫與作答紀錄的基礎。
- 先建立安全的環境變數範本與 Supabase client 工具，避免日後把密鑰提交到 GitHub。

影響檔案：

- `.env.example`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/proxy.ts`
- `proxy.ts`
- `supabase-setup.md`
- `deployment-process.md`
- `work-log.md`

後續待辦：

- 建立 Supabase 雲端專案。
- 取得 Supabase Project URL 與 Publishable Key。
- 將環境變數加入本機 `.env.local` 與 Vercel Project。
- 建立第一批資料庫 migration。

### 修正未設定 Supabase 環境變數時的部署錯誤

變更類型：錯誤修正

變更摘要：

- 發現加入 Supabase proxy 後，Vercel 正式部署雖然 build 成功，但因尚未設定 Supabase 環境變數，正式網址回傳 500。
- 更新 `lib/supabase/proxy.ts`，當 `NEXT_PUBLIC_SUPABASE_URL` 或 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 尚未設定時，先略過 Supabase session refresh。

變更原因：

- 目前還沒建立 Supabase 雲端專案，Vercel 尚無 Supabase 環境變數。
- 網站應該在 Supabase 尚未完成設定前仍可正常顯示首頁，避免部署管線中斷。

影響檔案：

- `lib/supabase/proxy.ts`
- `work-log.md`

後續待辦：

- 建立 Supabase 雲端專案後，將環境變數加入 Vercel，再啟用完整 Auth session refresh。

### 建立 Vercel Project 並連接 GitHub

變更類型：部署設定

變更摘要：

- 使用 Vercel CLI 登入帳號 `clive520`。
- 建立並連接 Vercel project：`clive520s-projects/math-quest`。
- 將 Vercel project 連接到 GitHub repository：`https://github.com/clive520/Math_Quest`。
- 更新 `deployment-process.md`，補上目前 Vercel project 資訊。
- Vercel CLI 自動將 `.vercel` 加入 `.gitignore`，避免本機 Vercel 設定被提交到 GitHub。

變更原因：

- 使用者希望完成 Vercel 部署步驟，讓 GitHub push 後可以由 Vercel 進行自動部署。

影響檔案：

- `.gitignore`
- `deployment-process.md`
- `work-log.md`

後續待辦：

- 完成 Vercel 自動部署確認。
- 記錄正式網站網址。

### 完成 Vercel 首次正式部署

變更類型：正式部署

變更摘要：

- 推送 GitHub commit 後，Vercel 自動建立 Production Deployment。
- 確認部署狀態為 Ready。
- 正式網站網址為 `https://math-quest-clive520s-projects.vercel.app`。
- 使用 `vercel curl` 驗證部署內容，確認首頁包含「數學闖關網站正在準備中」。
- 發現 Vercel 預設啟用 SSO Deployment Protection，外部直接開啟網址會要求 Vercel 驗證。
- 關閉 Vercel SSO Deployment Protection，讓正式網址可以公開瀏覽。
- 使用一般 HTTP 請求確認正式網址回傳 200，且頁面內容正確。
- 更新 `deployment-process.md`，補上正式網站網址與目前保護設定。

變更原因：

- 使用者希望完成 Vercel 部署步驟，並建立可由 GitHub push 自動部署的流程。
- 網站未來需要讓老師與學生直接瀏覽，因此正式網址不能要求 Vercel 帳號驗證。

影響檔案：

- `deployment-process.md`
- `work-log.md`

後續待辦：

- 後續新增 Supabase 前，先建立 Supabase 專案與環境變數管理流程。

### 建立 Vercel 部署用 Next.js 骨架

變更類型：前端專案初始化與部署準備

變更摘要：

- 新增最小 Next.js App Router 專案骨架。
- 建立 Math Quest 首頁，作為 Vercel 初次部署的可建置頁面。
- 新增 `package.json`、`package-lock.json`、`next.config.ts`、`tsconfig.json`、`next-env.d.ts`、`.gitignore`。
- 新增 `app/layout.tsx`、`app/page.tsx`、`app/globals.css`。
- 將 Next.js 更新到 `16.2.6`。
- 使用 npm `overrides` 將 PostCSS 固定到 `8.5.14`，使 `npm audit` 檢查為 0 個漏洞。
- 因 Google Drive 同步資料夾不適合大量寫入 `node_modules`，改在 Windows 暫存資料夾執行 build 驗證。
- 已通過 `npm ci` 與 `npm run build`。

變更原因：

- Vercel 需要一個可部署的網站專案，而目前 repository 原本只有規劃文件。
- 先建立最小可建置版本，方便後續完成 Vercel 與 GitHub 的自動部署串接。

影響檔案：

- `.gitignore`
- `package.json`
- `package-lock.json`
- `next.config.ts`
- `tsconfig.json`
- `next-env.d.ts`
- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `work-log.md`

後續待辦：

- 將本次 Next.js 骨架推送到 GitHub。
- 在 Vercel 匯入 `clive520/Math_Quest` repository。
- 確認 Vercel build 成功並取得部署網址。

### 建立 GitHub Repository 與首次推送

變更類型：版本控制與部署準備

變更摘要：

- 確認 Git for Windows 與 GitHub CLI 已安裝。
- 使用 GitHub CLI 完成 GitHub 登入授權。
- 確認 GitHub 帳號為 `clive520`。
- 決定建立公開 repository：`clive520/Math_Quest`。
- 在 `deployment-process.md` 補上 GitHub repository 連結。
- 完成第一次 Git commit：`Initial project documentation`。
- 建立公開 GitHub repository：`https://github.com/clive520/Math_Quest`。
- 將目前專案文件推送到 GitHub `main` 分支。

變更原因：

- 使用者希望先完成 GitHub 版本控制流程。
- 使用者希望由 Codex 協助建立 repository，取得 repository 網址，並推送目前檔案。

影響檔案：

- `deployment-process.md`
- `work-log.md`

後續待辦：

- 後續再進行 Vercel 串接與自動部署設定。

### 建立部署流程文件

變更類型：部署與專案管理文件

變更摘要：

- 建立 `deployment-process.md`。
- 定義 Math Quest 的標準部署流程。
- 明確規劃每次部署前要先提交到 GitHub，由 GitHub 負責版本控制。
- 規劃 Vercel 從 GitHub 取得最新程式碼並自動部署網站。
- 加入部署前檢查清單、GitHub 操作流程、Vercel 部署後檢查、Supabase 注意事項與問題排查方式。

變更原因：

- 使用者希望建立一份非常重要的部署流程文件，作為之後每次部署工作的依據。
- 使用者希望明確採用「先上傳到 GitHub，再部署到 Vercel」的工作流程。

影響檔案：

- `deployment-process.md`
- `work-log.md`

後續待辦：

- 建立 GitHub repository 後，補上實際 repository 連結。
- 串接 Vercel 後，補上正式網站網址與部署設定。
- 建立 Supabase 專案後，補上需要設定的環境變數名稱與用途。

### 建立網站設計計畫書

變更類型：規劃文件

變更摘要：

- 建立 `math-quest-plan.md`。
- 整理數學闖關網站的整體願景、使用者角色、帳號與班級管理、老師出題系統、老師派題系統、學生闖關體驗、資料架構與開發階段。
- 將網站定位調整為多位老師可註冊使用的平台。
- 加入公開題庫共享機制，讓老師可以公開題目，其他老師可以複製後修改使用。
- 確認技術選型為 Vercel + Supabase，並規劃 GitHub、Vercel、Supabase 各自負責的角色。
- 加入自動化開發與部署目標，期望減少手動操作。

變更原因：

- 使用者希望先建立一份可討論、可延伸的網站設計計畫書。
- 使用者明確表示網站要支援多位老師註冊，並且希望形成共享題庫平台。
- 使用者希望使用 Vercel + Supabase，並希望開發與部署流程盡量自動化。

影響檔案：

- `math-quest-plan.md`

後續待辦：

- 討論學生登入方式。
- 討論公開題庫是否需要審核機制。
- 決定第一版要支援的數學題型。
- 決定第一版闖關畫面的呈現方式。
- 評估是否需要匯入學生名單功能。

### 建立工作日誌

變更類型：專案管理文件

變更摘要：

- 建立 `work-log.md`。
- 定義後續記錄網站變更的基本格式。
- 補上目前已完成的計畫書建立紀錄。

變更原因：

- 使用者希望建立一個工作日誌檔案，在後續任何變更發生時，都能記錄變更項目，方便持續追蹤網站改過哪些內容。

影響檔案：

- `work-log.md`

後續待辦：

- 之後每次新增、修改或刪除重要內容時，都同步更新本工作日誌。
