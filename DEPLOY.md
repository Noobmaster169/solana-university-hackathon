# 🚀 Deployment Guide

## Prerequisites

- Solana CLI installed and configured
- Anchor CLI installed (0.30.1)
- A funded Solana wallet for deployment
- Node.js 18+ for the frontend

## Step 1: Build the Program

```bash
# From the project root
anchor build
```

This will create:
- `target/deploy/keystore.so` - The compiled program
- `target/deploy/keystore-keypair.json` - Program keypair
- `target/idl/keystore.json` - Interface Definition Language file
- `target/types/keystore.ts` - TypeScript types

## Step 2: Deploy to Devnet

### Option A: Using Anchor

```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Note: This requires SOL in your wallet
# Check balance: solana balance
# Airdrop if needed: solana airdrop 2
```

### Option B: Using Solana CLI

```bash
# Deploy the program
solana program deploy \
  target/deploy/keystore.so \
  --keypair ~/.config/solana/id.json \
  --url devnet

# Get the program ID
solana address -k target/deploy/keystore-keypair.json
```

## Step 3: Update Program ID

After deployment, you'll get a program ID like:
```
Program Id: Keys11111111111111111111111111111111111111111
```

Update this ID in **three places**:

### 1. Rust Program (`programs/keystore/src/lib.rs`)

```rust
declare_id!("YOUR_ACTUAL_PROGRAM_ID");
```

### 2. TypeScript Client (`app/src/lib/keystore.ts`)

```typescript
export const PROGRAM_ID = new PublicKey("YOUR_ACTUAL_PROGRAM_ID");
```

### 3. Anchor Config (`Anchor.toml`)

```toml
[programs.devnet]
keystore = "YOUR_ACTUAL_PROGRAM_ID"
```

## Step 4: Rebuild with New Program ID

```bash
# Rebuild the program with updated ID
anchor build

# Redeploy (this will upgrade the existing program)
anchor deploy --provider.cluster devnet
```

## Step 5: Deploy Frontend

### Option A: Vercel (Recommended)

1. Push code to GitHub
2. Connect to Vercel
3. Set build command: `cd app && npm run build`
4. Set output directory: `app/.next`
5. Deploy!

```bash
# Or use Vercel CLI
cd app
npm install -g vercel
vercel
```

### Option B: Netlify

```bash
cd app
npm run build

# Deploy
netlify deploy --prod --dir=.next
```

### Option C: Local/Custom Server

```bash
cd app
npm run build
npm run start

# Runs on http://localhost:3000
```

## Step 6: Environment Variables

Create `app/.env.local`:

```bash
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=YOUR_ACTUAL_PROGRAM_ID
```

For production (mainnet-beta):

```bash
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PROGRAM_ID=YOUR_MAINNET_PROGRAM_ID
```

## Step 7: Verify Deployment

### Test the Program

```bash
# Run tests
anchor test --provider.cluster devnet

# Or test with your own wallet
anchor run test
```

### Test the Frontend

1. Open the deployed URL
2. Try creating a wallet
3. Check transactions on Solana Explorer

## 🔐 Security Checklist

Before deploying to mainnet:

- [ ] Audit the program code
- [ ] Test with multiple devices
- [ ] Verify secp256r1 signature validation
- [ ] Add rate limiting to prevent spam
- [ ] Set up proper relayer infrastructure
- [ ] Add transaction monitoring
- [ ] Implement proper error handling
- [ ] Add logging and analytics
- [ ] Test emergency shutdown procedures
- [ ] Review PDA seeds and bumps
- [ ] Verify upgrade authority settings

## 💰 Deployment Costs

### Devnet (Free)
- Airdrop SOL for testing
- No real costs

### Mainnet
- Program deployment: ~5 SOL
- Account rent: ~0.002 SOL per identity
- Transaction fees: ~0.000005 SOL per transaction

## 🔄 Upgrading the Program

```bash
# Build new version
anchor build

# Upgrade (requires upgrade authority)
anchor upgrade target/deploy/keystore.so \
  --program-id YOUR_PROGRAM_ID \
  --provider.cluster devnet
```

## 📊 Monitoring

### Check Program Account

```bash
solana program show YOUR_PROGRAM_ID --url devnet
```

### Check Program Logs

```bash
solana logs --url devnet | grep YOUR_PROGRAM_ID
```

### Check Transactions

Visit: `https://explorer.solana.com/address/YOUR_PROGRAM_ID?cluster=devnet`

## 🐛 Troubleshooting

### "Insufficient funds for deployment"

```bash
# Get more SOL
solana airdrop 2 --url devnet
```

### "Program deployment failed"

```bash
# Check program size
ls -lh target/deploy/keystore.so

# If too large, optimize build
cargo build-bpf --release
```

### "Transaction simulation failed"

- Check program logs
- Verify account structures
- Ensure correct PDAs
- Check instruction data encoding

### "Frontend can't connect"

- Verify program ID is correct in frontend
- Check RPC endpoint is accessible
- Ensure wallet is funded
- Check browser console for errors

## 🌐 Custom RPC Endpoints

For production, use a dedicated RPC:

### Options:
1. **Helius** - https://helius.dev
2. **QuickNode** - https://quicknode.com
3. **Triton** - https://triton.one
4. **GenesysGo** - https://genesysgo.com

Update in `app/src/lib/solana.ts`:

```typescript
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://your-rpc.com";
export function getConnection(): Connection {
  return new Connection(RPC_URL, "confirmed");
}
```

## 📱 Mobile Deployment

### iOS (TestFlight)

1. Build React Native version
2. Submit to TestFlight
3. Invite testers

### Android (Google Play)

1. Build APK/AAB
2. Submit to Play Store
3. Beta test with internal track

## 🔮 Production Recommendations

1. **Use a Multisig for Program Authority**
   - Squads Protocol for multisig
   - Multiple team members control upgrades

2. **Set Up Monitoring**
   - Datadog/New Relic for APM
   - Sentry for error tracking
   - Custom Solana monitoring

3. **Implement Rate Limiting**
   - Cloudflare for DDoS protection
   - API rate limits
   - Transaction throttling

4. **Add Analytics**
   - Google Analytics for user flow
   - Mixpanel for product analytics
   - Custom on-chain analytics

5. **Documentation**
   - API documentation
   - User guides
   - Video tutorials

## 📞 Support

If you encounter issues:

1. Check the [Anchor Discord](https://discord.gg/anchor)
2. Visit [Solana Stack Exchange](https://solana.stackexchange.com)
3. Review [Anchor Documentation](https://anchor-lang.com)

---

**Ready to deploy?** Follow these steps carefully and you'll have Keystore running in production in no time! 🚀

