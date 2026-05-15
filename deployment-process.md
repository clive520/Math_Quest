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

基本流程：

```text
本機修改檔案
→ 確認變更內容
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

## 二、部署前檢查

每次部署前，應先完成以下檢查：

1. 確認功能已完成。
2. 確認沒有明顯錯誤。
3. 確認重要文件已更新。
4. 確認 `work-log.md` 已記錄本次變更。
5. 若有環境變數變更，確認 Vercel 與 Supabase 設定一致。
6. 若有資料庫結構變更，確認 Supabase migration 或 SQL 已妥善保存。

## 三、GitHub 版本控制流程

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

## 四、Vercel 部署流程

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

## 五、Supabase 相關注意事項

Supabase 負責資料庫、登入與權限控管，因此部署時要特別注意資料庫與環境變數。

### 環境變數

Vercel 需要設定與 Supabase 相關的環境變數，例如：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

注意：

- `NEXT_PUBLIC_` 開頭的變數可被前端使用。
- `SUPABASE_SERVICE_ROLE_KEY` 權限很高，不能放到前端程式碼中。
- 不要把 `.env.local` 或任何密鑰提交到 GitHub。

### 資料庫變更

若有修改資料表、欄位、權限規則或 Supabase function，應留下紀錄。

建議做法：

- 將 SQL 或 migration 檔案保存在專案中。
- 在 `work-log.md` 記錄資料庫變更原因。
- 部署前確認本機程式與 Supabase 資料庫結構一致。

## 六、標準部署檢查清單

每次部署前可依照以下清單確認：

- [ ] 功能修改完成。
- [ ] 已檢查本機變更內容。
- [ ] 已更新相關文件。
- [ ] 已更新 `work-log.md`。
- [ ] 已確認沒有提交密碼、API key 或敏感資料。
- [ ] 已執行必要測試。
- [ ] 已提交 Git commit。
- [ ] 已推送到 GitHub。
- [ ] Vercel 部署成功。
- [ ] 正式網站或預覽網站已確認可正常使用。

## 七、發生問題時的處理方式

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

### 網站部署成功但功能異常

先檢查：

- 瀏覽器 console。
- Vercel runtime log。
- Supabase authentication 設定。
- Supabase Row Level Security policy。
- 資料表欄位是否與程式碼一致。

## 八、未來自動化目標

未來可以逐步加入：

- GitHub Pull Request 流程。
- Vercel Preview Deployment 檢查。
- 自動測試。
- 自動格式檢查。
- Supabase migration 自動化。
- 部署完成後自動執行基本功能檢查。

## 九、目前採用流程

目前 Math Quest 採用以下部署原則：

1. 所有檔案先在本機修改。
2. 修改完成後先提交到 Git。
3. Git commit 後推送到 GitHub。
4. Vercel 從 GitHub 取得最新程式碼並自動部署。
5. 部署完成後檢查網站是否正常。
6. 每次重要修改都更新 `work-log.md`。

目前 GitHub repository：

```text
https://github.com/clive520/Math_Quest
```

目前 Vercel project：

```text
clive520s-projects/math-quest
```
