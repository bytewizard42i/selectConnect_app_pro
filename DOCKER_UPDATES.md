# Docker Configuration Updates

## Summary
Updated both Docker Compose files to modern standards with improved security, resource management, and reliability.

## Changes Implemented

### 1. ✅ Docker Compose Modernization
- **Removed** deprecated `version: '3.8'` field
- Now uses modern Compose Specification format

### 2. 🔒 Network Security Improvements
All ports are now bound to localhost only (127.0.0.1) for better security:
- **Proof Server**: `127.0.0.1:6300`, `127.0.0.1:6301`
- **Redis**: `127.0.0.1:6379`
- **Bull Dashboard**: `127.0.0.1:3002`
- **Midnight Node RPC**: `127.0.0.1:9944`, `127.0.0.1:9933`
- **Exception**: P2P port `30333` remains open (required for network connectivity)

**Impact**: Services are only accessible from the host machine, not from external networks.

### 3. 💾 Resource Limits
Added CPU and memory constraints to prevent resource exhaustion:

| Service | CPU Limit | Memory Limit | CPU Reserve | Memory Reserve |
|---------|-----------|--------------|-------------|----------------|
| midnight-proof-server | 2 cores | 2GB | 0.5 cores | 512MB |
| midnight-proof-server (simple) | 1 core | 1GB | 0.25 cores | 256MB |
| midnight-node | 4 cores | 4GB | 1 core | 1GB |
| redis | 1 core | 512MB | 0.25 cores | 128MB |
| redis (simple) | 0.5 cores | 256MB | 0.1 cores | 64MB |
| bull-board | 0.5 cores | 256MB | 0.1 cores | 64MB |

### 4. 📝 Centralized Logging
All services now have consistent logging configuration:
- **Driver**: `json-file`
- **Max size per file**: 10MB
- **Max files retained**: 3
- **Total log space per service**: ~30MB

### 5. 🔄 Restart Policies
Added `restart: unless-stopped` to all services for automatic recovery after:
- Container crashes
- System reboots
- Docker daemon restarts

### 6. ⚡ Service Dependencies
- Bull Dashboard now waits for Redis to be healthy before starting
- Uses `condition: service_healthy` for better orchestration

### 7. 🔐 Security Enhancements
- Redis password now uses environment variables with fallback
- Added security warning in `.env.example`
- Improved healthcheck to suppress auth warnings

## Upgrade Benefits

### Performance
- Resource limits prevent container memory/CPU hogging
- Guaranteed minimum resources for critical services

### Security
- Localhost binding prevents external access
- Environment variable support for sensitive data
- No hardcoded passwords (uses .env)

### Reliability
- Automatic restart on failures
- Proper service dependencies
- Log rotation prevents disk space issues

### Operations
- Predictable resource usage
- Easier debugging with structured logs
- Health-based startup ordering

## Next Steps (Optional)

### For Production Use
1. **Pin Docker image versions** instead of `:latest`
   ```yaml
   image: redis:7.4-alpine  # instead of redis:7-alpine or redis:latest
   ```

2. **Update Redis password** in your `.env` file
   ```bash
   # Generate a strong password
   openssl rand -base64 32
   ```

3. **Consider external volumes** for backups
   ```yaml
   volumes:
     - /path/on/host/redis-data:/data
   ```

4. **Add monitoring** (Prometheus/Grafana)
   - Midnight services expose metrics endpoints
   - Bull Board provides job monitoring UI

## Testing

To verify the updates work:
```bash
# Start services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f

# Check resource usage
docker stats

# Verify ports are localhost-bound
netstat -tlnp | grep -E '(6379|6300|9944|3002)'
```

## Rollback

If you need to revert these changes:
```bash
git checkout docker-compose.yml docker-compose.simple.yml
```

---
**Updated**: 2025-10-04  
**Format**: Docker Compose v2 (Compose Specification)
