import { PublicKey } from "@solana/web3.js";
import { CreateIdentityResponse, CreateIdentityRequest } from "@/types/api";

export interface ApiError {
  error: string;
  details?: string;
}

/**
 * Create a new identity on-chain via the API
 * 
 * @param pubkey - The secp256r1 public key as Uint8Array (33 bytes)
 * @param deviceName - Human-readable device name
 * @returns The created identity details including PDAs and transaction signature
 */
export async function createIdentity(
  pubkey: Uint8Array,
  deviceName: string
): Promise<CreateIdentityResponse> {
  // Validate pubkey length
  if (pubkey.length !== 33) {
    throw new Error("Public key must be 33 bytes (secp256r1 compressed format)");
  }

  const response = await fetch("/api/keystore/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      pubkey: Array.from(pubkey),
      deviceName,
    } as CreateIdentityRequest),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = data as ApiError;
    throw new Error(error.details || error.error || "Failed to create identity");
  }

  return data as CreateIdentityResponse;
}

/**
 * Helper to get PublicKey objects from the response
 * Note: response.pubkey is a base64-encoded secp256r1 public key, not a Solana PublicKey
 */
export function parseCreateIdentityResponse(response: CreateIdentityResponse) {
  return {
    ...response,
    identity: new PublicKey(response.identityPDA),
    vault: new PublicKey(response.vaultPDA),
    publicKeyBytes: Buffer.from(response.pubkey, 'base64'),
  };
}