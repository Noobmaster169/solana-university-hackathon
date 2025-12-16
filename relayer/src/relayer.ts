import { Connection, Keypair, Transaction, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js';

export class RelayerService {
  private txCount = 0;
  private totalFees = 0;
  private startTime = Date.now();

  constructor(
    private connection: Connection,
    private relayerKeypair: Keypair
  ) {}

  /**
   * Relay a transaction by adding relayer as fee payer and signing
   */
  async relayTransaction(
    transaction: Transaction,
    identity: PublicKey
  ): Promise<string> {
    // Validate transaction
    this.validateTransaction(transaction);

    // Set fee payer to relayer
    transaction.feePayer = this.relayerKeypair.publicKey;

    // Get recent blockhash
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;

    // Sign with relayer
    transaction.sign(this.relayerKeypair);

    // Send transaction
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.relayerKeypair],
      {
        commitment: 'confirmed',
        skipPreflight: false,
      }
    );

    // Update stats
    this.txCount++;
    
    // Estimate fee (5000 lamports base + compute)
    this.totalFees += 5000;

    console.log(`✅ Relayed transaction for ${identity.toBase58()}: ${signature}`);

    return signature;
  }

  /**
   * Validate transaction before relaying
   */
  private validateTransaction(transaction: Transaction): void {
    // Check transaction has instructions
    if (transaction.instructions.length === 0) {
      throw new Error('Transaction has no instructions');
    }

    // Check transaction size (max 1232 bytes)
    const serialized = transaction.serialize({ requireAllSignatures: false });
    if (serialized.length > 1232) {
      throw new Error('Transaction too large');
    }

    // Additional validation can be added here:
    // - Check program IDs are whitelisted
    // - Check accounts are valid
    // - Check instruction data format
  }

  /**
   * Get relayer statistics
   */
  async getStats() {
    const balance = await this.connection.getBalance(this.relayerKeypair.publicKey);
    const uptime = Date.now() - this.startTime;

    return {
      relayer: this.relayerKeypair.publicKey.toBase58(),
      balance: balance / 1e9,
      lamports: balance,
      transactionsRelayed: this.txCount,
      totalFeesSpent: this.totalFees / 1e9,
      uptimeMs: uptime,
      uptimeHours: uptime / (1000 * 60 * 60),
    };
  }

  /**
   * Check if relayer has sufficient balance
   */
  async hassufficientBalance(minBalance: number = 0.1): Promise<boolean> {
    const balance = await this.connection.getBalance(this.relayerKeypair.publicKey);
    return balance >= minBalance * 1e9;
  }
}

