# ============================================================
# DaisyClothing - IIS Reverse Proxy Setup Script (ASCII Encoding safe)
# Chay script nay duoi quyen Administrator (Run as Admin)
# ============================================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " DaisyClothing - IIS Reverse Proxy Setup"  -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

# --- Step 1: Kiem tra quyen Administrator ---
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[ERROR] Script nay can chay duoi quyen Administrator!" -ForegroundColor Red
    Write-Host "Hay click phai PowerShell -> Run as Administrator" -ForegroundColor Yellow
    pause
    exit 1
}

# --- Step 2: Import IIS module ---
Import-Module WebAdministration -ErrorAction SilentlyContinue

# --- Step 3: Bat ARR Proxy ---
Write-Host "`n[1/4] Bat ARR (Application Request Routing) Proxy..." -ForegroundColor Yellow
try {
    Set-WebConfigurationProperty -pspath 'MACHINE/WEBROOT/APPHOST' -filter "system.webServer/proxy" -name "enabled" -value "True"
    Set-WebConfigurationProperty -pspath 'MACHINE/WEBROOT/APPHOST' -filter "system.webServer/proxy" -name "preserveHostHeader" -value "True"
    Write-Host "   -> ARR Proxy da duoc bat thanh cong!" -ForegroundColor Green
} catch {
    Write-Host "   -> Loi khi bat ARR: $_" -ForegroundColor Red
    Write-Host "   -> Co the ARR da bat san, tiep tuc..." -ForegroundColor Yellow
}

# --- Step 4: Tao thu muc vat ly ---
$siteDir = "C:\inetpub\DaisyClothing"
Write-Host "`n[2/4] Tao thu muc website: $siteDir" -ForegroundColor Yellow
if (-not (Test-Path $siteDir)) {
    New-Item -ItemType Directory -Path $siteDir -Force | Out-Null
    Write-Host "   -> Da tao thu muc thanh cong!" -ForegroundColor Green
} else {
    Write-Host "   -> Thu muc da ton tai." -ForegroundColor Green
}

# --- Step 5: Sao chep web.config ---
$sourceConfig = "E:\Works\AI tools\DaisyClothing\iis\web.config"
$destConfig = "$siteDir\web.config"
Write-Host "`n[3/4] Sao chep web.config vao thu muc IIS..." -ForegroundColor Yellow
Copy-Item -Path $sourceConfig -Destination $destConfig -Force
Write-Host "   -> Da sao chep web.config thanh cong!" -ForegroundColor Green

# --- Step 6: Cau hinh Default Web Site ---
Write-Host "`n[4/4] Cap nhat Default Web Site..." -ForegroundColor Yellow
try {
    Set-ItemProperty "IIS:\Sites\Default Web Site" -Name physicalPath -Value $siteDir
    Write-Host "   -> Default Web Site da tro ve $siteDir" -ForegroundColor Green
} catch {
    Write-Host "   -> Loi khi cau hinh site: $_" -ForegroundColor Red
}

# --- Step 7: Restart IIS ---
Write-Host "`nKhoi dong lai IIS..." -ForegroundColor Yellow
iisreset /restart
Write-Host ""

# --- Ket qua ---
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " CAU HINH HOAN TAT!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IIS da duoc cau hinh lam Reverse Proxy:" -ForegroundColor White
Write-Host "  http://localhost:80      -> Next.js (port 4200)" -ForegroundColor White
Write-Host "  http://localhost:80/api  -> NestJS  (port 5000)" -ForegroundColor White
Write-Host ""
Write-Host "BUOC TIEP THEO:" -ForegroundColor Yellow
Write-Host "  Vao Cloudflare Zero Trust Dashboard:" -ForegroundColor White
Write-Host "  https://one.dash.cloudflare.com/" -ForegroundColor White
Write-Host ""
Write-Host "  -> Networks -> Tunnels -> Chon tunnel dang Connected" -ForegroundColor White
Write-Host "  -> Tab 'Public Hostname'" -ForegroundColor White
Write-Host "  -> Sua pitchball.online:" -ForegroundColor White
Write-Host "     Service URL: http://localhost:80" -ForegroundColor Green
Write-Host ""
Write-Host "  Luu lai va truy cap https://yourdomain de kiem tra!" -ForegroundColor Green
Write-Host ""
pause
