# Keystore Mobile - Biometric Solana Wallet

A React Native Android app demonstrating biometric-authenticated Solana wallets using the secp256r1 precompile.

## Features

- 🔐 **Biometric Authentication**: Fingerprint & Face unlock
- 📱 **Multi-Device Support**: Add backup devices via QR code
- ⚡ **Gasless Transactions**: Relayer sponsors fees
- 🔒 **Hardware Security**: Keys in Android Keystore
- ✅ **On-Chain Verification**: Solana secp256r1 precompile
- 🎯 **Developer SDK**: Reusable components for any app

## Quick Start

### Prerequisites

- Node.js 20+
- React Native development environment
- Android Studio & Android SDK
- Physical Android device with biometrics (recommended)

### Installation

```bash
# Install dependencies
npm install

# Install iOS pods (if building for iOS)
cd ios && pod install && cd ..
```

### Running on Android

```bash
# Start Metro bundler
npm start

# In another terminal, run on Android
npm run android
```

### Running on Device

1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect device via USB
4. Run `npm run android`

## Project Structure

```
mobile/
├── src/
│   ├── sdk/                    # Keystore SDK (reusable)
│   │   ├── KeystoreSDK.ts     # Main SDK class
│   │   ├── BiometricManager.ts # Biometric authentication
│   │   ├── SolanaClient.ts    # Blockchain interactions
│   │   └── types.ts           # TypeScript types
│   ├── screens/               # App screens
│   │   ├── OnboardingScreen.tsx
│   │   ├── CreateWalletScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── SendScreen.tsx
│   │   ├── ReceiveScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── AddDeviceScreen.tsx
│   ├── components/            # Reusable components
│   └── navigation/            # Navigation setup
├── android/                   # Android native code
├── SDK_README.md             # SDK documentation
├── DEMO_SCRIPT.md            # Hackathon demo script
└── package.json
```

## SDK Usage

The SDK in `src/sdk/` is designed to be extracted and published as a standalone package.

### Example Integration

```typescript
import { KeystoreSDK } from './src/sdk';

const sdk = new KeystoreSDK({
  rpcUrl: 'https://api.devnet.solana.com',
});

// Create wallet
const { identity, vault } = await sdk.createWallet('My Phone');

// Send transaction
await sdk.sendTransaction({
  to: recipientAddress,
  amount: 0.1, // SOL
});
```

See [SDK_README.md](./SDK_README.md) for complete documentation.

## Demo Flow

See [DEMO_SCRIPT.md](./DEMO_SCRIPT.md) for the complete hackathon demo script.

### Quick Demo Steps

1. **Create Wallet**: Biometric authentication → Wallet created
2. **Receive SOL**: Show QR code → Receive funds
3. **Send SOL**: Enter amount → Biometric auth → Transaction sent
4. **Add Device**: Generate QR → Scan on backup device → Multi-device wallet
5. **Settings**: View devices, manage multi-sig threshold

## Configuration

### Solana Program ID

Update the program ID in `src/sdk/SolanaClient.ts`:

```typescript
export const PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID');
```

### RPC Endpoint

Change the RPC URL when initializing the SDK:

```typescript
const sdk = new KeystoreSDK({
  rpcUrl: 'https://api.mainnet-beta.solana.com', // Mainnet
  // or
  rpcUrl: 'https://api.devnet.solana.com', // Devnet
});
```

### Relayer (Optional)

To enable gasless transactions:

```typescript
const sdk = new KeystoreSDK({
  rpcUrl: 'https://api.devnet.solana.com',
  relayerUrl: 'https://your-relayer.com',
});
```

## Building for Production

### Android

```bash
cd android
./gradlew assembleRelease
```

The APK will be in `android/app/build/outputs/apk/release/`.

### Signing

1. Generate keystore:
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore keystore.keystore -alias keystore -keyalg RSA -keysize 2048 -validity 10000
```

2. Update `android/gradle.properties`:
```
MYAPP_UPLOAD_STORE_FILE=keystore.keystore
MYAPP_UPLOAD_KEY_ALIAS=keystore
MYAPP_UPLOAD_STORE_PASSWORD=****
MYAPP_UPLOAD_KEY_PASSWORD=****
```

## Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
# Install Detox
npm install -g detox-cli

# Build and test
detox build -c android.debug
detox test -c android.debug
```

### Manual Testing Checklist

- [ ] Wallet creation with biometrics
- [ ] Balance display updates
- [ ] Send transaction with biometric confirmation
- [ ] Receive SOL (QR code display)
- [ ] Add backup device (QR generation & scanning)
- [ ] Multi-device access
- [ ] Settings screen (device list, threshold)
- [ ] Delete wallet

## Troubleshooting

### Biometric Authentication Not Working

- Ensure device has biometric hardware
- Check biometric enrollment in device settings
- Verify permissions in AndroidManifest.xml

### Solana Connection Issues

- Check network connectivity
- Verify RPC endpoint is accessible
- Try different RPC provider

### Build Errors

```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android
```

### Metro Bundler Issues

```bash
# Reset cache
npm start -- --reset-cache
```

## Infrastructure Pitch

This app demonstrates the Keystore SDK - a developer platform for integrating biometric Solana wallets.

### Value Proposition

- **For Developers**: 10 lines of code to add Web3 wallets
- **For Users**: No seed phrases, just biometrics
- **For Businesses**: White-label wallet solutions

### Business Model

- Transaction fees (0.1% on relayer)
- Enterprise SDK licensing ($99-$999/month)
- White-label solutions (custom pricing)
- API usage tiers

### Target Markets

- Gaming (no seed phrases for gamers)
- Social apps (tipping, payments)
- E-commerce (crypto checkout)
- DeFi (mobile-first interfaces)

## Contributing

This is a hackathon project. For production use:

1. Add comprehensive error handling
2. Implement proper key backup/recovery
3. Add transaction history
4. Implement relayer service
5. Add analytics and monitoring
6. Security audit
7. App store deployment

## License

MIT License - see LICENSE file

## Support

- **Demo Video**: [Link to demo]
- **Documentation**: See SDK_README.md
- **Issues**: GitHub Issues
- **Contact**: [Your contact info]

---

**Built for Solana University Hackathon**
