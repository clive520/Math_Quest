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
