import { PublicKey } from '@solana/web3.js';

export interface PasskeyCredential {
  publicKey: Uint8Array;
  credentialId: Uint8Array;
}

export interface StoredCredential {
  credentialId: number[];
  publicKey: number[];
  owner: string;
  deviceName: string;
}

export interface IdentityAccount {
  bump: number;
  vaultBump: number;
  threshold: number;
  nonce: number;
  keys: Array<{
    pubkey: Uint8Array;
    name: string;
    addedAt: number;
  }>;
}

export interface SendTransactionParams {
  to: PublicKey;
  amount: number; // in SOL
}

export interface KeystoreSDKConfig {
  rpcUrl: string;
  relayerUrl?: string;
}

export interface BiometricSignatureResult {
  signature: Uint8Array;
  publicKey: Uint8Array;
}

