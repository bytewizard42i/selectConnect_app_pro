# 📋 NoirCard Protocol - Deployment & Testing Instructions

## 🎯 Overview

This document provides comprehensive deployment instructions for the NoirCard Protocol, a unified privacy-preserving business card system with integrated abuse prevention built on Midnight's Compact v0.16.

## 📦 Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Redis**: v7.0 or higher (for relay service)
- **Midnight Compact Compiler**: v0.16.0
- **Git**: Latest version

### Midnight Environment
- Access to Midnight testnet or local development network
- Midnight wallet with test tokens
- Midnight CLI tools installed

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/bytewizard42i/NoirCard_me.git
cd NoirCard_me
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Midnight Network Configuration
MIDNIGHT_NETWORK=testnet
MIDNIGHT_RPC_URL=https://testnet.midnight.network
MIDNIGHT_CHAIN_ID=testnet-v1

# Contract Addresses (after deployment)
NOIRCARD_PROTOCOL_ADDRESS=
NOIRCARD_PROTOCOL_DEPLOY_TX=

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Relay Service
RELAY_PORT=3001
RELAY_CORS_ORIGIN=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_CONTRACT_ADDRESS=
```

## 📝 Contract Deployment

### Step 1: Compile the Unified Contract
```bash
# Navigate to contracts directory
cd contracts/

# Compile NoirCardProtocol.compact
midnightc compile NoirCardProtocol.compact --output build/
```

Expected output:
```
✓ Parsing contract...
✓ Type checking...
✓ Generating ZK circuits...
✓ Optimizing...
✓ Contract compiled successfully
  Output: build/NoirCardProtocol.json
  Size: ~XXX KB
  Circuits: 22
```

### Step 2: Deploy to Testnet
```bash
# Deploy the contract
midnight-cli deploy \
  --contract build/NoirCardProtocol.json \
  --network testnet \
  --wallet your-wallet-address \
  --gas-limit 5000000
```

Expected output:
```
Deploying NoirCardProtocol...
Transaction ID: 0x123...
Contract Address: midnight1abc...
Status: Success
Gas Used: 4,231,567
```

### Step 3: Verify Deployment
```bash
# Verify contract is deployed
midnight-cli contract info --address <CONTRACT_ADDRESS>
```

### Step 4: Update Environment Variables
Add the deployed contract address to your `.env` file:
```env
NOIRCARD_PROTOCOL_ADDRESS=midnight1abc...
NOIRCARD_PROTOCOL_DEPLOY_TX=0x123...
NEXT_PUBLIC_CONTRACT_ADDRESS=midnight1abc...
```

## 🔧 Service Setup

### 1. Redis Server
```bash
# Start Redis (required for relay service)
redis-server

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### 2. Relay Service
```bash
# In a new terminal, start the relay service
npm run relay

# Or for development with hot reload
npm run relay:dev
```

Expected output:
```
[Relay] Starting NoirCard Relay Service...
[Relay] Redis connected successfully
[Relay] WebSocket server listening on :3001
[Relay] REST API available at http://localhost:3001
[Relay] Health check: http://localhost:3001/health
```

### 3. Frontend Application
```bash
# In a new terminal, start the frontend
npm run dev

# Or for production build
npm run build
npm run start
```

Access the application at: `http://localhost:3000`

## 🧪 Testing Instructions

### 1. Unit Tests
```bash
# Run contract unit tests
npm run test:contracts

# Run relay service tests
npm run test:relay

# Run frontend tests
npm run test:frontend

# Run all tests
npm run test
```

### 2. Integration Testing

#### Test Case 1: Create a NoirCard
1. Open the application at `http://localhost:3000`
2. Click "Create New Card"
3. Fill in:
   - Alias: "Test Card"
   - Require Bond: Yes
   - Min Bond: 3 ADA
   - Default TTL: 86400 (24 hours)
   - Phone Pseudonym: "+1-555-XXXX"
   - Email Pseudonym: "test@XXXX.com"
4. Click "Create"
5. Verify card creation in the UI

#### Test Case 2: Post an Abuse Bond
1. Scan or enter a card ID
2. Click "Contact Card Holder"
3. Enter bond amount (must be >= minimum)
4. Click "Post Bond"
5. Verify bond status shows "POSTED"

#### Test Case 3: Progressive Reveal
1. As card_admin, add reveal levels:
   - Level 1: Name only
   - Level 2: Name + LinkedIn
   - Level 3: Full contact
2. Generate an access link
3. As card_recipient, access the link
4. Request each level progressively
5. Verify correct data is revealed at each level

#### Test Case 4: Bond Slashing (Admin)
1. As card_admin, view active bonds
2. Select a bond to slash
3. Provide evidence (stays private)
4. Click "Slash Bond"
5. Verify:
   - Bond state changes to "SLASHED"
   - Safety pool increases
   - Sender reputation updates

#### Test Case 5: Credential Management
1. As card_admin, issue a credential
2. Verify credential state is "ISSUED"
3. Rescind the credential with a reason
4. Verify:
   - Credential state is "REVOKED"
   - Reason hash is stored
   - Reason remains private

### 3. Performance Testing
```bash
# Run performance benchmarks
npm run benchmark

# Expected metrics:
# - Contract deployment: < 10s
# - Card creation: < 2s
# - Bond posting: < 1s
# - Progressive reveal: < 500ms per level
# - Concurrent users: 1000+
```

## 🔍 Debugging & Troubleshooting

### Common Issues

#### Issue 1: Contract Compilation Fails
```
Error: Type mismatch in circuit...
```
**Solution**: Ensure you're using Compact v0.16.0:
```bash
midnightc --version
# Should show: v0.16.0
```

#### Issue 2: Redis Connection Error
```
Error: Redis connection refused
```
**Solution**: Start Redis server:
```bash
redis-server --daemonize yes
```

#### Issue 3: Contract Deployment Fails
```
Error: Insufficient gas
```
**Solution**: Increase gas limit:
```bash
midnight-cli deploy --gas-limit 10000000 ...
```

#### Issue 4: Frontend Can't Connect to Relay
```
Error: WebSocket connection failed
```
**Solution**: Check CORS settings in `.env`:
```env
RELAY_CORS_ORIGIN=http://localhost:3000
```

### Debug Mode
Enable debug logging:
```bash
# Set debug environment variable
export DEBUG=noircard:*

# Run services with debug output
npm run relay:debug
npm run dev:debug
```

## 📊 Monitoring

### Contract Monitoring
```bash
# Monitor contract events
midnight-cli events \
  --contract <CONTRACT_ADDRESS> \
  --from-block latest \
  --follow
```

### Relay Service Health
```bash
# Check relay health
curl http://localhost:3001/health

# Expected response:
{
  "status": "healthy",
  "redis": "connected",
  "uptime": 3600,
  "connections": 42,
  "bonds_active": 15
}
```

### Performance Metrics
```bash
# View relay metrics
curl http://localhost:3001/metrics

# Includes:
# - Request latency
# - Bond processing time
# - WebSocket connections
# - Memory usage
```

## 🚢 Production Deployment

### 1. Security Checklist
- [ ] Change all default passwords
- [ ] Enable TLS/SSL for all services
- [ ] Set up firewall rules
- [ ] Configure rate limiting
- [ ] Enable audit logging
- [ ] Set up monitoring alerts
- [ ] Backup Redis data regularly
- [ ] Use environment-specific configs

### 2. Scaling Considerations
- Deploy relay service behind a load balancer
- Use Redis cluster for high availability
- Implement caching for frequently accessed data
- Set up CDN for frontend assets
- Configure auto-scaling for peak loads

### 3. Mainnet Deployment
```bash
# Deploy to Midnight mainnet
midnight-cli deploy \
  --contract build/NoirCardProtocol.json \
  --network mainnet \
  --wallet <MAINNET_WALLET> \
  --gas-price auto \
  --confirmation-blocks 12
```

## 📚 Additional Resources

### Documentation
- [Midnight Compact v0.16 Docs](https://docs.midnight.network/compact/v0.16)
- [NoirCard Protocol Specification](./contracts/NoirCardProtocol.compact)
- [API Documentation](./docs/API.md)

### Support Channels
- GitHub Issues: https://github.com/bytewizard42i/NoirCard_me/issues
- Discord: https://discord.gg/midnight
- Email: support@noircard.io

## ✅ Deployment Verification Checklist

Before considering deployment complete, verify:

- [ ] Contract deployed successfully
- [ ] All environment variables configured
- [ ] Redis server running and accessible
- [ ] Relay service healthy and responding
- [ ] Frontend connects to relay service
- [ ] Can create new cards
- [ ] Can post and refund bonds
- [ ] Progressive reveal works correctly
- [ ] Admin functions work (suspend, revoke, slash)
- [ ] Read-only queries return correct data
- [ ] All tests passing (unit + integration)
- [ ] Performance within acceptable limits
- [ ] Security measures in place
- [ ] Monitoring and logging configured
- [ ] Backup and recovery tested

## 🎉 Success Indicators

Your deployment is successful when:
1. All services show green health status
2. Test transactions complete in < 2 seconds
3. No errors in service logs for 1 hour
4. Successfully created and accessed 10 test cards
5. Bond lifecycle (post → refund/slash) works end-to-end

---

**Congratulations!** You've successfully deployed the NoirCard Protocol. 

For any issues or questions, please refer to our GitHub repository or contact our support team.

**NoirCard: Where Privacy Meets Accountability** 🃏🔒⚖️
