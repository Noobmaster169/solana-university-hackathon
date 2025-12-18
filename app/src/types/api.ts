export interface CreateIdentityResponse {
  success: boolean;
  signature: string;
  identityPDA: string;
  vaultPDA: string;
  pubkey: string;
  deviceName: string;
}

export interface CreateIdentityRequest {
  pubkey: number[]; // 33-byte secp256r1 compressed public key
  deviceName: string;
}
