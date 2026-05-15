# Math Quest 部署流程

本文件是 Math Quest 數學闖關網站的標準部署流程。之後每次網站要更新、發布或交給其他人接手時，都應依照本文件執行。

## 一、部署原則

Math Quest 的部署流程以 GitHub 為版本控制中心，Vercel 為正式網站部署平台。

GitHub repository：

```text
https://github.com/clive520/Math_Quest
```

Vercel project：

```text
clive520s-projects/math-quest
```

正式網站網址：

```text
https://math-quest-clive520s-projects.vercel.app
```

基本流程：

```text
Google 雲端硬碟工作區修改檔案
→ 確認變更內容
→ 複製專案到本機 build 目錄
→ 在本機 build 目錄執行 npm ci 與 npm run build
→ 提交到 Git
→ 上傳到 GitHub
→ Vercel 自動部署
→ 檢查網站是否正常
```

重要原則：

- GitHub 負責保存程式碼與修改紀錄。
- Vercel 負責部署網站。
- 不直接在 Vercel 上手動修改網站內容。
- 每次部署前，都應先把檔案提交到 GitHub。
- 每次重要變更後，都應更新 `work-log.md`。
- 因 Google 雲端硬碟同步大量小檔案速度較慢，建置驗證不要直接依賴雲端硬碟中的 `node_modules`；應先複製到本機 build 目錄，再在本機目錄安裝依賴與執行 build。

## 二、部署前檢查

每次部署前，應先完成以下檢查：

1. 確認功能已完成。
2. 確認沒有明顯錯誤。
3. 確認重要文件已更新。
4. 確認 `work-log.md` 已記錄本次變更。
5. 若有環境變數變更，確認 Vercel 與 Supabase 設定一致。
6. 若有資料庫結構變更，確認 Supabase migration 或 SQL 已妥善保存。
7. 將專案複製到本機 build 目錄，並在該目錄通過 `npm ci` 與 `npm run build`。

## 三、本機 Build 驗證流程

Math Quest 的主要工作區目前位於 Google 雲端硬碟。雲端硬碟適合保存與同步原始碼，但不適合直接執行大量 `node_modules` 讀寫，因此每次部署前建議使用本機 build 目錄驗證。

### 1. 建立本機 build 目錄

建議使用 Windows 暫存目錄或其他非雲端同步資料夾，例如：

```powershell
$buildDir = Join-Path $env:TEMP ("math-quest-build-" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
New-Item -ItemType Directory -Path $buildDir
```

### 2. 複製必要檔案

從 Google 雲端硬碟工作區複製原始碼與設定檔到本機 build 目錄。應複製：

- `app`
- `lib`
- `supabase`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `next.config.ts`
- `next-env.d.ts`
- `proxy.ts`
- `.env.example`

不需要複製：

- `node_modules`
- `.next`
- `.vercel`
- `.env.local`
- `.git`

PowerShell 範例：

```powershell
Copy-Item -LiteralPath app,lib,supabase -Destination $buildDir -Recurse
Copy-Item -LiteralPath package.json,package-lock.json,tsconfig.json,next.config.ts,next-env.d.ts,proxy.ts,.env.example -Destination $buildDir
```

### 3. 在本機 build 目錄安裝與建置

```powershell
Set-Location $buildDir
npm ci
npm run build
```

若這裡通過，代表原始碼與 lock file 在乾淨環境下可以正常建置。若 Google 雲端硬碟工作區的 `node_modules` 損壞或速度很慢，以本機 build 目錄的結果為準。

### 4. 回到 Google 雲端硬碟工作區提交

本機 build 目錄只用於驗證，不作為正式修改來源。建置通過後，回到 Google 雲端硬碟工作區檢查 git diff、提交並推送。

## 四、GitHub 版本控制流程

### 1. 查看目前檔案狀態

```bash
git status
```

用途：

- 查看哪些檔案被新增、修改或刪除。
- 確認是否有不應該提交的檔案。

### 2. 檢查變更內容

```bash
git diff
```

用途：

- 查看本次修改的細節。
- 避免把錯誤內容、測試資料或敏感資訊提交出去。

### 3. 加入要提交的檔案

```bash
git add .
```

若只想提交特定檔案，可使用：

```bash
git add 檔案名稱
```

### 4. 建立提交紀錄

```bash
git commit -m "簡短描述本次變更"
```

提交訊息建議簡短明確，例如：

```bash
git commit -m "Add deployment process documentation"
```

或：

```bash
git commit -m "Update teacher question sharing plan"
```

### 5. 上傳到 GitHub

```bash
git push
```

若是第一次推送新的分支，可能需要：

```bash
git push -u origin 分支名稱
```

## 五、Vercel 部署流程

當程式碼成功上傳到 GitHub 後，Vercel 會依照 GitHub repository 的設定進行部署。

一般情況：

- 推送到正式分支，例如 `main`，Vercel 會部署正式網站。
- 推送到其他分支或 Pull Request，Vercel 會產生預覽網站。

### 部署後檢查

部署完成後，應進入 Vercel 後台確認：

1. 部署狀態是否成功。
2. 是否有 build error。
3. 是否有環境變數缺漏。
4. 正式網站是否能正常開啟。
5. 主要功能是否能正常使用。

建議至少檢查：

- 首頁是否能開啟。
- 老師登入是否正常。
- 學生登入是否正常。
- 題庫頁面是否正常。
- 派題與作答流程是否正常。

## 六、Supabase 相關注意事項

Supabase 負責資料庫、登入與權限控管，因此部署時要特別注意資料庫與環境變數。

### 環境變數

Vercel 需要設定與 Supabase 相關的環境變數，例如：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

注意：

- `NEXT_PUBLIC_` 開頭的變數可被前端使用。
- Supabase 舊版 `anon` key 與 `service_role` key 在 2026 年底前仍可使用，但目前新專案優先使用 publishable key。
- `service_role` 或 secret key 權限很高，不能放到前端程式碼中。
- 不要把 `.env.local` 或任何密鑰提交到 GitHub。

### 資料庫變更

若有修改資料表、欄位、權限規則或 Supabase function，應留下紀錄。

建議做法：

- 將 SQL 或 migration 檔案保存在專案中。
- 在 `work-log.md` 記錄資料庫變更原因。
- 部署前確認本機程式與 Supabase 資料庫結構一致。

## 七、標準部署檢查清單

每次部署前可依照以下清單確認：

- [ ] 功能修改完成。
- [ ] 已檢查本機變更內容。
- [ ] 已更新相關文件。
- [ ] 已更新 `work-log.md`。
- [ ] 已確認沒有提交密碼、API key 或敏感資料。
- [ ] 已複製到本機 build 目錄並通過 `npm ci`。
- [ ] 已在本機 build 目錄通過 `npm run build`。
- [ ] 已執行其他必要測試。
- [ ] 已提交 Git commit。
- [ ] 已推送到 GitHub。
- [ ] Vercel 部署成功。
- [ ] 正式網站或預覽網站已確認可正常使用。

## 八、發生問題時的處理方式

### GitHub 推送失敗

先檢查：

- 是否有登入 GitHub。
- 是否有 repository 權限。
- 是否需要先拉取遠端變更。

可使用：

```bash
git status
git pull
git push
```

### Vercel 部署失敗

先檢查：

- Vercel build log。
- 是否缺少環境變數。
- 是否有 TypeScript 或 lint 錯誤。
- 是否有套件安裝失敗。
- 是否有 Supabase 連線設定錯誤。

### Google 雲端硬碟中的 node_modules 異常

若出現以下情況：

- `next` 指令找不到。
- `node_modules` 內套件檔案變成 0 bytes。
- `npm ci` 在雲端硬碟工作區非常慢或逾時。
- build 時出現看似依賴損壞的錯誤。

優先做法：

1. 不要以雲端硬碟工作區的 `node_modules` 狀態判斷原始碼是否壞掉。
2. 依照「本機 Build 驗證流程」複製到本機 build 目錄。
3. 在本機 build 目錄重新執行 `npm ci` 與 `npm run build`。
4. 若本機 build 目錄可建置，代表問題多半是雲端同步造成，不是程式碼本身錯誤。

### 網站部署成功但功能異常

先檢查：

- 瀏覽器 console。
- Vercel runtime log。
- Supabase authentication 設定。
- Supabase Row Level Security policy。
- 資料表欄位是否與程式碼一致。

## 九、未來自動化目標

未來可以逐步加入：

- GitHub Pull Request 流程。
- Vercel Preview Deployment 檢查。
- 自動測試。
- 自動格式檢查。
- Supabase migration 自動化。
- 部署完成後自動執行基本功能檢查。
- 自動建立本機 build 目錄並複製必要檔案的 script。

## 十、目前採用流程

目前 Math Quest 採用以下部署原則：

1. 所有檔案先在 Google 雲端硬碟工作區修改。
2. 修改完成後先提交到 Git。
3. 部署前複製專案到本機 build 目錄。
4. 在本機 build 目錄執行 `npm ci` 與 `npm run build`。
5. 確認 build 成功後，回到 Google 雲端硬碟工作區建立 Git commit。
6. Git commit 後推送到 GitHub。
7. Vercel 從 GitHub 取得最新程式碼並自動部署。
8. 部署完成後檢查網站是否正常。
9. 每次重要修改都更新 `work-log.md`。

目前 GitHub repository：

```text
https://github.com/clive520/Math_Quest
```

目前 Vercel project：

```text
clive520s-projects/math-quest
```

目前正式網站網址：

```text
https://math-quest-clive520s-projects.vercel.app
```

目前 Supabase project：

```text
Project name: Math Quest
Project ref: loewbggrxtyvdcgtkmzo
Project URL: https://loewbggrxtyvdcgtkmzo.supabase.co
Region: ap-northeast-1
```

目前 Vercel Deployment Protection：

```text
SSO protection 已關閉，正式網址可公開瀏覽。
```
