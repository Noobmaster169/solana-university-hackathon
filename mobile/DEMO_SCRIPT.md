# Keystore Demo Script - Solana Hackathon

## Setup Before Demo

### Required
- 2 Android devices with fingerprint/face unlock
- Both devices connected to WiFi
- Keystore app installed on both devices
- Devnet SOL in vault (airdrop during setup)

### Pre-Demo Checklist
- [ ] App builds successfully
- [ ] Biometric authentication works on both devices
- [ ] Devnet connection stable
- [ ] QR code scanning tested
- [ ] Transaction flow tested end-to-end

## Demo Flow (5 minutes)

### Part 1: Introduction (30 seconds)

**Script:**
> "Hi! I'm presenting Keystore - a biometric Solana wallet that eliminates seed phrases.
> 
> The problem: Web3 onboarding is broken. Users hate seed phrases. They lose them, store them insecurely, or never try crypto because it's too complicated.
> 
> Our solution: Your face or fingerprint IS your wallet. No seed phrases. No private key management. Just tap and authenticate."

### Part 2: Wallet Creation (60 seconds)

**Demo Steps:**
1. Open app on Device 1 (primary phone)
2. Tap "Create Wallet with Biometrics"
3. **Authenticate with fingerprint/face**
4. Show wallet created screen
5. Point out: Identity address, Vault address

**Script:**
> "Watch this - I'm creating a Solana wallet right now. [Authenticate]
> 
> Done. That's it. No seed phrase to write down. No private key to manage.
> 
> The private key was just generated in my phone's secure hardware enclave. It never leaves this device. Only my fingerprint can access it."

**Show on screen:**
- Balance: 0 SOL
- Vault address
- Device name: "My Phone"

### Part 3: Receiving Funds (30 seconds)

**Demo Steps:**
1. Tap "Receive"
2. Show QR code
3. (Pre-funded) Show balance update

**Script:**
> "To receive funds, I just show my QR code. This is my vault address - anyone can send SOL here, but only I can spend it with my biometrics.
> 
> [Show balance] I've already received some devnet SOL for this demo."

### Part 4: Sending Transaction (60 seconds)

**Demo Steps:**
1. Tap "Send"
2. Enter recipient address (have it ready)
3. Enter amount: 0.1 SOL
4. Tap "Send with Biometrics"
5. **Authenticate with fingerprint/face**
6. Show success message

**Script:**
> "Now I'll send 0.1 SOL. I enter the recipient address and amount.
> 
> When I tap Send, it prompts for my fingerprint. [Authenticate]
> 
> Behind the scenes, my phone signed the transaction with the secp256r1 key in the secure enclave. Solana's secp256r1 precompile verified the signature on-chain. Transaction complete.
> 
> Notice: No transaction fees. Our relayer sponsors the fees for a gasless user experience."

### Part 5: Multi-Device Backup (90 seconds)

**Demo Steps:**
1. Go to Settings
2. Tap "Add Backup Device"
3. Show QR code on Device 1
4. Open app on Device 2
5. Scan QR code
6. **Authenticate on Device 2**
7. Show both devices registered

**Script:**
> "Here's the killer feature: recovery without seed phrases.
> 
> I'm adding my second phone as a backup device. [Generate QR]
> 
> On my backup phone, I scan this QR code. [Scan]
> 
> It creates a NEW biometric key on this device and registers it to my wallet. [Authenticate]
> 
> Now I have 2 devices that can access this wallet. If I lose my primary phone, I can still access my funds from my backup.
> 
> No seed phrase needed. No single point of failure."

**Show on screen:**
- Registered Devices: 2
- Device 1: "My Phone"
- Device 2: "Backup Phone"
- Multi-Sig Threshold: 1 of 2

### Part 6: Infrastructure Pitch (60 seconds)

**Switch to slides/code examples**

**Script:**
> "Now here's why this is an infrastructure play, not just a consumer wallet.
> 
> We've packaged everything into an SDK. Any React Native app can integrate biometric Solana wallets in 10 lines of code.
> 
> [Show code example]
> 
> ```typescript
> const sdk = new KeystoreSDK({ rpcUrl: '...' });
> await sdk.createWallet('My Phone');
> await sdk.sendTransaction({ to: address, amount: 0.1 });
> ```
> 
> That's it. Gaming apps, social apps, e-commerce - anyone can add Web3 without forcing users to manage seed phrases.
> 
> Our business model:
> - Transaction fees (0.1% on relayer)
> - Enterprise SDK licensing
> - White-label wallet solutions
> 
> We're solving the biggest barrier to Web3 adoption: terrible UX."

### Part 7: Technical Deep Dive (30 seconds - if time)

**Script:**
> "Quick technical note: This uses Solana's new secp256r1 precompile (SIMD-0075).
> 
> Passkeys use secp256r1 signatures. Solana can now verify these on-chain. This enables true biometric authentication for Web3 - no custodial workarounds, fully trustless.
> 
> We're one of the first to build on this new primitive."

### Part 8: Closing (30 seconds)

**Script:**
> "To summarize:
> - No seed phrases - biometrics are your wallet
> - Multi-device recovery - no single point of failure  
> - Gasless transactions - better UX
> - SDK for developers - 10 lines of code
> - Built on Solana's secp256r1 precompile
> 
> We're making Web3 accessible to mainstream users. Thank you!"

## Q&A Preparation

### Expected Questions

**Q: What if someone steals my phone?**
A: Your biometrics are required to sign transactions. A thief can't access your wallet without your fingerprint/face. Plus, you have backup devices.

**Q: What if I lose all my devices?**
A: We recommend adding at least 2 backup devices. Future versions will support social recovery and encrypted cloud backups.

**Q: How do you make money?**
A: Transaction fees on our relayer (0.1%), enterprise SDK licensing, and white-label solutions for companies.

**Q: Is this secure?**
A: Yes - private keys are in hardware-backed secure storage, never leave the device, and signatures are verified on-chain by Solana. No custodial risk.

**Q: Can this work on iOS?**
A: Yes! React Native works on both platforms. We focused on Android for the demo but iOS support is straightforward.

**Q: What about gas fees?**
A: Our relayer sponsors fees for users. We absorb the cost and monetize through other channels (transaction fees, licensing).

**Q: How is this different from other wallets?**
A: Most wallets still use seed phrases. Custodial wallets control your keys. We're non-custodial with biometric authentication - best of both worlds.

## Backup Demo Plan

If technical issues occur:

### Plan B: Video Demo
- Have pre-recorded video of full flow
- Walk through video explaining each step
- Show code examples on screen

### Plan C: Slides Only
- Architecture diagrams
- Code examples
- Screenshots of working app
- Focus on SDK/infrastructure pitch

## Post-Demo

### Follow-Up Materials
- GitHub repo link
- SDK documentation
- Architecture whitepaper
- Demo video link
- Contact info for partnerships

### Metrics to Mention
- "10 lines of code to integrate"
- "Wallet creation in 10 seconds"
- "Zero seed phrases"
- "Multi-device recovery"
- "Gasless transactions"

---

**Remember:** Enthusiasm and confidence matter more than perfection. If something breaks, explain what should happen and why it's valuable.

