$ErrorActionPreference = "Continue"

$cloudflared = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
$config = Join-Path $env:USERPROFILE ".cloudflared\daisydaily-local.yml"
$logDirectory = "E:\Works\AI tools\DaisyClothing\logs"
$logFile = Join-Path $logDirectory "cloudflared-daisydaily.log"

New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null

# Windows can start logon tasks before the network stack is ready.
Start-Sleep -Seconds 30

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -LiteralPath $logFile -Value "[$timestamp] Starting DaisyDaily Cloudflare tunnel"

    & $cloudflared tunnel --config $config run *>> $logFile

    $exitCode = $LASTEXITCODE
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -LiteralPath $logFile -Value "[$timestamp] cloudflared exited with code $exitCode; retrying in 15 seconds"
    Start-Sleep -Seconds 15
}
