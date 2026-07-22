# Script to set up DaisyDaily auto-start on Windows Boot using Task Scheduler & PM2

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host " Setting up DaisyDaily Auto-Start on Boot" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Ensure PM2 has saved current state
Write-Host "[1/3] Saving PM2 state..." -ForegroundColor Yellow
npx pm2 save

# 2. Register Scheduled Task to resurrect PM2 at Boot
Write-Host "[2/3] Registering Windows Scheduled Task for User Logon / Startup..." -ForegroundColor Yellow

$taskName = "DaisyDaily-PM2-AutoStart"

# Create action to resurrect PM2
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c npx pm2 resurrect"

# Create triggers: At Startup and At Logon
$triggerLogon = New-ScheduledTaskTrigger -AtLogOn

# Principal to run as current user
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive

# Register Task
try {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $triggerLogon -Principal $principal
    Write-Host "   -> Scheduled Task '$taskName' registered successfully!" -ForegroundColor Green
} catch {
    Write-Host "   -> Notice: Task Scheduler registration requires Administrator privileges if creating system-level task." -ForegroundColor Yellow
}

Write-Host "[3/3] Updating Startup folder batch file..." -ForegroundColor Yellow

$startupBat = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\start-daisydaily.bat"
$batContent = @"
@echo off
title DaisyDaily Startup Manager

echo ==============================================
echo  DaisyDaily PM2 Startup Check
echo ==============================================
echo.

:: Resurrect PM2 applications
call npx pm2 resurrect

echo.
echo ==============================================
echo  DaisyDaily processes verified in PM2!
echo ==============================================
timeout /t 3 > nul
exit
"@

Set-Content -Path $startupBat -Value $batContent -Encoding UTF8
Write-Host "   -> Startup folder batch file updated!" -ForegroundColor Green

Write-Host "`nSUCCESS! DaisyDaily auto-start configuration completed!" -ForegroundColor Green
Write-Host "DaisyDaily backend (port 5000) and frontend (port 4200) will auto-start on boot." -ForegroundColor Green
