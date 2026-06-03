# 鹿陽國小單一認證系統 — 子系統介接開發文件

> 本文件適用對象：想要接入「鹿陽國小單一認證系統」的第三方系統開發者（例如：數學遊戲闖關系統）。

---

## 一、系統架構概覽

```
使用者（學生/教師）
       │
       │ 1. 前往你的系統，發現需要登入
       ▼
你的系統（數學遊戲）
       │
       │ 2. 導向 SSO 登入頁面（帶上 return_url）
       ▼
SSO 登入頁面（sso-auth-system.web.app）
       │
       │ 3. 使用者輸入帳號/密碼完成驗證
       │ 4. SSO 帶著 Token 導回你的系統
       ▼
你的系統（數學遊戲）
       │
       │ 5. 驗證 Token，取得使用者資料
       │ 6. 讓使用者進入系統
       ▼
使用者成功登入 ✅
```

---

## 二、SSO 基本資訊

| 項目 | 內容 |
|------|------|
| **登入頁面網址** | `https://sso-auth-system.web.app/` |
| **Token 格式** | JWT（JSON Web Token） |
| **Token 有效期** | 24 小時 |
| **演算法** | HS256 |

---

## 三、第一步：讓使用者前往 SSO 登入

當使用者需要登入時，將他們**導向 SSO 登入頁面**，並在網址後面加上 `return_url` 參數，告訴 SSO 登入完成後要回到哪裡。

### 範例網址

```
https://sso-auth-system.web.app/?return_url=https://你的系統網址/callback
```

### 實際範例（數學遊戲）

```
https://sso-auth-system.web.app/?return_url=https://math-game.example.com/auth/callback
```

> ⚠️ `return_url` 的值必須使用 URL encode 編碼。

### JavaScript 範例（導向 SSO）

```javascript
function redirectToSSO() {
  const returnUrl = encodeURIComponent('https://math-game.example.com/auth/callback');
  window.location.href = `https://sso-auth-system.web.app/?return_url=${returnUrl}`;
}
```

---

## 四、第二步：接收 Token（Callback 處理）

使用者在 SSO 完成登入後，SSO 會將他們導回你的 `return_url`，並在網址後面附上 `token` 參數：

```
https://math-game.example.com/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### JavaScript 範例（從網址取得 Token）

```javascript
// 在你的 callback 頁面執行
function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (!token) {
    alert('登入失敗，請重試');
    return;
  }

  // 將 Token 儲存起來（之後 API 請求時需要用到）
  localStorage.setItem('sso_token', token);

  // 解碼 Token 取得使用者資料（不需要密鑰，只是讀取內容）
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('登入使用者：', payload);

  // 跳轉至主頁面
  window.location.href = '/game';
}

handleCallback();
```

---

## 五、Token 內容（JWT Payload）

成功解碼 Token 後，你會拿到以下的使用者資料：

```json
{
  "uid": "Firestore 文件 ID（唯一識別碼）",
  "username": "學號或帳號（例如：113001）",
  "name": "使用者姓名（例如：王大明）",
  "role": "身分（student / teacher / admin）",
  "iat": 1717000000,
  "exp": 1717086400
}
```

### 欄位說明

| 欄位 | 類型 | 說明 | 範例 |
|------|------|------|------|
| `uid` | string | Firestore 資料庫中的唯一 ID，建議用來識別使用者 | `"abc123xyz"` |
| `username` | string | 帳號（學號），全校唯一 | `"113001"` |
| `name` | string | 使用者中文姓名 | `"王大明"` |
| `role` | string | 使用者身分 | `"student"` / `"teacher"` / `"admin"` |
| `iat` | number | Token 發放時間（Unix 時間戳） | `1717000000` |
| `exp` | number | Token 過期時間（Unix 時間戳，有效期 24 小時） | `1717086400` |

> 💡 **建議**：使用 `uid` 作為你的系統中識別使用者的主鍵，因為它不會隨年級升級而改變。

---

## 六、第三步：驗證 Token（重要！）

從網址拿到的 Token **必須進行驗證**，才能確保它是真實由 SSO 系統發出的，而非偽造的。

驗證需要 **JWT 密鑰（Secret）**，請向鹿陽國小資訊管理員索取。

---

### 後端驗證範例（Node.js）

```javascript
const jwt = require('jsonwebtoken');

const JWT_SECRET = '向管理員索取的密鑰';

function verifyToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return { success: true, user: payload };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Express 路由範例
app.get('/auth/callback', (req, res) => {
  const token = req.query.token;
  const result = verifyToken(token);

  if (!result.success) {
    return res.status(401).send('Token 無效或已過期');
  }

  const user = result.user;
  // user.uid      → 唯一 ID
  // user.username → 學號
  // user.name     → 姓名
  // user.role     → 身分

  // 建立你自己系統的 session
  req.session.user = user;
  res.redirect('/game');
});
```

---

### 後端驗證範例（Python / Flask）

```python
import jwt
from flask import Flask, request, redirect, session

app = Flask(__name__)
JWT_SECRET = '向管理員索取的密鑰'

@app.route('/auth/callback')
def callback():
    token = request.args.get('token')
    if not token:
        return '缺少 Token', 400

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return 'Token 已過期，請重新登入', 401
    except jwt.InvalidTokenError:
        return 'Token 無效', 401

    # payload['uid']      → 唯一 ID
    # payload['username'] → 學號
    # payload['name']     → 姓名
    # payload['role']     → 身分

    session['user'] = payload
    return redirect('/game')
```

---

### 前端簡易驗證（僅限低安全性需求）

> ⚠️ 以下方式**無法防止偽造**，僅適用於低安全性場景（例如：純記錄分數，不涉及個人隱私）。

```javascript
function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now) {
      console.warn('Token 已過期');
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

const token = localStorage.getItem('sso_token');
const user = decodeToken(token);

if (user) {
  console.log(`歡迎，${user.name}！你的角色是：${user.role}`);
} else {
  // Token 無效，導回 SSO 重新登入
  redirectToSSO();
}
```

---

## 七、整合流程完整範例

以下是一個完整的前端整合流程（純 JavaScript）：

```javascript
const SSO_URL = 'https://sso-auth-system.web.app/';
const MY_CALLBACK = 'https://math-game.example.com/auth/callback';

// 步驟 1：檢查是否已登入
function checkLogin() {
  const token = localStorage.getItem('sso_token');
  if (!token) {
    goLogin();
    return;
  }

  const user = decodeToken(token);
  if (!user) {
    localStorage.removeItem('sso_token');
    goLogin();
    return;
  }

  // 已登入，顯示使用者資料
  startGame(user);
}

// 步驟 2：導向 SSO 登入
function goLogin() {
  const returnUrl = encodeURIComponent(MY_CALLBACK);
  window.location.href = `${SSO_URL}?return_url=${returnUrl}`;
}

// 步驟 3：處理 SSO 登入完成後的回調
function handleCallback() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  if (!token) return;

  localStorage.setItem('sso_token', token);

  // 清除網址中的 token 參數（避免 token 出現在瀏覽器歷史）
  window.history.replaceState({}, '', window.location.pathname);

  checkLogin();
}

// 解碼 Token
function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// 開始遊戲
function startGame(user) {
  console.log('使用者資料：', user);
  // user.uid      → 用來記錄分數的唯一識別碼
  // user.username → 學號
  // user.name     → 顯示的名字
  // user.role     → 如果只允許學生玩：if (user.role !== 'student') { ... }
}

// 根據目前網址決定要做什麼
if (window.location.pathname === '/auth/callback') {
  handleCallback();
} else {
  checkLogin();
}
```

---

## 八、常見問題

### Q：Token 過期了怎麼辦？
A：偵測到 Token 過期（`exp` 小於當前時間）後，清除本地儲存的 Token 並重新導向 SSO 登入即可。Token 有效期為 24 小時。

### Q：我需要儲存哪個欄位當使用者的 ID？
A：建議使用 `uid`（Firestore 文件 ID）。`username`（學號）理論上也是唯一的，但 `uid` 更穩定。

### Q：如何只允許特定身分的使用者（例如：只有學生可以玩遊戲）？
A：解碼 Token 後檢查 `role` 欄位：
```javascript
if (user.role !== 'student') {
  alert('本系統僅限學生使用');
  return;
}
```

### Q：我可以用 Token 向 SSO 查詢更多使用者資料嗎？
A：目前 SSO 尚未提供公開的使用者資料查詢 API。Token 裡已包含最常用的資訊（姓名、學號、身分），如有其他需求請聯繫系統管理員。

---

## 九、聯絡資訊

如需索取 JWT 密鑰或有技術整合問題，請聯繫鹿陽國小資訊管理員。

---

*文件版本：v1.0 | 最後更新：2026 年 6 月*
