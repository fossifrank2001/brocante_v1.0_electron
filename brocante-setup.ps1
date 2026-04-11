# Brocante Setup - Can be called from anywhere
# Usage: .\brocante-setup.ps1 (or add to PATH)

$ProjectRoot = "C:\Projects\Personal\brocante_v1.0\electron-vite-project"

Write-Host "Changing to project directory: $ProjectRoot" -ForegroundColor Cyan
Push-Location $ProjectRoot

try {
    npm run setup:portable
} finally {
    Pop-Location
}
