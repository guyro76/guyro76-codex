@echo off
REM LangFlip Desktop Installer Batch Wrapper
REM This script launches the PowerShell installer

setlocal enabledelayedexpansion

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo קליקשפה requires administrator privileges to install
    echo Please run this script as administrator
    pause
    exit /b 1
)

REM Get the directory of this script
set SCRIPT_DIR=%~dp0

REM Launch PowerShell installer
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%Install-LangFlip.ps1"

if %errorLevel% neq 0 (
    echo Installation failed with error code %errorLevel%
    pause
)

endlocal
