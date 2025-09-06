#!/bin/bash
# SelectConnect Contract Compilation Script
# Compiles all Compact contracts using the Midnight compiler

set -e

echo "🔧 Compiling SelectConnect Contracts..."

# Ensure build directory exists
mkdir -p contracts/build

# Start compiler container if not running
docker-compose --profile tools up -d midnight-compiler

# Compile SelectConnect Protocol
echo "📝 Compiling SelectConnectProtocol.compact..."
docker exec midnight-compiler compactc \
    --output-dir /output \
    --target wasm \
    SelectConnectProtocol.compact

# Compile Abuse Escrow
echo "📝 Compiling AbuseEscrow.compact..."
docker exec midnight-compiler compactc \
    --output-dir /output \
    --target wasm \
    AbuseEscrow.compact

# Compile legacy SelectConnect (if needed)
if [ -f "contracts/SelectConnect.compact" ]; then
    echo "📝 Compiling SelectConnect.compact..."
    docker exec midnight-compiler compactc \
        --output-dir /output \
        --target wasm \
        SelectConnect.compact
fi

echo "✅ Contract compilation complete!"
echo "📁 Compiled circuits available in contracts/build/"

# List compiled files
echo "📋 Generated files:"
ls -la contracts/build/
