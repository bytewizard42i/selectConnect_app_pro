# 🌙 Midnight Proof Server Setup for SelectConnect

This guide explains how to run a local Midnight proof server using Docker for SelectConnect development.

## Quick Start

### Option 1: Proof Server Only (Recommended for development)
```bash
./start-proof-server.sh
```

### Option 2: Full Development Stack
```bash
./start-full-stack.sh
```

## Manual Setup

### Pull the Latest Image
```bash
docker pull midnightnetwork/proof-server:latest
```

### Run Proof Server Only
```bash
docker run -p 6300:6300 midnightnetwork/proof-server:latest midnight-proof-server --network testnet
```

### Using Docker Compose
```bash
# Simplified setup (proof server + Redis)
docker-compose -f docker-compose.simple.yml up -d

# Full stack (proof server + local node + Redis + monitoring)
docker-compose up -d
```

## Service Endpoints

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Proof Server | 6300 | http://localhost:6300 | Main proof server endpoint |
| Metrics | 6301 | http://localhost:6301/health | Health check & metrics |
| Local Node RPC | 9933 | http://localhost:9933 | Midnight node HTTP RPC |
| Local Node WS | 9944 | ws://localhost:9944 | Midnight node WebSocket |
| Redis | 6379 | localhost:6379 | Cache & relay service |
| Bull Dashboard | 3002 | http://localhost:3002 | Job queue monitoring |

## Health Checks

```bash
# Check proof server
curl http://localhost:6300/health

# Check local node
curl http://localhost:9933/health

# Check Redis
docker exec selectconnect-redis redis-cli ping
```

## Configuration

The proof server is configured with:
- **Network**: testnet
- **Max Circuit Size**: 2MB
- **Cache Size**: 1000 entries
- **Worker Threads**: 4 (full stack) / 2 (simple)
- **Log Level**: info

## Troubleshooting

### Proof Server Won't Start
```bash
# Check logs
docker-compose logs midnight-proof-server

# Restart service
docker-compose restart midnight-proof-server
```

### Port Conflicts
If port 6300 is already in use, modify the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "6301:6300"  # Use port 6301 instead
```

### Clear Cache and Restart
```bash
docker-compose down -v  # Remove volumes
docker-compose up -d    # Restart with fresh cache
```

## Environment Variables

The `.env.local` file contains all necessary configuration:
- `MIDNIGHT_PROOF_SERVER_URL=http://localhost:6300`
- `MIDNIGHT_NETWORK=testnet`
- `REDIS_URL=redis://localhost:6379`

## Integration with SelectConnect

Your SelectConnect app will automatically connect to the local proof server using the configuration in `.env.local`. The frontend components will use:

```typescript
const proofServerUrl = process.env.NEXT_PUBLIC_MIDNIGHT_PROOF_SERVER_URL;
// Points to: http://localhost:6300
```

## Docker Images Used

- `midnightnetwork/proof-server:latest` - Midnight proof server
- `midnightnetwork/node:latest` - Local Midnight node
- `redis:7.4-alpine` - Redis cache
- `deadly0/bull-board:latest` - Job queue dashboard

## Management Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f midnight-proof-server

# Restart specific service
docker-compose restart midnight-proof-server

# Remove everything (including volumes)
docker-compose down -v
```
