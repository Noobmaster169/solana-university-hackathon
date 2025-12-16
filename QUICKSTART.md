# 🚀 Keystore - Quick Start Guide

Get your passkey wallet running in 5 minutes!

## ⚡ Prerequisites Check

Before starting, make sure you have:

```bash
# Check Node.js (need 18+)
node --version

# Check Rust
rustc --version

# Check Solana CLI
solana --version

# Check Anchor
anchor --version
```

If any are missing:
- **Node.js**: https://nodejs.org
- **Rust**: https://rustup.rs
- **Solana**: https://docs.solana.com/cli/install-solana-cli-tools
- **Anchor**: https://www.anchor-lang.com/docs/installation

## 📦 Step 1: Install Dependencies (1 min)

```bash
# From project root
npm install

# Install frontend dependencies
cd app
npm install
cd ..
```

## 🔨 Step 2: Build the Program (2 min)

```bash
# Build Solana program
anchor build

# This creates:
# - target/deploy/keystore.so (compiled program)
# - target/deploy/keystore-keypair.json (program keypair)
# - target/idl/keystore.json (interface definition)
```

## 🌐 Step 3: Configure Solana (1 min)

```bash
# Set to devnet
solana config set --url devnet

# Create/check your wallet
solana-keygen new --outfile ~/.config/solana/id.json
# (or use existing wallet)

# Get some SOL for deployment
solana airdrop 2
solana balance
```

## 🚀 Step 4: Deploy to Devnet (1 min)

```bash
# Deploy the program
anchor deploy --provider.cluster devnet

# You'll see output like:
# Program Id: ABCdef123...
# 
# COPY THIS PROGRAM ID!
```

## 🔧 Step 5: Update Program ID (30 seconds)

Update the program ID in three places:

**1. `programs/keystore/src/lib.rs` (line 10)**
```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```

**2. `app/src/lib/keystore.ts` (line 8)**
```typescript
export const PROGRAM_ID = new PublicKey("YOUR_PROGRAM_ID_HERE");
```

**3. `Anchor.toml` (line 7)**
```toml
keystore = "YOUR_PROGRAM_ID_HERE"
```

Then rebuild:
```bash
anchor build
anchor deploy --provider.cluster devnet
```

## 🎨 Step 6: Run the Frontend (30 seconds)

```bash
cd app
npm run dev
```

Open **http://localhost:3000** in your browser!

## 🎉 Step 7: Test It Out!

### Create Your First Wallet

1. **Click** "Create with Face ID"
2. **Authenticate** with your device's biometrics
3. **Done!** You now have a Solana wallet with no seed phrase

### Get Some Devnet SOL

1. **Click** "Airdrop" button
2. **Wait** ~5 seconds for confirmation
3. **See** your balance update

### Send a Transaction

1. **Click** "Send"
2. **Enter** a recipient address (use a friend's wallet or create another test wallet)
3. **Enter** amount (try 0.1 SOL)
4. **Click** "Confirm with Face ID"
5. **Authenticate** again
6. **Success!** Transaction sent with just your biometrics

## 🎬 For Hackathon Demo

### Pre-Demo Checklist

- [ ] Program deployed to devnet
- [ ] Frontend running on localhost
- [ ] Device with biometrics ready
- [ ] Test recipient address prepared
- [ ] Vault has some SOL
- [ ] Internet connection stable

### Demo Script (90 seconds)

1. **Show landing page** (10s)
   - Point out "No seed phrase" messaging
   - Highlight biometric security

2. **Create wallet** (20s)
   - Click "Create with Face ID"
   - Show biometric prompt
   - Wallet appears instantly

3. **Get funds** (10s)
   - Click "Airdrop"
   - Balance updates

4. **Send transaction** (30s)
   - Click "Send"
   - Enter address and amount
   - Authenticate with biometrics
   - Show confirmation

5. **Show security** (20s)
   - Scroll to security section
   - Explain multi-device support
   - Mention threshold signatures

## 🐛 Troubleshooting

### "anchor: command not found"
```bash
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
```

### "Program deployment failed"
```bash
# Get more SOL
solana airdrop 2

# Check balance
solana balance

# Try again
anchor deploy --provider.cluster devnet
```

### "Failed to create wallet"
- **Check browser**: Must support WebAuthn (Chrome 109+, Safari 16+, Firefox 119+)
- **Check device**: Must have FaceID, TouchID, or Windows Hello
- **Check HTTPS**: Passkeys require secure context (localhost is OK for dev)

### "Transaction simulation failed"
- **Check logs**: `solana logs` in another terminal
- **Check balance**: Vault needs SOL for transaction
- **Check program**: Ensure program ID is updated everywhere

### Frontend won't start
```bash
# Clear and reinstall
cd app
rm -rf node_modules .next
npm install
npm run dev
```

## 🎯 What You've Built

✅ **Non-custodial wallet** - Keys in secure enclave  
✅ **No seed phrases** - Just biometrics  
✅ **Multi-device ready** - Add up to 5 devices  
✅ **Multi-sig capable** - Configurable thresholds  
✅ **Modern UI** - Beautiful, responsive interface  

## 📚 Next Steps

### For Development
- Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- Run tests: `anchor test`

### For Demo
- Read [DEMO.md](DEMO.md) for presentation script
- Practice the 90-second flow
- Prepare backup video

### For Deployment
- Read [DEPLOY.md](DEPLOY.md) for production deployment
- Set up monitoring
- Configure custom RPC

## 🆘 Need Help?

- **Anchor Discord**: https://discord.gg/anchor
- **Solana Discord**: https://discord.gg/solana
- **Stack Exchange**: https://solana.stackexchange.com

## 🎉 Success!

You now have a working passkey wallet for Solana! 

Share your creation:
- Tweet about it with #SolanaUniversity
- Show it to your friends
- Submit to the hackathon

**Built something cool?** Open a PR and share your improvements!

---

**Time spent**: ~6 minutes  
**Lines of code**: ~2,000  
**Seed phrases**: 0 ✨  
**Mind = blown**: ✅

