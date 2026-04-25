# ============================================================================
# Brocante Portable Build - Setup Script
# Downloads PHP portable and prepares Laravel API for bundling
# ============================================================================

param(
    [string]$PhpVersion = "8.2.0",
    [string]$Arch = "x64"
)

$ErrorActionPreference = "Stop"

# Detect script location (works even when called from npm from any directory)
if ($PSScriptRoot) {
    $ScriptDir = $PSScriptRoot
} else {
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
}

$ProjectRoot = Split-Path -Parent $ScriptDir
$BrocanteRoot = Split-Path -Parent $ProjectRoot
$LaravelDir = Join-Path $BrocanteRoot "laravel-api"
$ResourcesDir = Join-Path $ProjectRoot "resources-portable"
$PhpDir = Join-Path $ResourcesDir "php"
$LaravelBundleDir = Join-Path $ResourcesDir "laravel-api"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Brocante Portable Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ─── Step 1: Create directories ───
Write-Host "[1/5] Creating directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $ResourcesDir | Out-Null
New-Item -ItemType Directory -Force -Path $PhpDir | Out-Null

# ─── Step 2: Download PHP Portable ───
$PhpZipName = "php-$PhpVersion-nts-Win32-vs16-$Arch.zip"
$PhpDownloadUrl = "https://windows.php.net/downloads/releases/archives/$PhpZipName"
$PhpZipPath = Join-Path $ResourcesDir $PhpZipName

if (Test-Path (Join-Path $PhpDir "php.exe")) {
    Write-Host "[2/5] PHP already downloaded, skipping..." -ForegroundColor Green
} else {
    Write-Host "[2/5] Downloading PHP $PhpVersion ($Arch)..." -ForegroundColor Yellow
    Write-Host "       URL: $PhpDownloadUrl" -ForegroundColor DarkGray
    
    try {
        # Try archives first, then releases
        try {
            Invoke-WebRequest -Uri $PhpDownloadUrl -OutFile $PhpZipPath -UseBasicParsing
        } catch {
            Write-Host "       Archives URL failed, trying releases..." -ForegroundColor DarkYellow
            $PhpDownloadUrl = "https://windows.php.net/downloads/releases/$PhpZipName"
            Invoke-WebRequest -Uri $PhpDownloadUrl -OutFile $PhpZipPath -UseBasicParsing
        }
        
        Write-Host "       Extracting PHP..." -ForegroundColor DarkGray
        Expand-Archive -Path $PhpZipPath -DestinationPath $PhpDir -Force
        Remove-Item $PhpZipPath -Force
        Write-Host "       PHP extracted successfully!" -ForegroundColor Green
    } catch {
        Write-Host "       ERROR: Failed to download PHP!" -ForegroundColor Red
        Write-Host "       Please download PHP $PhpVersion NTS $Arch manually from:" -ForegroundColor Red
        Write-Host "       https://windows.php.net/download/" -ForegroundColor Cyan
        Write-Host "       Extract it to: $PhpDir" -ForegroundColor Cyan
        exit 1
    }
}

# ─── Step 3: Configure PHP (copy custom php.ini) ───
Write-Host "[3/5] Configuring PHP..." -ForegroundColor Yellow
$PhpIniSource = Join-Path $ScriptDir "php.ini"
$PhpIniDest = Join-Path $PhpDir "php.ini"

if (Test-Path $PhpIniSource) {
    Copy-Item $PhpIniSource $PhpIniDest -Force
    Write-Host "       php.ini configured!" -ForegroundColor Green
} else {
    Write-Host "       WARNING: scripts/php.ini not found, using default" -ForegroundColor DarkYellow
    # Create a minimal php.ini from php.ini-production
    $phpIniProd = Join-Path $PhpDir "php.ini-production"
    if (Test-Path $phpIniProd) {
        $content = Get-Content $phpIniProd -Raw
        # Enable required extensions
        $content = $content -replace ';extension=mbstring', 'extension=mbstring'
        $content = $content -replace ';extension=openssl', 'extension=openssl'
        $content = $content -replace ';extension=pdo_sqlite', 'extension=pdo_sqlite'
        $content = $content -replace ';extension=sqlite3', 'extension=sqlite3'
        $content = $content -replace ';extension=fileinfo', 'extension=fileinfo'
        $content = $content -replace ';extension=curl', 'extension=curl'
        $content = $content -replace ';extension=gd', 'extension=gd'
        $content = $content -replace ';extension=intl', 'extension=intl'
        $content = $content -replace ';extension=bcmath', 'extension=bcmath'
        Set-Content $PhpIniDest $content
        Write-Host "       php.ini created from production template!" -ForegroundColor Green
    }
}

# Verify PHP works
$phpExe = Join-Path $PhpDir "php.exe"
try {
    $phpVer = & $phpExe -v 2>&1
    Write-Host "       $($phpVer[0])" -ForegroundColor Green
} catch {
    Write-Host "       WARNING: Could not verify PHP installation" -ForegroundColor DarkYellow
}

# ─── Step 4: Prepare Laravel API bundle ───
Write-Host "[4/5] Preparing Laravel API bundle..." -ForegroundColor Yellow

if (Test-Path $LaravelBundleDir) {
    Write-Host "       Cleaning previous bundle..." -ForegroundColor DarkGray
    Remove-Item $LaravelBundleDir -Recurse -Force
}

# Check if vendor exists
if (-not (Test-Path (Join-Path $LaravelDir "vendor"))) {
    Write-Host "       Installing Composer dependencies (production)..." -ForegroundColor DarkGray
    Push-Location $LaravelDir
    composer install --no-dev --optimize-autoloader --no-interaction 2>&1 | Out-Null
    Pop-Location
}

# Copy Laravel files (excluding unnecessary files)
Write-Host "       Copying Laravel files..." -ForegroundColor DarkGray
$excludeDirs = @('.git', '.idea', 'node_modules', 'tests', 'storage/logs', 'storage/framework/sessions', 'storage/framework/views', 'storage/framework/cache')
$excludeFiles = @('*.md', '.env', '.env.testing', '.phpunit.result.cache', '*.code-workspace', 'phpunit.xml', 'vite.config.js', 'package.json', 'package-lock.json', '_lighthouse_ide_helper.php', '*.php~')

# Use robocopy for efficient copying with exclusions
$robocopyExcludeDirs = $excludeDirs -join " "
$robocopyExcludeFiles = $excludeFiles -join " "

# Simple copy approach
New-Item -ItemType Directory -Force -Path $LaravelBundleDir | Out-Null

# Copy essential directories
$essentialDirs = @('app', 'bootstrap', 'config', 'database', 'public', 'resources', 'routes', 'vendor', 'storage')
foreach ($dir in $essentialDirs) {
    $source = Join-Path $LaravelDir $dir
    $dest = Join-Path $LaravelBundleDir $dir
    if (Test-Path $source) {
        Copy-Item $source $dest -Recurse -Force
        Write-Host "       Copied: $dir" -ForegroundColor DarkGray
    }
}

# Copy essential root files
$essentialFiles = @('artisan', 'composer.json', '.env.portable')
foreach ($file in $essentialFiles) {
    $source = Join-Path $LaravelDir $file
    $dest = Join-Path $LaravelBundleDir $file
    if (Test-Path $source) {
        Copy-Item $source $dest -Force
    }
}

# Ensure storage subdirectories exist
$storageDirs = @(
    'storage/app',
    'storage/app/public',
    'storage/framework',
    'storage/framework/cache',
    'storage/framework/sessions',
    'storage/framework/views',
    'storage/logs'
)
foreach ($dir in $storageDirs) {
    $dirPath = Join-Path $LaravelBundleDir $dir
    New-Item -ItemType Directory -Force -Path $dirPath | Out-Null
    # Create .gitignore to keep the directory
    Set-Content (Join-Path $dirPath ".gitignore") "*`n!.gitignore`n"
}

# Remove test files and unnecessary items from vendor
$vendorTestDirs = Get-ChildItem -Path (Join-Path $LaravelBundleDir "vendor") -Recurse -Directory -Filter "tests" -ErrorAction SilentlyContinue
foreach ($testDir in $vendorTestDirs) {
    Remove-Item $testDir.FullName -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "       Laravel API bundled!" -ForegroundColor Green

# ─── Step 5: Configure Windows Task Scheduler (Daily Cron) ───
Write-Host "[5/6] Configuring Windows Task Scheduler (Daily Cron at 08:00)..." -ForegroundColor Yellow

$TaskName = "BrocanteInvoiceDeadlines"
$PhpExePath = Join-Path $PhpDir "php.exe"
$ArtisanPath = Join-Path $LaravelDir "artisan"
$ActionScript = "$PhpExePath $ArtisanPath notify:invoice-deadlines"

try {
    # Check if task already exists
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Write-Host "       Task already exists, updating..." -ForegroundColor DarkGray
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }

    $action = New-ScheduledTaskAction -Execute $PhpExePath -Argument "$ArtisanPath notify:invoice-deadlines"
    $trigger = New-ScheduledTaskTrigger -Daily -At 8am
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
    
    Register-ScheduledTask -Action $action -Trigger $trigger -Settings $settings -TaskName $TaskName -Description "Runs Brocante invoice deadline notifications daily at 08:00" -User "SYSTEM" -RunLevel Highest
    
    Write-Host "       Windows Task scheduled successfully for 08:00 daily!" -ForegroundColor Green
} catch {
    Write-Host "       WARNING: Could not schedule Windows Task. You might need to run this script as Administrator." -ForegroundColor DarkYellow
    Write-Host "       Error: $($_.Exception.Message)" -ForegroundColor Red
}

# ─── Step 6: Summary ───
Write-Host ""
Write-Host "[6/6] Setup complete!" -ForegroundColor Green
Write-Host ""

# Calculate sizes
$phpSize = (Get-ChildItem $PhpDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
$laravelSize = (Get-ChildItem $LaravelBundleDir -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB

Write-Host "  Resources directory: $ResourcesDir" -ForegroundColor Cyan
Write-Host "  PHP size:           $([math]::Round($phpSize, 1)) MB" -ForegroundColor Cyan
Write-Host "  Laravel size:       $([math]::Round($laravelSize, 1)) MB" -ForegroundColor Cyan
Write-Host "  Total:              $([math]::Round($phpSize + $laravelSize, 1)) MB" -ForegroundColor Cyan
Write-Host "  Scheduled Task:     $TaskName (08:00 Daily)" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor Yellow
Write-Host "    1. Run: brocante-build" -ForegroundColor White
Write-Host "    2. Find the installer in: release/" -ForegroundColor White
Write-Host ""
