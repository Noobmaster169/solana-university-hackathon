import { Transaction, PublicKey } from "@solana/web3.js";

const RELAYER_URL = process.env.NEXT_PUBLIC_RELAYER_URL || "http://localhost:3001";

export interface RelayResponse {
  signature: string;
  status: string;
}

export class RelayerClient {
  constructor(private baseUrl: string = RELAYER_URL) {}

  /**
   * Relay a transaction through the relayer service
   */
  async relayTransaction(
    transaction: Transaction,
    identity: PublicKey
  ): Promise<string> {
    // Serialize transaction to base64
    const serialized = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
    const base64Tx = Buffer.from(serialized).toString("base64");

    // Send to relayer
    const response = await fetch(`${this.baseUrl}/relay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction: base64Tx,
        identity: identity.toBase58(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to relay transaction");
    }

    const data: RelayResponse = await response.json();
    return data.signature;
  }

  /**
   * Check relayer health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      return data.status === "ok";
    } catch (error) {
      return false;
    }
  }

  /**
   * Get relayer balance
   */
  async getBalance(): Promise<number> {
    const response = await fetch(`${this.baseUrl}/balance`);
    const data = await response.json();
    return data.balance;
  }

  /**
   * Get relayer stats
   */
  async getStats(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/stats`);
    return await response.json();
  }
}

export const relayerClient = new RelayerClient();

