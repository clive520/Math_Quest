$ErrorActionPreference = "Stop"

# 1. 建立暫存的 Build 目錄
$buildDir = Join-Path $env:TEMP ("math-quest-build-" + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
Write-Host "建立暫存目錄: $buildDir" -ForegroundColor Cyan
New-Item -ItemType Directory -Path $buildDir | Out-Null

# 2. 定義需要複製的檔案與資料夾
$itemsToCopy = @(
    "app",
    "lib",
    "supabase",
    "components",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "next.config.ts",
    "next-env.d.ts",
    "proxy.ts",
    ".env.example"
)

Write-Host "開始複製必要檔案..." -ForegroundColor Cyan
foreach ($item in $itemsToCopy) {
    if (Test-Path $item) {
        Copy-Item -Path $item -Destination $buildDir -Recurse -Force
        Write-Host "  - 成功複製: $item"
    } else {
        Write-Host "  - 略過 (不存在): $item" -ForegroundColor Yellow
    }
}

# 3. 切換到暫存目錄並執行編譯
$originalLocation = Get-Location
try {
    Set-Location $buildDir

    Write-Host "正在執行 npm ci (這可能需要幾分鐘)..." -ForegroundColor Cyan
    npm ci

    Write-Host "正在執行 npm run build..." -ForegroundColor Cyan
    npm run build

    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "✅ Build 測試成功！專案目前沒有編譯錯誤。" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    
    # 若希望執行完畢後把暫存目錄刪除，可以取消下方註解：
    # Remove-Item -Path $buildDir -Recurse -Force
}
catch {
    Write-Host "=========================================" -ForegroundColor Red
    Write-Host "❌ Build 測試失敗！請檢查上方的錯誤訊息。" -ForegroundColor Red
    Write-Host "測試目錄保留於: $buildDir" -ForegroundColor Red
    Write-Host "=========================================" -ForegroundColor Red
}
finally {
    # 切換回原本的目錄
    Set-Location $originalLocation
}
