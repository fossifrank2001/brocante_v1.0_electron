# Brocante Build - Can be called from anywhere
# Usage: .\brocante-build.ps1 (or add to PATH)
# IMPORTANT: Run PowerShell as Administrator for this to work!

$ProjectRoot = "C:\Projects\Personal\brocante_v1.0\electron-vite-project"

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host ""
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "Changing to project directory: $ProjectRoot" -ForegroundColor Cyan
Push-Location $ProjectRoot

try {
    npm run build:portable
} finally {
    Pop-Location
}
