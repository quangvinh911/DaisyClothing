# ============================================================
# DaisyClothing - IIS Reverse Proxy Setup Script
# Chạy script này dưới quyền Administrator (Run as Admin)
# ============================================================
# Script này sẽ:
# 1. Bật tính năng ARR Proxy trong IIS
# 2. Tạo thư mục vật lý cho website
# 3. Sao chép file web.config chứa quy tắc reverse proxy
# 4. Cấu hình Default Web Site trỏ về thư mục mới
# ============================================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " DaisyClothing - IIS Reverse Proxy Setup"  -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# --- Step 1: Kiểm tra quyền Administrator ---
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[ERROR] Script này cần chạy dưới quyền Administrator!" -ForegroundColor Red
    Write-Host "Hãy click phải PowerShell -> Run as Administrator" -ForegroundColor Yellow
    pause
    exit 1
}

# --- Step 2: Import IIS module ---
Import-Module WebAdministration -ErrorAction SilentlyContinue

# --- Step 3: Bật ARR Proxy ---
Write-Host "`n[1/4] Bật ARR (Application Request Routing) Proxy..." -ForegroundColor Yellow
try {
    Set-WebConfigurationProperty -pspath 'MACHINE/WEBROOT/APPHOST' -filter "system.webServer/proxy" -name "enabled" -value "True"
    Set-WebConfigurationProperty -pspath 'MACHINE/WEBROOT/APPHOST' -filter "system.webServer/proxy" -name "preserveHostHeader" -value "True"
    Write-Host "   -> ARR Proxy đã được bật thành công!" -ForegroundColor Green
} catch {
    Write-Host "   -> Lỗi khi bật ARR: $_" -ForegroundColor Red
    Write-Host "   -> Có thể ARR đã bật sẵn, tiếp tục..." -ForegroundColor Yellow
}

# --- Step 4: Tạo thư mục vật lý ---
$siteDir = "C:\inetpub\DaisyClothing"
Write-Host "`n[2/4] Tạo thư mục website: $siteDir" -ForegroundColor Yellow
if (-not (Test-Path $siteDir)) {
    New-Item -ItemType Directory -Path $siteDir -Force | Out-Null
    Write-Host "   -> Đã tạo thư mục thành công!" -ForegroundColor Green
} else {
    Write-Host "   -> Thư mục đã tồn tại." -ForegroundColor Green
}

# --- Step 5: Sao chép web.config ---
$sourceConfig = "E:\Works\AI tools\DaisyClothing\iis\web.config"
$destConfig = "$siteDir\web.config"
Write-Host "`n[3/4] Sao chép web.config vào thư mục IIS..." -ForegroundColor Yellow
Copy-Item -Path $sourceConfig -Destination $destConfig -Force
Write-Host "   -> Đã sao chép web.config thành công!" -ForegroundColor Green

# --- Step 6: Cấu hình Default Web Site ---
Write-Host "`n[4/4] Cập nhật Default Web Site..." -ForegroundColor Yellow
try {
    Set-ItemProperty "IIS:\Sites\Default Web Site" -Name physicalPath -Value $siteDir
    Write-Host "   -> Default Web Site đã trỏ về $siteDir" -ForegroundColor Green
} catch {
    Write-Host "   -> Lỗi khi cấu hình site: $_" -ForegroundColor Red
}

# --- Step 7: Restart IIS ---
Write-Host "`nKhởi động lại IIS..." -ForegroundColor Yellow
iisreset /restart
Write-Host ""

# --- Kết quả ---
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " CẤU HÌNH HOÀN TẤT!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IIS đã được cấu hình làm Reverse Proxy:" -ForegroundColor White
Write-Host "  http://localhost:80      -> Next.js (port 4200)" -ForegroundColor White
Write-Host "  http://localhost:80/api  -> NestJS  (port 5000)" -ForegroundColor White
Write-Host ""
Write-Host "BƯỚC TIẾP THEO:" -ForegroundColor Yellow
Write-Host "  Vào Cloudflare Zero Trust Dashboard:" -ForegroundColor White
Write-Host "  https://one.dash.cloudflare.com/" -ForegroundColor White
Write-Host ""
Write-Host "  -> Networks -> Tunnels -> Chọn tunnel đang Connected" -ForegroundColor White
Write-Host "  -> Tab 'Public Hostname'" -ForegroundColor White
Write-Host "  -> Sửa pitchball.online:" -ForegroundColor White
Write-Host "     Service URL: http://localhost:80" -ForegroundColor Green
Write-Host ""
Write-Host "  Lưu lại và truy cập https://pitchball.online để kiểm tra!" -ForegroundColor Green
Write-Host ""
pause
