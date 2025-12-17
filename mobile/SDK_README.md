# Keystore SDK - Biometric Solana Wallet for React Native

## Overview

Keystore SDK enables any React Native app to integrate biometric-authenticated Solana wallets in minutes. No seed phrases, no private key management - just secure, user-friendly Web3 access powered by device biometrics.

## Features

- 🔐 **Biometric Authentication**: FaceID, TouchID, or fingerprint
- 📱 **Multi-Device Support**: Add backup devices for recovery
- ⚡ **Gasless Transactions**: Optional relayer for fee sponsorship
- 🔒 **Hardware Security**: Keys stored in device secure enclave
- ✅ **On-Chain Verification**: Solana secp256r1 precompile
- 🎯 **Simple API**: 10 lines of code to add a wallet

## Installation

```bash
npm install @keystore/react-native-sdk

# Peer dependencies
npm install @solana/web3.js @noble/hashes
npm install react-native-biometrics @react-native-async-storage/async-storage
npm install react-native-get-random-values buffer
```

### Android Setup

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

### iOS Setup

Add to `ios/YourApp/Info.plist`:

```xml
<key>NSFaceIDUsageDescription</key>
<string>Authenticate to access your wallet</string>
```

## Quick Start

### 1. Initialize SDK

```typescript
import { KeystoreSDK } from '@keystore/react-native-sdk';

const sdk = new KeystoreSDK({
  rpcUrl: 'https://api.devnet.solana.com',
  relayerUrl: 'https://relayer.keystore.app', // Optional
});
```

### 2. Create Wallet

```typescript
// Check if biometrics are available
const available = await sdk.isBiometricAvailable();

if (available) {
  // Create wallet with biometric authentication
  const { identity, vault, transactionSignature } = await sdk.createWallet('My Phone');
  
  console.log('Wallet created!');
  console.log('Identity:', identity.toBase58());
  console.log('Vault:', vault.toBase58());
}
```

### 3. Send Transaction

```typescript
import { PublicKey } from '@solana/web3.js';

// Send SOL with biometric confirmation
const signature = await sdk.sendTransaction({
  to: new PublicKey('recipient_address'),
  amount: 0.1, // SOL
});

console.log('Transaction sent:', signature);
```

### 4. Get Wallet Info

```typescript
const wallet = await sdk.getWallet();

if (wallet) {
  console.log('Balance:', wallet.balance, 'SOL');
  console.log('Device:', wallet.deviceName);
  console.log('Vault:', wallet.vault.toBase58());
}
```

## Complete Example

```typescript
import React, { useState, useEffect } from 'react';
import { View, Button, Text } from 'react-native';
import { KeystoreSDK } from '@keystore/react-native-sdk';
import { PublicKey } from '@solana/web3.js';

export default function WalletScreen() {
  const [sdk] = useState(() => new KeystoreSDK({
    rpcUrl: 'https://api.devnet.solana.com',
  }));
  const [balance, setBalance] = useState(0);
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    checkWallet();
  }, []);

  const checkWallet = async () => {
    const exists = await sdk.hasWallet();
    setHasWallet(exists);
    
    if (exists) {
      const wallet = await sdk.getWallet();
      setBalance(wallet?.balance || 0);
    }
  };

  const createWallet = async () => {
    try {
      await sdk.createWallet('My Phone');
      await checkWallet();
    } catch (error) {
      console.error('Failed to create wallet:', error);
    }
  };

  const sendSOL = async () => {
    try {
      await sdk.sendTransaction({
        to: new PublicKey('recipient_address_here'),
        amount: 0.1,
      });
      await checkWallet();
    } catch (error) {
      console.error('Failed to send:', error);
    }
  };

  if (!hasWallet) {
    return (
      <View>
        <Button title="Create Wallet" onPress={createWallet} />
      </View>
    );
  }

  return (
    <View>
      <Text>Balance: {balance} SOL</Text>
      <Button title="Send 0.1 SOL" onPress={sendSOL} />
    </View>
  );
}
```

## API Reference

### KeystoreSDK

#### Constructor

```typescript
new KeystoreSDK(config: KeystoreSDKConfig)
```

**Config:**
- `rpcUrl: string` - Solana RPC endpoint
- `relayerUrl?: string` - Optional relayer for gasless transactions

#### Methods

##### `isBiometricAvailable(): Promise<boolean>`

Check if biometric authentication is available on the device.

##### `hasWallet(): Promise<boolean>`

Check if a wallet exists on this device.

##### `createWallet(deviceName: string): Promise<WalletInfo>`

Create a new wallet with biometric authentication.

**Returns:**
```typescript
{
  identity: PublicKey;
  vault: PublicKey;
  transactionSignature: string;
}
```

##### `getWallet(): Promise<WalletInfo | null>`

Get current wallet information.

**Returns:**
```typescript
{
  identity: PublicKey;
  vault: PublicKey;
  balance: number; // in SOL
  deviceName: string;
} | null
```

##### `getIdentityAccount(): Promise<IdentityAccount | null>`

Get detailed identity account data (keys, threshold, nonce).

**Returns:**
```typescript
{
  bump: number;
  vaultBump: number;
  threshold: number;
  nonce: number;
  keys: Array<{
    pubkey: Uint8Array;
    name: string;
    addedAt: number;
  }>;
} | null
```

##### `sendTransaction(params: SendTransactionParams): Promise<string>`

Send SOL with biometric confirmation.

**Params:**
```typescript
{
  to: PublicKey;
  amount: number; // in SOL
}
```

**Returns:** Transaction signature

##### `addDevice(newDevicePubkey: Uint8Array, newDeviceName: string): Promise<string>`

Add a backup device to the wallet.

**Returns:** Transaction signature

##### `deleteWallet(): Promise<void>`

Delete wallet from this device. **Warning:** Ensure you have backup devices!

## Architecture

```
┌─────────────────────────────────────────┐
│         Your React Native App           │
├─────────────────────────────────────────┤
│         Keystore SDK                    │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │  Biometric   │  │  Solana Client  │ │
│  │   Manager    │  │                 │ │
│  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────┘
           │                    │
           ▼                    ▼
┌──────────────────┐  ┌──────────────────┐
│  Android/iOS     │  │  Solana          │
│  Secure Enclave  │  │  Blockchain      │
│  (Private Keys)  │  │  (secp256r1)     │
└──────────────────┘  └──────────────────┘
```

## Security

### Key Storage
- Private keys generated in hardware-backed secure storage
- Keys never leave the device
- Only accessible with biometric authentication

### Signature Verification
- Signatures verified on-chain by Solana secp256r1 precompile
- Trustless - no reliance on external servers
- Nonce-based replay protection

### Multi-Device Recovery
- Add backup devices for recovery
- Each device has its own biometric key
- Multi-sig threshold for high-value transactions

## Use Cases

### Consumer Apps
- Gaming wallets (no seed phrases for gamers)
- Social apps with tipping/payments
- E-commerce with crypto checkout

### Enterprise
- Employee expense wallets
- Corporate treasury management
- Compliance-friendly key management

### DeFi
- Mobile DeFi apps
- Staking interfaces
- DAO voting apps

## Infrastructure Pricing

### Free Tier
- Up to 1,000 transactions/month
- Community support
- Devnet access

### Pro Tier ($99/month)
- Up to 50,000 transactions/month
- Email support
- Mainnet access
- Custom branding

### Enterprise (Custom)
- Unlimited transactions
- Dedicated support
- White-label solution
- SLA guarantees
- On-premise deployment option

## Support

- **Documentation**: https://docs.keystore.app
- **Discord**: https://discord.gg/keystore
- **Email**: support@keystore.app
- **GitHub**: https://github.com/keystore/react-native-sdk

## License

MIT License - see LICENSE file for details

## Contributing

We welcome contributions! Please see CONTRIBUTING.md for guidelines.

---

**Built with ❤️ for the Solana ecosystem**

