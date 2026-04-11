# Fix winCodeSign cache extraction issue
# This script manually extracts winCodeSign without symlinks to avoid privilege errors

$cacheDir = "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign"
$zipUrl = "https://github.com/electron-userland/electron-builder-binaries/releases/download/winCodeSign-2.6.0/winCodeSign-2.6.0.7z"
$zipFile = Join-Path $cacheDir "winCodeSign-2.6.0.7z"
$extractDir = Join-Path $cacheDir "winCodeSign-2.6.0"

Write-Host "Fixing winCodeSign cache..." -ForegroundColor Yellow

# Create cache directory
New-Item -ItemType Directory -Force -Path $cacheDir | Out-Null

# Download if not exists
if (-not (Test-Path $zipFile)) {
    Write-Host "  Downloading winCodeSign..." -ForegroundColor DarkGray
    Invoke-WebRequest -Uri $zipUrl -OutFile $zipFile -UseBasicParsing
}

# Extract without symlinks (skip darwin folder)
if (-not (Test-Path $extractDir)) {
    Write-Host "  Extracting (skipping macOS symlinks)..." -ForegroundColor DarkGray
    
    # Use 7zip to list contents
    $7zipPath = "C:\Projects\Personal\brocante_v1.0\electron-vite-project\node_modules\7zip-bin\win\x64\7za.exe"
    
    # Extract everything except darwin folder
    & $7zipPath x -bd $zipFile "-o$extractDir" "-xr!darwin" | Out-Null
    
    Write-Host "  winCodeSign cache fixed!" -ForegroundColor Green
} else {
    Write-Host "  Cache already exists, skipping." -ForegroundColor Green
}
