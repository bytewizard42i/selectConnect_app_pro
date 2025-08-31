#!/bin/bash

# NoirCard Local Development Setup Script
# This script starts the required services for local development

echo "🃏 Starting NoirCard Local Development Environment..."

# Check if Docker is available and user has permissions
if ! docker ps >/dev/null 2>&1; then
    echo "❌ Docker daemon not accessible. Trying to fix permissions..."
    
    # Add user to docker group if not already added
    if ! groups $USER | grep -q docker; then
        echo "Adding user to docker group..."
        sudo usermod -aG docker $USER
        echo "⚠️  You need to log out and log back in for Docker group changes to take effect."
        echo "⚠️  Alternatively, run: newgrp docker"
    fi
    
    # Try to start Docker service
    echo "Starting Docker service..."
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Wait a moment for Docker to start
    sleep 3
    
    # Test Docker again
    if ! docker ps >/dev/null 2>&1; then
        echo "❌ Still can't access Docker. Please run: newgrp docker"
        echo "Or log out and log back in, then run this script again."
        exit 1
    fi
fi

echo "✅ Docker is accessible"

# Pull the official Midnight proof server image
echo "📥 Pulling official Midnight proof server image..."
docker pull midnightnetwork/proof-server:latest

# Start services with the simple compose file
echo "🚀 Starting services..."
docker-compose -f docker-compose.simple.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo "📊 Service Status:"
docker-compose -f docker-compose.simple.yml ps

# Test Redis connection
echo "🔍 Testing Redis connection..."
if docker exec noircard-redis redis-cli ping | grep -q PONG; then
    echo "✅ Redis is running"
else
    echo "❌ Redis connection failed"
fi

# Test Midnight proof server
echo "🔍 Testing Midnight proof server..."
if curl -f http://localhost:8080/health >/dev/null 2>&1; then
    echo "✅ Midnight proof server is running"
else
    echo "⚠️  Midnight proof server may still be starting..."
fi

echo ""
echo "🎉 Local development environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run: npm run relay:dev    (to start RelayService)"
echo "2. Run: npm run dev          (to start frontend)"
echo ""
echo "🔗 Service URLs:"
echo "- Redis: localhost:6379"
echo "- Midnight Proof Server: http://localhost:8080"
echo "- Frontend: http://localhost:3000 (when started)"
echo "- RelayService: http://localhost:3001 (when started)"
echo ""
echo "📝 To stop services: docker-compose -f docker-compose.simple.yml down"
