#!/bin/bash

# Start Midnight Proof Server for SelectConnect
# Based on Midnight documentation: https://docs.midnight.network/quickstart

set -e

echo "🌙 Starting Midnight Proof Server for SelectConnect..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Pull the latest proof server image
echo "📥 Pulling latest Midnight proof server image..."
docker pull midnightnetwork/proof-server:latest

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Start the proof server (simplified setup)
echo "🚀 Starting Midnight proof server on port 6300..."
docker-compose -f docker-compose.simple.yml up -d midnight-proof-server

# Wait for health check
echo "⏳ Waiting for proof server to be ready..."
sleep 10

# Check if the server is running
if curl -f http://localhost:6300/health > /dev/null 2>&1; then
    echo "✅ Midnight proof server is running successfully!"
    echo "📍 Proof server endpoint: http://localhost:6300"
    echo "🔍 Health check: http://localhost:6300/health"
    echo ""
    echo "🎯 Your SelectConnect app can now connect to the local proof server."
    echo "📋 To stop: docker-compose -f docker-compose.simple.yml down"
else
    echo "❌ Proof server failed to start properly"
    echo "📋 Check logs: docker-compose -f docker-compose.simple.yml logs midnight-proof-server"
    exit 1
fi
