#!/bin/bash

# LangFlip Desktop Build Script

echo "🔨 LangFlip Desktop - Build Script"
echo "=================================="
echo ""

# Check if dotnet is installed
if ! command -v dotnet &> /dev/null; then
    echo "❌ .NET SDK is not installed"
    echo "Please install .NET 8.0 from: https://dotnet.microsoft.com/download"
    exit 1
fi

echo "✅ .NET SDK found: $(dotnet --version)"
echo ""

# Restore dependencies
echo "📦 Restoring dependencies..."
dotnet restore
if [ $? -ne 0 ]; then
    echo "❌ Failed to restore dependencies"
    exit 1
fi
echo "✅ Dependencies restored"
echo ""

# Build
echo "🔨 Building project..."
dotnet build -c Release
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
echo "✅ Build successful"
echo ""

# Output location
BUILD_DIR="./bin/Release/net8.0-windows10.0.19041.0"
echo "📁 Output: $BUILD_DIR"
echo "🚀 Run with: dotnet run -c Release"
echo ""
echo "✨ Build complete!"
