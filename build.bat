@echo off
REM LangFlip Desktop Build Script for Windows

echo.
echo ===================================
echo  LangFlip Desktop - Build Script
echo ===================================
echo.

REM Check if dotnet is installed
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: .NET SDK is not installed
    echo Please install .NET 8.0 from: https://dotnet.microsoft.com/download
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('dotnet --version') do set DOTNET_VERSION=%%i
echo [OK] .NET SDK found: %DOTNET_VERSION%
echo.

REM Restore dependencies
echo Restoring dependencies...
dotnet restore
if errorlevel 1 (
    echo ERROR: Failed to restore dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies restored
echo.

REM Build
echo Building project...
dotnet build -c Release
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo [OK] Build successful
echo.

REM Output location
set BUILD_DIR=.\bin\Release\net8.0-windows10.0.19041.0

echo Output: %BUILD_DIR%
echo Run with: dotnet run -c Release
echo.
echo Build complete!
pause
