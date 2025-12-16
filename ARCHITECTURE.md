# 🏛️ Keystore Architecture

## Overview

Keystore is a non-custodial Solana wallet that uses WebAuthn passkeys (biometric authentication) instead of traditional seed phrases. It leverages Solana's secp256r1 precompile (SIMD-0075) to verify passkey signatures on-chain.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Device                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Browser (Next.js App)                     │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  UI Layer (React Components)                     │ │ │
│  │  │  - CreateWallet, WalletDashboard, SendModal      │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Client Libraries                                │ │ │
│  │  │  - passkey.ts: WebAuthn integration             │ │ │
│  │  │  - keystore.ts: Solana program client           │ │ │
│  │  │  - solana.ts: Blockchain utilities              │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                  │
│                           ▼                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Secure Enclave / TPM                         │ │
│  │  - Stores secp256r1 private key                       │ │
│  │  - Signs with biometric unlock                        │ │
│  │  - Key never leaves enclave                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ RPC
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Solana Blockchain                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Keystore Program (Anchor)                     │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Instructions:                                   │ │ │
│  │  │  - create_identity: Create new wallet            │ │ │
│  │  │  - add_key: Add backup device                    │ │ │
│  │  │  - execute: Process signed actions               │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │  Accounts:                                       │ │ │
│  │  │  - Identity: Stores keys & settings              │ │ │
│  │  │  - Vault: Holds user funds (PDA)                 │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │      secp256r1 Precompile (SIMD-0075)                 │ │
│  │  - Verifies passkey signatures                        │ │
│  │  - Native Solana instruction                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Wallet Creation

```
User clicks "Create Wallet"
  ↓
Browser invokes WebAuthn
  ↓
Secure Enclave generates secp256r1 keypair
  ↓
Biometric authentication required
  ↓
Public key returned to browser
  ↓
Transaction sent to Solana
  ↓
create_identity instruction creates:
  - Identity PDA (stores public key)
  - Vault PDA (holds funds)
  ↓
Credential ID stored in localStorage
  ↓
Wallet ready to use
```

### 2. Transaction Signing

```
User initiates send
  ↓
Build transaction data (action + nonce)
  ↓
Hash to 32 bytes (SHA-256)
  ↓
Browser invokes WebAuthn.get()
  ↓
Biometric authentication required
  ↓
Secure Enclave signs hash with private key
  ↓
Signature returned (DER format)
  ↓
Convert DER → raw r,s format (64 bytes)
  ↓
Build Solana transaction:
  1. secp256r1 verify instruction
  2. execute instruction
  ↓
Submit to blockchain
  ↓
Program verifies signature via precompile
  ↓
Action executed if threshold met
  ↓
Nonce incremented (prevent replay)
```

## Account Structure

### Identity Account

```rust
pub struct Identity {
    pub bump: u8,              // PDA bump seed
    pub vault_bump: u8,        // Vault PDA bump
    pub threshold: u8,         // Required signatures
    pub nonce: u64,           // Replay protection
    pub keys: Vec<RegisteredKey>, // Authorized keys
}
```

**Size**: ~470 bytes (supports 5 keys)

**PDA Derivation**: `["identity", owner_pubkey]`

### Registered Key

```rust
pub struct RegisteredKey {
    pub pubkey: [u8; 33],     // Compressed secp256r1 key
    pub name: String,         // Device name
    pub added_at: i64,        // Timestamp
}
```

### Vault Account

**Type**: System account (native SOL holder)

**PDA Derivation**: `["vault", identity_pubkey]`

**Purpose**: 
- Holds user's SOL
- Controlled by Identity account
- Can send via CPI with PDA signer

## Security Model

### Key Properties

1. **Non-Custodial**
   - User controls private key
   - Key stored in secure enclave
   - No backend can access keys

2. **Multi-Device**
   - Add up to 5 devices
   - Each device has own key
   - Any device can propose transactions

3. **Multi-Sig**
   - Configurable threshold (1-of-N to N-of-N)
   - High-value transactions require multiple devices
   - Prevents single device compromise

4. **Replay Protection**
   - Nonce incremented with each action
   - Signatures tied to specific nonce
   - Cannot reuse old signatures

5. **Biometric Gating**
   - Every signature requires biometrics
   - Malware cannot extract keys
   - OS-level security

### Attack Vectors & Mitigations

| Attack | Mitigation |
|--------|-----------|
| Device theft | Biometric required, remote wipe possible |
| Malware | Keys in secure enclave, unreachable |
| Phishing | Signature tied to RP ID (domain) |
| Replay | Nonce prevents reuse |
| Man-in-middle | HTTPS + WebAuthn challenge-response |
| Social engineering | Multi-sig for high value |
| Lost device | Multi-device backup |

## Component Responsibilities

### Frontend (`app/`)

**UI Layer**:
- React components for wallet interface
- User input validation
- Transaction building UI
- Error handling and feedback

**Client Libraries**:
- `passkey.ts`: WebAuthn API wrapper
- `keystore.ts`: Solana program client
- `solana.ts`: Blockchain utilities

### Solana Program (`programs/keystore/`)

**State Management**:
- Identity accounts with keys
- Vault PDAs for funds
- Threshold settings

**Instructions**:
- `create_identity`: Initialize wallet
- `add_key`: Add backup device
- `execute`: Process signed actions

**Security**:
- Signature verification via secp256r1 precompile
- Threshold enforcement
- Nonce-based replay protection

## Design Decisions

### Why PDAs for Vaults?

- **Deterministic**: Can derive address without RPC call
- **No Keys**: Program controls via seeds, no private key
- **Secure**: Only program can sign for PDA
- **Simple**: Standard pattern in Solana

### Why secp256r1?

- **Standard**: Used by all passkey implementations
- **Hardware**: Supported by secure enclaves
- **Efficient**: Native verification on Solana
- **Interoperable**: Works across devices and platforms

### Why Client-Side Storage?

- **Credential ID**: Needed to invoke WebAuthn
- **Public Data**: No sensitive information
- **Fast**: No RPC call to get credential
- **Offline**: Can build transaction without network

### Why Threshold Signatures?

- **Flexibility**: Users choose security level
- **Progressive**: Start with 1-of-1, upgrade to 2-of-3
- **Recovery**: Can still access with M-of-N devices
- **Enterprise**: Multi-party approval for company funds

## Performance Characteristics

### Wallet Creation
- **Time**: ~3 seconds
- **Cost**: ~0.002 SOL (account rent)
- **Network**: 1 transaction

### Transaction
- **Time**: ~1-2 seconds
- **Cost**: ~0.000005 SOL (base fee)
- **Network**: 1 transaction (2 instructions)

### Adding Key
- **Time**: ~1 second
- **Cost**: Negligible (account growth)
- **Network**: 1 transaction

## Scalability

### Limits
- **Keys per Identity**: 5 (configurable)
- **Threshold**: 1 to N
- **Nonce**: u64 max (~18 quintillion)

### Optimizations
- **Batching**: Can batch multiple actions
- **Session Keys**: For frequent operations
- **Compression**: Could use sparse keys vector

## Future Enhancements

### Phase 2
- [ ] Social recovery (guardian keys)
- [ ] Session keys (gasless transactions)
- [ ] Transaction batching
- [ ] Hardware wallet support

### Phase 3
- [ ] SPL token support
- [ ] NFT support
- [ ] DeFi integrations
- [ ] Mobile apps

### Phase 4
- [ ] Cross-chain (Ethereum, etc.)
- [ ] Account abstraction
- [ ] Advanced smart contracts
- [ ] DAO governance

## Technology Stack

**Frontend**:
- Next.js 14 (React framework)
- TypeScript (type safety)
- Tailwind CSS (styling)
- @solana/web3.js (blockchain)
- WebAuthn API (biometrics)

**Backend** (On-Chain):
- Anchor 0.30.1 (Solana framework)
- Rust (program language)
- secp256r1 precompile (signature verification)

**Infrastructure**:
- Solana Devnet (testing)
- RPC endpoints (blockchain access)
- IPFS (future: metadata storage)

## Comparison to Alternatives

| Feature | Keystore | Phantom | MetaMask | Hardware Wallet |
|---------|----------|---------|----------|-----------------|
| No seed phrase | ✅ | ❌ | ❌ | ❌ |
| Biometric auth | ✅ | ❌ | ❌ | ❌ |
| Multi-device | ✅ | ❌ | ❌ | ✅ |
| Multi-sig | ✅ | ❌ | ✅* | ✅* |
| No extension | ✅ | ❌ | ❌ | ✅ |
| Works on mobile | ✅ | ✅ | ✅ | ✅ |
| Non-custodial | ✅ | ✅ | ✅ | ✅ |

*Requires additional setup

## Conclusion

Keystore represents a new paradigm in crypto wallets: using device-native biometric authentication with on-chain multi-sig capabilities. By eliminating seed phrases and leveraging secure enclaves, we make Solana accessible to mainstream users while maintaining security and non-custodial principles.

