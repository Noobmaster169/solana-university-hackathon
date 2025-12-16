# Keystore Relayer Service

A relayer service that pays transaction fees for Keystore wallet users.

## Features

- ✅ Pays gas fees for user transactions
- ✅ Rate limiting (per-identity)
- ✅ Transaction validation
- ✅ Redis support (with in-memory fallback)
- ✅ Monitoring and stats
- ✅ Graceful shutdown

## Setup

### 1. Install Dependencies

```bash
cd relayer
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
SOLANA_RPC_URL=https://api.devnet.solana.com
RELAYER_PRIVATE_KEY=[your_keypair_array]
KEYSTORE_PROGRAM_ID=Keys11111111111111111111111111111111111111111
PORT=3001
```

### 3. Generate Relayer Keypair

```bash
solana-keygen new --outfile relayer-keypair.json
```

Then convert to array format:
```bash
cat relayer-keypair.json
```

Copy the array into `.env` as `RELAYER_PRIVATE_KEY`.

### 4. Fund Relayer

```bash
solana airdrop 2 $(solana address -k relayer-keypair.json) --url devnet
```

### 5. Run Relayer

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "relayer": "RelayerPublicKey...",
  "network": "devnet"
}
```

### Get Balance
```bash
GET /balance
```

Response:
```json
{
  "balance": 1.5,
  "lamports": 1500000000
}
```

### Relay Transaction
```bash
POST /relay
Content-Type: application/json

{
  "transaction": "base64_encoded_transaction",
  "identity": "IdentityPublicKey..."
}
```

Response:
```json
{
  "signature": "5j7s...",
  "status": "success"
}
```

### Get Stats
```bash
GET /stats
```

Response:
```json
{
  "relayer": "RelayerPublicKey...",
  "balance": 1.5,
  "lamports": 1500000000,
  "transactionsRelayed": 42,
  "totalFeesSpent": 0.00021,
  "uptimeMs": 3600000,
  "uptimeHours": 1
}
```

## Rate Limiting

Default limits (configurable in `.env`):
- **Per Minute**: 10 transactions
- **Per Hour**: 100 transactions

Limits are per identity address.

## Redis (Optional)

For production, use Redis for distributed rate limiting:

```bash
# Install Redis
# Windows: https://redis.io/docs/getting-started/installation/install-redis-on-windows/
# Mac: brew install redis
# Linux: sudo apt install redis

# Start Redis
redis-server

# Update .env
REDIS_URL=redis://localhost:6379
```

Without Redis, the relayer uses in-memory rate limiting (resets on restart).

## Monitoring

Check relayer health:
```bash
curl http://localhost:3001/health
```

Check balance:
```bash
curl http://localhost:3001/balance
```

Get stats:
```bash
curl http://localhost:3001/stats
```

## Security

⚠️ **IMPORTANT**:
- Keep `RELAYER_PRIVATE_KEY` secret
- Use HTTPS in production
- Add authentication for production
- Monitor balance and refill regularly
- Set up alerts for low balance

## Production Deployment

### Using PM2

```bash
npm install -g pm2
pm2 start dist/index.js --name keystore-relayer
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/index.js"]
```

### Environment Variables for Production

```env
NODE_ENV=production
SOLANA_RPC_URL=https://your-premium-rpc.com
LOG_LEVEL=warn
MAX_REQUESTS_PER_MINUTE=5
MAX_REQUESTS_PER_HOUR=50
```

## Cost Estimation

- **Per Transaction**: ~0.000005 SOL (5,000 lamports)
- **100 tx/day**: ~0.0005 SOL/day (~$0.01/day at $20/SOL)
- **1000 tx/day**: ~0.005 SOL/day (~$0.10/day)

## Troubleshooting

### "Insufficient balance"
```bash
solana airdrop 2 RELAYER_PUBKEY --url devnet
```

### "Rate limit exceeded"
Adjust limits in `.env` or wait for reset.

### "Transaction too large"
Transaction exceeds 1232 bytes. Optimize or split.

## Future Improvements

- [ ] Add authentication (API keys)
- [ ] Support multiple networks
- [ ] Add transaction whitelisting
- [ ] Implement fee estimation
- [ ] Add webhook notifications
- [ ] Support transaction batching
- [ ] Add Prometheus metrics
- [ ] Implement circuit breaker pattern

