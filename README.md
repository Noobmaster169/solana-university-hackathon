# Keystore - Biometric Solana Wallet

A passkey-based multi-signature wallet for Solana using the secp256r1 precompile. No seed phrases, just your face or fingerprint.

## 🎯 Project Overview

Keystore is an infrastructure platform that enables any mobile app to integrate biometric-authenticated Solana wallets. Built for the Solana University Hackathon, it demonstrates how the secp256r1 precompile (SIMD-0075) can eliminate seed phrases and provide true Web3 UX.

## 🚀 Quick Start

### For Judges/Reviewers

**Mobile Demo (Primary):**
```bash
cd mobile
npm install
npm run android  # Requires Android device with biometrics
```

**Web Demo (Alternative):**
```bash
cd app
npm install
npm run dev
# Open https://localhost:3000 (HTTPS required for WebAuthn)
```

**View Demo Script:** See `mobile/DEMO_SCRIPT.md` for the complete hackathon presentation flow.

## 📱 Mobile App (Android)

The primary demo is a polished React Native Android app showcasing biometric wallet functionality.

### Features

- ✅ **Biometric Authentication**: FaceID, TouchID, or fingerprint
- ✅ **Hardware Security**: Keys stored in Android Keystore (secure enclave)
- ✅ **Multi-Device Support**: Add backup devices via QR codes
- ✅ **Gasless Transactions**: Optional relayer for fee sponsorship
- ✅ **On-Chain Verification**: Solana secp256r1 precompile
- ✅ **Developer SDK**: 10-line integration for any React Native app

### Architecture

```
┌─────────────────────────────────────────┐
│         React Native App                │
├─────────────────────────────────────────┤
│  Keystore SDK                           │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │  Biometric   │  │  Solana Client  │ │
│  │   Manager    │  │                 │ │
│  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────┘
           │                    │
           ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│  Android         │  │  Solana          │
│  Keystore        │  │  Blockchain      │
│  (secp256r1)     │  │  (Precompile)    │
└──────────────────┘  └──────────────────┘
```

### SDK Documentation

See `mobile/SDK_README.md` for complete SDK documentation and integration examples.

**Quick Example:**
```typescript
import { KeystoreSDK } from '@keystore/react-native-sdk';

const sdk = new KeystoreSDK({
  rpcUrl: 'https://api.devnet.solana.com',
});

// Create wallet with biometrics
await sdk.createWallet('My Phone');

// Send transaction with biometric confirmation
await sdk.sendTransaction({
  to: recipientAddress,
  amount: 0.1, // SOL
});
```

## 🔐 Solana Program

The on-chain program handles identity management, multi-sig, and secp256r1 signature verification.

### Program ID
```
Devnet: 4DS5K64SuWK6PmN1puZVtPouLWCqQDA3aE58MPPuDXu2
```

### Instructions

1. **create_identity**: Initialize wallet with first biometric key
2. **add_key**: Add backup device
3. **execute**: Send SOL or set multi-sig threshold
4. **register_credential**: Store passkey credential ID on-chain

### Build & Deploy

```bash
# Build (use WSL on Windows)
wsl bash -c 'cd /mnt/c/path/to/project && source ~/.cargo/env && anchor build'

# Deploy
anchor deploy --provider.cluster devnet
```

## 🌐 Web App (Alternative Demo)

A Next.js web app demonstrating WebAuthn integration (browser-based passkeys).

### Setup

```bash
cd app
npm install
npm run dev
```

**Note:** Requires HTTPS (localhost works). Test on Chrome/Safari with biometric hardware.

## 💼 Infrastructure Pitch

### For Developers

**Problem:** Web3 onboarding is broken. Users hate seed phrases.

**Solution:** Keystore SDK - biometric wallets in 10 lines of code.

**Use Cases:**
- Gaming apps (no seed phrases for gamers)
- Social apps (tipping, payments)
- E-commerce (crypto checkout)
- DeFi (mobile-first interfaces)

### Business Model

- **Transaction Fees**: 0.1% on relayer
- **Enterprise SDK**: $99-$999/month tiers
- **White-Label**: Custom pricing
- **API Usage**: Tiered pricing

### Competitive Advantages

1. **Non-Custodial**: Users control keys (in hardware)
2. **No Seed Phrases**: Biometrics + multi-device recovery
3. **Gasless UX**: Relayer sponsors fees
4. **Developer-First**: Simple SDK, great docs
5. **Solana Native**: Built on secp256r1 precompile

## 🛠️ Technical Details

### How It Works

1. **Key Generation**: Device generates secp256r1 keypair in secure hardware
2. **Registration**: Compressed public key (33 bytes) stored on-chain
3. **Transaction Signing**: User authenticates with biometrics → device signs transaction
4. **On-Chain Verification**: Solana secp256r1 precompile verifies signature
5. **Execution**: Transaction executes if threshold met

### Security

- **Hardware-Backed Keys**: Never leave secure enclave
- **Biometric Protection**: Keys only accessible with biometrics
- **Nonce-Based Replay Protection**: Each transaction has unique nonce
- **Multi-Sig Support**: Require multiple devices for high-value transactions
- **On-Chain Verification**: Trustless - no reliance on external servers

### Why secp256r1?

- **Passkey Standard**: WebAuthn/FIDO2 use secp256r1 (P-256)
- **Hardware Support**: Built into secure enclaves (Apple, Android)
- **Solana Precompile**: SIMD-0075 enables on-chain verification
- **No Custodial Workarounds**: Fully trustless

## 📂 Project Structure

```
keystore/
├── programs/keystore/          # Solana program (Anchor)
│   ├── src/
│   │   ├── lib.rs             # Program entry point
│   │   ├── state.rs           # Account structures
│   │   ├── instructions/      # Instruction handlers
│   │   └── secp256r1.rs       # Signature verification
│   └── Cargo.toml
├── mobile/                     # React Native Android app (PRIMARY DEMO)
│   ├── src/
│   │   ├── sdk/               # Keystore SDK (reusable)
│   │   ├── screens/           # App screens
│   │   └── navigation/        # Navigation setup
│   ├── SDK_README.md          # SDK documentation
│   ├── DEMO_SCRIPT.md         # Hackathon demo script
│   └── package.json
├── app/                        # Next.js web app (alternative demo)
│   ├── src/
│   │   ├── lib/               # Client SDK
│   │   └── app/               # UI components
│   └── package.json
├── relayer/                    # Transaction relayer (optional)
│   └── src/index.ts
└── README.md                   # This file
```

## 🎬 Demo Flow (5 minutes)

See `mobile/DEMO_SCRIPT.md` for the complete presentation script.

**Quick Flow:**
1. Create wallet with biometrics (10 seconds)
2. Receive SOL (show QR code)
3. Send SOL with biometric confirmation
4. Add backup device via QR code
5. Show multi-device access
6. Pitch SDK to judges

## 🧪 Testing

### Mobile App

```bash
cd mobile
npm install
npm run android  # Physical device recommended
```

**Test Checklist:**
- [ ] Wallet creation with biometrics
- [ ] Balance display
- [ ] Send transaction
- [ ] Receive (QR code)
- [ ] Add backup device
- [ ] Multi-device access

### Solana Program

```bash
anchor test
```

## 📊 Metrics

- **Wallet Creation**: ~10 seconds
- **Transaction Signing**: ~2 seconds (biometric prompt)
- **SDK Integration**: 10 lines of code
- **Security**: Hardware-backed, non-custodial
- **UX**: Zero seed phrases

## 🔗 Links

- **GitHub**: https://github.com/Tgcohce/solana-university-hackathon
- **Program ID**: `4DS5K64SuWK6PmN1puZVtPouLWCqQDA3aE58MPPuDXu2`
- **Demo Video**: [Coming soon]

## 🏆 Hackathon Highlights

### Innovation

- First to build on Solana's secp256r1 precompile (SIMD-0075)
- Eliminates seed phrases with hardware-backed biometrics
- Infrastructure play - SDK for any developer

### Technical Execution

- ✅ Working Solana program with signature verification
- ✅ Complete mobile app with biometric authentication
- ✅ Multi-device support with QR pairing
- ✅ Developer SDK with documentation
- ✅ Demo script for judges

### Business Potential

- Clear revenue model (transaction fees, licensing)
- Large addressable market (all mobile apps)
- Solves real problem (Web3 UX)
- Developer-first approach

## 📝 License

MIT License - see LICENSE file

## 👥 Team

Built for Solana University Hackathon

---

**"Your face is your wallet. No seed phrases. No compromises."**
