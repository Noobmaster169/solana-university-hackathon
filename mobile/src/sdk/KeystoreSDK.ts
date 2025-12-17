import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BiometricManager } from './BiometricManager';
import { SolanaClient, getIdentityPDA, getVaultPDA } from './SolanaClient';
import {
  KeystoreSDKConfig,
  StoredCredential,
  SendTransactionParams,
  IdentityAccount,
} from './types';

const STORAGE_KEY = 'keystore_credential';

/**
 * Main SDK class for Keystore - Biometric Solana Wallet
 * 
 * This SDK provides a simple API for integrating biometric-authenticated
 * Solana wallets into any React Native app.
 */
export class KeystoreSDK {
  private connection: Connection;
  private solanaClient: SolanaClient;
  private relayerUrl?: string;

  constructor(config: KeystoreSDKConfig) {
    this.connection = new Connection(config.rpcUrl, 'confirmed');
    this.solanaClient = new SolanaClient(this.connection);
    this.relayerUrl = config.relayerUrl;
  }

  /**
   * Check if biometric authentication is available
   */
  async isBiometricAvailable(): Promise<boolean> {
    const { available } = await BiometricManager.isBiometricAvailable();
    return available;
  }

  /**
   * Check if a wallet already exists for this device
   */
  async hasWallet(): Promise<boolean> {
    const stored = await this.getStoredCredential();
    return stored !== null;
  }

  /**
   * Create a new wallet with biometric authentication
   * 
   * @param deviceName - Name for this device (e.g., "My Phone")
   * @returns Identity and vault public keys
   */
  async createWallet(deviceName: string): Promise<{
    identity: PublicKey;
    vault: PublicKey;
    transactionSignature: string;
  }> {
    // Check biometric availability
    const { available } = await BiometricManager.isBiometricAvailable();
    if (!available) {
      throw new Error('Biometric authentication not available on this device');
    }

    // Create biometric-protected keypair
    const credential = await BiometricManager.createKeypair(deviceName);

    // Get a funded payer (in production, use relayer)
    const payer = await this.getFundedKeypair();

    // Create identity on-chain
    const { tx, identity, vault } = await this.solanaClient.createIdentity(
      credential.publicKey,
      deviceName,
      payer
    );

    // Store credential metadata
    await this.storeCredential({
      credentialId: Array.from(credential.credentialId),
      publicKey: Array.from(credential.publicKey),
      owner: identity.toBase58(),
      deviceName,
    });

    return {
      identity,
      vault,
      transactionSignature: tx,
    };
  }

  /**
   * Get wallet information
   */
  async getWallet(): Promise<{
    identity: PublicKey;
    vault: PublicKey;
    balance: number;
    deviceName: string;
  } | null> {
    const stored = await this.getStoredCredential();
    if (!stored) return null;

    const identity = new PublicKey(stored.owner);
    const [vault] = getVaultPDA(identity);
    const balance = await this.solanaClient.getBalance(vault);

    return {
      identity,
      vault,
      balance,
      deviceName: stored.deviceName,
    };
  }

  /**
   * Get identity account details (keys, threshold, nonce)
   */
  async getIdentityAccount(): Promise<IdentityAccount | null> {
    const stored = await this.getStoredCredential();
    if (!stored) return null;

    const identity = new PublicKey(stored.owner);
    return await this.solanaClient.getIdentity(identity);
  }

  /**
   * Send SOL with biometric confirmation
   * 
   * @param params - Transaction parameters
   * @returns Transaction signature
   */
  async sendTransaction(params: SendTransactionParams): Promise<string> {
    const stored = await this.getStoredCredential();
    if (!stored) {
      throw new Error('No wallet found. Create a wallet first.');
    }

    const identity = new PublicKey(stored.owner);
    const [vault] = getVaultPDA(identity);
    const lamports = Math.floor(params.amount * 1e9);

    // Get current nonce
    const identityAccount = await this.solanaClient.getIdentity(identity);
    if (!identityAccount) {
      throw new Error('Identity account not found');
    }

    // Build message and sign with biometrics
    const message = this.solanaClient.buildMessage(
      { type: 'send', to: params.to, lamports },
      identityAccount.nonce
    );

    const signature = await BiometricManager.signMessage(
      message,
      `Send ${params.amount} SOL`
    );

    // Get payer (in production, use relayer)
    const payer = await this.getFundedKeypair();

    // Execute transaction
    const txSignature = await this.solanaClient.execute(
      identity,
      vault,
      {
        type: 'send',
        to: params.to,
        lamports,
        pubkey: new Uint8Array(stored.publicKey),
        signatures: [{ keyIndex: 0, signature }],
      },
      payer
    );

    return txSignature;
  }

  /**
   * Add a backup device to the wallet
   * 
   * @param newDevicePubkey - Public key from the new device
   * @param newDeviceName - Name for the new device
   * @returns Transaction signature
   */
  async addDevice(
    newDevicePubkey: Uint8Array,
    newDeviceName: string
  ): Promise<string> {
    const stored = await this.getStoredCredential();
    if (!stored) {
      throw new Error('No wallet found');
    }

    const identity = new PublicKey(stored.owner);
    const payer = await this.getFundedKeypair();

    const txSignature = await this.solanaClient.addKey(
      identity,
      newDevicePubkey,
      newDeviceName,
      payer
    );

    return txSignature;
  }

  /**
   * Delete wallet from this device
   * WARNING: Make sure you have backup devices before doing this!
   */
  async deleteWallet(): Promise<void> {
    await BiometricManager.deleteKeys();
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  // Private helper methods

  private async storeCredential(credential: StoredCredential): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(credential));
  }

  private async getStoredCredential(): Promise<StoredCredential | null> {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  private async getFundedKeypair(): Promise<Keypair> {
    // For demo: generate and airdrop
    // In production: use relayer service
    const keypair = Keypair.generate();

    try {
      const signature = await this.connection.requestAirdrop(
        keypair.publicKey,
        1000000000 // 1 SOL
      );
      await this.connection.confirmTransaction(signature);
    } catch (error) {
      console.error('Airdrop failed:', error);
      // Continue anyway, might have funds from previous airdrops
    }

    return keypair;
  }
}

