#!/bin/bash

# Start Full SelectConnect Development Stack
# Includes: Midnight Proof Server, Local Node, Redis, Bull Dashboard

set -e

echo "🌙 Starting Full SelectConnect Development Stack..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Pull all required images
echo "📥 Pulling required Docker images..."
docker pull midnightnetwork/proof-server:latest
docker pull midnightnetwork/node:latest
docker pull redis:7.4-alpine
docker pull deadly0/bull-board:latest

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans 2>/dev/null || true

# Start the full stack
echo "🚀 Starting full development stack..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 15

# Check service health
echo "🔍 Checking service health..."

# Check proof server
if curl -f http://localhost:6300/health > /dev/null 2>&1; then
    echo "✅ Midnight proof server: Running on port 6300"
else
    echo "⚠️  Midnight proof server: Starting up..."
fi

# Check local node
if curl -f http://localhost:9933/health > /dev/null 2>&1; then
    echo "✅ Midnight local node: Running on ports 9933/9944"
else
    echo "⚠️  Midnight local node: Starting up..."
fi

# Check Redis
if docker exec selectconnect-redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: Running on port 6379"
else
    echo "⚠️  Redis: Starting up..."
fi

echo ""
echo "🎯 SelectConnect Development Stack Status:"
echo "📍 Proof Server: http://localhost:6300"
echo "📍 Local Node RPC: http://localhost:9933"
echo "📍 Local Node WebSocket: ws://localhost:9944"
echo "📍 Redis: localhost:6379"
echo "📍 Bull Dashboard: http://localhost:3002"
echo ""
echo "📋 Management Commands:"
echo "  • View logs: docker-compose logs -f [service-name]"
echo "  • Stop all: docker-compose down"
echo "  • Restart: docker-compose restart [service-name]"
