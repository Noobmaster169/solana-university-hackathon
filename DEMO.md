# 🎬 Keystore Demo Script

## For Judges & Presenters

### The Pitch (30 seconds)

"What if you could create a Solana wallet in 5 seconds using just your face? No seed phrases to write down, no extensions to install, just pure biometric security. That's Keystore."

### The Demo (90 seconds)

#### Step 1: Show the Landing Page (10s)
- Open the app
- Point out the three key features: Secure Enclave, Biometric Auth, Multi-Device

#### Step 2: Create Wallet (20s)
1. Click "Create with Face ID"
2. **Authenticate with FaceID/TouchID**
3. Wallet appears instantly
4. Point out: "No seed phrase needed!"

#### Step 3: Get Funds (10s)
- Click "Airdrop" button
- Wait for confirmation
- Balance updates

#### Step 4: Send Transaction (30s)
1. Click "Send"
2. Enter recipient address (use a prepared address)
3. Enter amount (0.1 SOL)
4. Click "Confirm with Face ID"
5. **Authenticate again with biometrics**
6. Transaction confirmed!
7. Show in Solana Explorer

#### Step 5: Show Security Features (20s)
- Scroll to Security section
- Explain multi-device support (up to 5 devices)
- Explain threshold signatures (2-of-2, 3-of-5, etc.)
- Show registered keys

### The Tech (30 seconds)

"Under the hood, we're using:
- WebAuthn for biometric authentication
- secp256r1 signatures (the new SIMD-0075 precompile)
- Anchor for the Solana program
- PDAs for vault management
- Multi-sig with configurable thresholds"

### The Vision (20 seconds)

"This unlocks Solana for billions of users who don't want to deal with seed phrases. Parents, grandparents, anyone with a smartphone can now use crypto safely."

## 🎯 Key Points to Emphasize

1. **No Seed Phrases**: The #1 UX barrier in crypto is gone
2. **Secure**: Keys never leave the device's secure enclave
3. **Fast**: Wallet creation in 5 seconds
4. **Multi-Device**: Add backup devices for recovery
5. **Multi-Sig**: Enterprise-grade security with threshold signatures
6. **secp256r1**: Uses the latest Solana precompile

## 🎪 Interactive Demo

### For Judges to Try

1. Give them your laptop or phone
2. Have them click "Create with Face ID"
3. They use THEIR biometrics (mind = blown 🤯)
4. You airdrop them some devnet SOL
5. They send it back to you using THEIR face
6. They're now convinced

### Wow Moments

- "Wait, no seed phrase?"
- "I just created a wallet with my face?"
- "This works on my phone too?"
- "I can add my other devices?"
- "Multiple signatures for high-value transactions?"

## 🔧 Troubleshooting

### "I don't have FaceID/TouchID"
- Show it on your device
- Explain it works with any WebAuthn authenticator
- Mention hardware keys (YubiKey, etc.) also work

### "How is this secure?"
- Private keys never leave the secure enclave
- Same tech banks use for online authentication
- Biometrics only unlock the key, never transmitted
- Multi-sig for high-value transactions

### "What if I lose my device?"
- Multi-device support means you can add backups
- Could add social recovery in the future
- Could add time-locked recovery

## 📱 Device Requirements

✅ **Works On:**
- MacBook with Touch ID
- iPhone with Face ID
- iPad with Face ID
- Android phones with fingerprint
- Windows Hello devices
- Hardware security keys

❌ **Doesn't Work On:**
- Very old browsers
- Browsers without WebAuthn support
- Devices without biometrics (but can use security keys)

## 🎨 Demo Best Practices

1. **Pre-test**: Make sure your device's biometrics are working
2. **Internet**: Ensure stable connection to devnet
3. **Backup**: Have a video recording as backup
4. **Accounts**: Pre-prepare recipient addresses
5. **Timing**: Practice to stay under 2 minutes
6. **Energy**: Be excited! This is genuinely cool tech

## 🚀 Advanced Features to Mention

- **Session Keys**: Coming soon for gasless transactions
- **Social Recovery**: Add trusted guardians
- **Token Support**: Will work with any SPL token
- **Mobile App**: React Native version in progress
- **Multi-Chain**: Same tech works on other chains

## 💡 Talking Points by Audience

### For Developers
- "Uses Anchor framework"
- "secp256r1 precompile verification"
- "PDAs for deterministic addresses"
- "Open source, check the code"

### For Business People
- "Reduces onboarding friction by 90%"
- "No customer support for lost seed phrases"
- "Enables mainstream adoption"
- "Works with existing enterprise auth"

### For Crypto Natives
- "Non-custodial, keys in your control"
- "Multi-sig for security"
- "Verifiable on-chain"
- "No centralized recovery service"

## 🎬 Closing Line

"With Keystore, we're making Solana as easy to use as FaceID on your iPhone. That's how we get to the next billion users."

---

**Time Allocation:**
- Intro: 30s
- Demo: 90s
- Tech: 30s
- Vision: 20s
- Q&A: 30s
**Total: 3 minutes**

**Remember:** Enthusiasm is contagious. If you're excited about removing seed phrases, judges will be too! 🚀

