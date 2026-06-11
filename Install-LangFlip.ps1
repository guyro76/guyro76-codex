# LangFlip Desktop Installer
# This script removes any existing version and installs the new one

param(
    [string]$Version = "1.0.0"
)

$ErrorActionPreference = "Stop"
$WarningPreference = "SilentlyContinue"

Write-Host "קליקשפה - LangFlip Desktop Installer" -ForegroundColor Cyan
Write-Host "=====================================`n" -ForegroundColor Cyan

# Define paths
$InstallDir = "$env:ProgramFiles\LangFlip Desktop"
$StartMenuDir = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\LangFlip Desktop"
$ZipFile = "$PSScriptRoot\LangFlip-Desktop-win-x64.zip"
$ExePath = "$InstallDir\LangFlipDesktop.exe"

# Check if ZIP exists
if (-not (Test-Path $ZipFile)) {
    Write-Host "❌ Error: LangFlip-Desktop-win-x64.zip not found in the same directory as this script" -ForegroundColor Red
    Write-Host "Please download the ZIP file and place it in the same folder as this installer script" -ForegroundColor Red
    exit 1
}

# 1. Kill any running instances
Write-Host "🔄 Stopping any running instances..." -ForegroundColor Yellow
Stop-Process -Name "LangFlipDesktop" -ErrorAction SilentlyContinue -Force | Out-Null
Start-Sleep -Milliseconds 500

# 2. Remove old installation
if (Test-Path $InstallDir) {
    Write-Host "🗑️  Removing old version..." -ForegroundColor Yellow
    Remove-Item -Path $InstallDir -Recurse -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
}

# 3. Create installation directory
Write-Host "📁 Creating installation directory..." -ForegroundColor Yellow
$null = New-Item -Path $InstallDir -ItemType Directory -Force

# 4. Extract ZIP
Write-Host "📦 Extracting files..." -ForegroundColor Yellow
$shell = New-Object -com shell.application
$zip = $shell.NameSpace($ZipFile)
$null = $shell.NameSpace($InstallDir).CopyHere($zip.items(), 16)
Start-Sleep -Milliseconds 1000

# Verify extraction
if (-not (Test-Path $ExePath)) {
    Write-Host "❌ Error: Installation failed - executable not found" -ForegroundColor Red
    exit 1
}

# 5. Create Start Menu shortcuts
Write-Host "🔗 Creating shortcuts..." -ForegroundColor Yellow
$null = New-Item -Path $StartMenuDir -ItemType Directory -Force -ErrorAction SilentlyContinue

$WshShell = New-Object -ComObject WScript.Shell

# Desktop shortcut
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = "$DesktopPath\קליקשפה.lnk"
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $ExePath
$Shortcut.WorkingDirectory = $InstallDir
$Shortcut.IconLocation = "$ExePath,0"
$Shortcut.Save()

# Start Menu shortcut
$StartMenuShortcut = "$StartMenuDir\קליקשפה.lnk"
$Shortcut = $WshShell.CreateShortcut($StartMenuShortcut)
$Shortcut.TargetPath = $ExePath
$Shortcut.WorkingDirectory = $InstallDir
$Shortcut.IconLocation = "$ExePath,0"
$Shortcut.Save()

# 6. Add to Programs and Features (Windows Registry)
Write-Host "✅ Registering with Windows..." -ForegroundColor Yellow
$UninstallPath = "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\LangFlipDesktop"
$null = New-Item -Path $UninstallPath -Force -ErrorAction SilentlyContinue

$UninstallScript = "$InstallDir\Uninstall.ps1"
$UninstallContent = @"
# Uninstall script for LangFlip Desktop
`$InstallDir = "$InstallDir"
Stop-Process -Name "LangFlipDesktop" -ErrorAction SilentlyContinue -Force
Remove-Item -Path `$InstallDir -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "$StartMenuDir" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "[Environment]::GetFolderPath('Desktop')\קליקשפה.lnk" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\LangFlipDesktop" -Force -ErrorAction SilentlyContinue
"@

Set-Content -Path $UninstallScript -Value $UninstallContent

$null = New-ItemProperty -Path $UninstallPath -Name "DisplayName" -Value "קליקשפה - LangFlip Desktop" -Force
$null = New-ItemProperty -Path $UninstallPath -Name "DisplayVersion" -Value $Version -Force
$null = New-ItemProperty -Path $UninstallPath -Name "UninstallString" -Value "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$UninstallScript`"" -Force
$null = New-ItemProperty -Path $UninstallPath -Name "InstallLocation" -Value $InstallDir -Force
$null = New-ItemProperty -Path $UninstallPath -Name "Publisher" -Value "Guy Rosenberg" -Force

# 7. Done!
Write-Host "`n✅ Installation completed successfully!`n" -ForegroundColor Green
Write-Host "You can now:" -ForegroundColor Green
Write-Host "  • Find 'קליקשפה' shortcut on your desktop" -ForegroundColor Green
Write-Host "  • Find it in Start Menu under 'LangFlip Desktop'" -ForegroundColor Green
Write-Host "  • Uninstall it from Control Panel > Programs and Features" -ForegroundColor Green

Write-Host "`n🧪 Quick test: Type 'akuo' and press Ctrl+Alt+H to get 'שלום'" -ForegroundColor Cyan

# Launch the app
Write-Host "`n🚀 Launching application..." -ForegroundColor Yellow
& $ExePath
