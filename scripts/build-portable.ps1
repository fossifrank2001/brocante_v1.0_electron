# ============================================================================
# Brocante Portable Build - Full Build Script
# Builds a standalone .exe that includes PHP + Laravel + Electron
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

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       BROCANTE - Portable Build" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# STEP 1: Setup portable resources (PHP + Laravel)
# ============================================================================
Write-Host "[Step 1/5] Setting up portable resources..." -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor DarkGray

# ─── Step 1a: Create directories ───
Write-Host "  [1a] Creating directories..." -ForegroundColor DarkGray
New-Item -ItemType Directory -Force -Path $ResourcesDir | Out-Null
New-Item -ItemType Directory -Force -Path $PhpDir | Out-Null

# ─── Step 1b: Download PHP Portable ───
$PhpZipName = "php-$PhpVersion-nts-Win32-vs16-$Arch.zip"
$PhpDownloadUrl = "https://windows.php.net/downloads/releases/archives/$PhpZipName"
$PhpZipPath = Join-Path $ResourcesDir $PhpZipName

if (Test-Path (Join-Path $PhpDir "php.exe")) {
    Write-Host "  [1b] PHP already downloaded, skipping..." -ForegroundColor Green
} else {
    Write-Host "  [1b] Downloading PHP $PhpVersion ($Arch)..." -ForegroundColor Yellow
    Write-Host "       URL: $PhpDownloadUrl" -ForegroundColor DarkGray
    
    try {
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

# ─── Step 1c: Configure PHP ───
Write-Host "  [1c] Configuring PHP..." -ForegroundColor DarkGray
$PhpIniSource = Join-Path $ScriptDir "php.ini"
$PhpIniDest = Join-Path $PhpDir "php.ini"

if (Test-Path $PhpIniSource) {
    Copy-Item $PhpIniSource $PhpIniDest -Force
    Write-Host "       php.ini configured!" -ForegroundColor Green
} else {
    Write-Host "       WARNING: php.ini not found, using defaults" -ForegroundColor DarkYellow
}

# ─── Step 1d: Prepare Laravel API bundle ───
Write-Host "  [1d] Preparing Laravel API bundle..." -ForegroundColor DarkGray

if (Test-Path $LaravelBundleDir) {
    Remove-Item $LaravelBundleDir -Recurse -Force
}

if (-not (Test-Path (Join-Path $LaravelDir "vendor\autoload.php"))) {
    Write-Host "       Installing Composer dependencies..." -ForegroundColor DarkGray
    Push-Location $LaravelDir
    composer install --no-dev --optimize-autoloader --no-interaction
    Pop-Location
}

New-Item -ItemType Directory -Force -Path $LaravelBundleDir | Out-Null

$essentialDirs = @('app', 'bootstrap', 'config', 'database', 'public', 'resources', 'routes', 'vendor', 'storage')
foreach ($dir in $essentialDirs) {
    $source = Join-Path $LaravelDir $dir
    $dest = Join-Path $LaravelBundleDir $dir
    if (Test-Path $source) {
        Copy-Item $source $dest -Recurse -Force
        Write-Host "       Copied: $dir" -ForegroundColor DarkGray
    }
}

$essentialFiles = @('artisan', 'composer.json', '.env.portable', 'server.php')
foreach ($file in $essentialFiles) {
    $source = Join-Path $LaravelDir $file
    $dest = Join-Path $LaravelBundleDir $file
    if (Test-Path $source) {
        Copy-Item $source $dest -Force
    }
}

Write-Host "       Laravel API bundled!" -ForegroundColor Green

# Calculate sizes
$phpSize = (Get-ChildItem $PhpDir -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
$laravelSize = (Get-ChildItem $LaravelBundleDir -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "  PHP size $([math]::Round($phpSize, 1)) MB - Laravel size $([math]::Round($laravelSize, 1)) MB" -ForegroundColor Cyan

# ============================================================================
# STEP 2: Install npm dependencies
# ============================================================================
Write-Host ""
Write-Host "[Step 2/5] Installing npm dependencies..." -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor DarkGray
Push-Location $ProjectRoot
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# ============================================================================
# STEP 3: Build TypeScript
# ============================================================================
Write-Host ""
Write-Host "[Step 3/5] Building TypeScript..." -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor DarkGray
Push-Location $ProjectRoot
npx tsc
if ($LASTEXITCODE -ne 0) {
    Write-Host "WARNING: TypeScript errors found, continuing..." -ForegroundColor DarkYellow
}
Pop-Location

# ============================================================================
# STEP 4: Build Vite
# ============================================================================
Write-Host ""
Write-Host "[Step 4/5] Building Vite (frontend)..." -ForegroundColor Yellow
Write-Host "---------------------------------------------" -ForegroundColor DarkGray
Push-Location $ProjectRoot
npx vite build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Vite build failed!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# ============================================================================
# STEP 5: Package with electron-builder
# ============================================================================
Write-Host ""
Write-Host "[Step 5/5] Packaging..." -ForegroundColor Yellow

# Kill any running Brocante.exe processes to avoid "Access is denied" error
Write-Host "  Stopping any running Brocante processes..." -ForegroundColor DarkGray
try { taskkill /F /IM Brocante.exe 2>&1 | Out-Null } catch {}
Start-Sleep -Seconds 1

# Create 7za.exe wrapper to handle symlink errors (exit code 2) during winCodeSign extraction
Write-Host "  Setting up 7-Zip symlink error handler..." -ForegroundColor DarkGray
$7zaDir = Join-Path $ProjectRoot "node_modules\7zip-bin\win\x64"
$7zaExe = Join-Path $7zaDir "7za.exe"
$7zaReal = Join-Path $7zaDir "7za_original.exe"

if (-not (Test-Path $7zaReal)) {
    # Backup original 7za.exe
    Copy-Item $7zaExe $7zaReal -Force
    
    # Compile a native C# wrapper that treats exit code 2 (symlink errors) as success
    $wrapperCode = @"
using System;
using System.Diagnostics;
class Program {
    static int Main(string[] args) {
        string dir = AppDomain.CurrentDomain.BaseDirectory;
        string real = System.IO.Path.Combine(dir, "7za_original.exe");
        var psi = new ProcessStartInfo(real);
        psi.Arguments = string.Join(" ", args);
        psi.UseShellExecute = false;
        var p = Process.Start(psi);
        p.WaitForExit();
        // Exit code 2 = symlink errors (non-fatal for Windows builds)
        return (p.ExitCode == 2) ? 0 : p.ExitCode;
    }
}
"@
    $wrapperCs = Join-Path $7zaDir "7za_wrapper.cs"
    Set-Content -Path $wrapperCs -Value $wrapperCode -Encoding UTF8
    
    # Compile using .NET csc.exe
    $cscPath = Join-Path ([System.Runtime.InteropServices.RuntimeEnvironment]::GetRuntimeDirectory()) "csc.exe"
    if (-not (Test-Path $cscPath)) {
        # Try finding csc.exe in .NET Framework
        $cscPath = Get-ChildItem "C:\Windows\Microsoft.NET\Framework64\*\csc.exe" | Sort-Object FullName | Select-Object -Last 1
        if ($cscPath) { $cscPath = $cscPath.FullName }
    }
    
    if ($cscPath -and (Test-Path $cscPath)) {
        & $cscPath /nologo /optimize /out:$7zaExe $wrapperCs 2>&1 | Out-Null
        Remove-Item $wrapperCs -Force -ErrorAction SilentlyContinue
        Write-Host "       7-Zip wrapper compiled!" -ForegroundColor Green
    } else {
        Write-Host "       WARNING: Could not find C# compiler, restoring original" -ForegroundColor DarkYellow
        Copy-Item $7zaReal $7zaExe -Force
    }
} else {
    Write-Host "       7-Zip wrapper already in place" -ForegroundColor Green
}

# Remove self-referencing npm link that causes infinite loop
$selfLink = Join-Path $ProjectRoot "node_modules\brocante-v-1-0"
if (Test-Path $selfLink) {
    Write-Host "  Removing npm link..." -ForegroundColor DarkGray
    Remove-Item -Recurse -Force $selfLink -ErrorAction SilentlyContinue
}

Push-Location $ProjectRoot

$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
$env:WIN_CSC_LINK = ""
$env:WIN_CSC_KEY_PASSWORD = ""

npx electron-builder --config electron-builder.json5 --win
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: electron-builder failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# ============================================================================
# DONE
# ============================================================================
Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  BUILD COMPLETE" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

$version = (Get-Content (Join-Path $ProjectRoot "package.json") | ConvertFrom-Json).version
$releaseDir = Join-Path (Join-Path $ProjectRoot "release") $version
if (Test-Path $releaseDir) {
    Write-Host "Output: $releaseDir" -ForegroundColor Cyan
    Get-ChildItem $releaseDir -File | ForEach-Object {
        $size = $_.Length
        if ($size -lt 1KB) {
            Write-Host "  $($_.Name) [$size B]" -ForegroundColor White
        } elseif ($size -lt 1MB) {
            $sizeKB = [math]::Round($size / 1KB, 1)
            Write-Host "  $($_.Name) [$sizeKB KB]" -ForegroundColor White
        } else {
            $sizeMB = [math]::Round($size / 1MB, 1)
            Write-Host "  $($_.Name) [$sizeMB MB]" -ForegroundColor White
        }
    }
}

Write-Host ""
Write-Host "The installer includes:" -ForegroundColor Yellow
Write-Host "  - Electron app" -ForegroundColor White
Write-Host "  - PHP runtime" -ForegroundColor White
Write-Host "  - Laravel API" -ForegroundColor White
Write-Host ""
