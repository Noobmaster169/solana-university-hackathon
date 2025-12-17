import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Keypair,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} from '@solana/web3.js';
import { sha256 } from '@noble/hashes/sha256';
import { IdentityAccount } from './types';

export const PROGRAM_ID = new PublicKey('4DS5K64SuWK6PmN1puZVtPouLWCqQDA3aE58MPPuDXu2');
export const SECP256R1_PROGRAM_ID = new PublicKey('Secp256r1SigVerify1111111111111111111111111');

/**
 * Compute Anchor instruction discriminator
 */
function getDiscriminator(instructionName: string): Buffer {
  const hash = sha256(`global:${instructionName}`);
  return Buffer.from(hash.slice(0, 8));
}

const DISCRIMINATORS = {
  createIdentity: getDiscriminator('create_identity'),
  addKey: getDiscriminator('add_key'),
  execute: getDiscriminator('execute'),
  registerCredential: getDiscriminator('register_credential'),
};

/**
 * Build secp256r1 verification instruction
 */
function buildSecp256r1Instruction(
  pubkey: Uint8Array,
  message: Uint8Array,
  signature: Uint8Array
): TransactionInstruction {
  const messageHash = sha256(message);
  
  const headerSize = 12;
  const sigOffset = headerSize;
  const pkOffset = sigOffset + 64;
  const msgOffset = pkOffset + 33;
  const totalSize = msgOffset + messageHash.length;
  
  const data = new Uint8Array(totalSize);
  const view = new DataView(data.buffer);
  
  // Header
  data[0] = 1; // num_signatures
  view.setUint16(1, sigOffset, true);
  data[3] = 0xff;
  view.setUint16(4, pkOffset, true);
  data[6] = 0xff;
  view.setUint16(7, msgOffset, true);
  view.setUint16(9, messageHash.length, true);
  data[11] = 0xff;
  
  // Data
  data.set(signature, sigOffset);
  data.set(pubkey, pkOffset);
  data.set(messageHash, msgOffset);
  
  return new TransactionInstruction({
    keys: [],
    programId: SECP256R1_PROGRAM_ID,
    data: Buffer.from(data),
  });
}

export function getIdentityPDA(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('identity'), owner.toBuffer()],
    PROGRAM_ID
  );
}

export function getVaultPDA(identity: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), identity.toBuffer()],
    PROGRAM_ID
  );
}

export class SolanaClient {
  constructor(private connection: Connection) {}

  /**
   * Build message for signing (action + nonce)
   */
  buildMessage(
    action: { type: 'send'; to: PublicKey; lamports: number } | { type: 'setThreshold'; threshold: number },
    nonce: number
  ): Uint8Array {
    const data: number[] = [];
    
    if (action.type === 'send') {
      data.push(0); // Send variant
      data.push(...action.to.toBytes());
      const lamportBytes = new ArrayBuffer(8);
      new DataView(lamportBytes).setBigUint64(0, BigInt(action.lamports), true);
      data.push(...new Uint8Array(lamportBytes));
    } else {
      data.push(1); // SetThreshold variant
      data.push(action.threshold);
    }
    
    // Add nonce
    const nonceBytes = new ArrayBuffer(8);
    new DataView(nonceBytes).setBigUint64(0, BigInt(nonce), true);
    data.push(...new Uint8Array(nonceBytes));
    
    return new Uint8Array(data);
  }

  /**
   * Create identity account on-chain
   */
  async createIdentity(
    pubkey: Uint8Array,
    deviceName: string,
    payer: Keypair
  ): Promise<{ tx: string; identity: PublicKey; vault: PublicKey }> {
    const [identity] = getIdentityPDA(payer.publicKey);
    const [vault] = getVaultPDA(identity);
    
    // Encode device name
    const nameEncoded = new TextEncoder().encode(deviceName);
    const nameBuffer = new Uint8Array(4 + nameEncoded.length);
    new DataView(nameBuffer.buffer).setUint32(0, nameEncoded.length, true);
    nameBuffer.set(nameEncoded, 4);
    
    const data = Buffer.concat([
      DISCRIMINATORS.createIdentity,
      Buffer.from(pubkey),
      nameBuffer,
    ]);
    
    const ix = new TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: identity, isSigner: false, isWritable: true },
        { pubkey: vault, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data,
    });
    
    const tx = new Transaction().add(ix);
    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = payer.publicKey;
    tx.sign(payer);
    
    const signature = await this.connection.sendTransaction(tx, [payer]);
    await this.connection.confirmTransaction(signature);
    
    return { tx: signature, identity, vault };
  }

  /**
   * Add a new key to existing identity
   */
  async addKey(
    identity: PublicKey,
    newPubkey: Uint8Array,
    deviceName: string,
    payer: Keypair
  ): Promise<string> {
    const nameEncoded = new TextEncoder().encode(deviceName);
    const nameBuffer = new Uint8Array(4 + nameEncoded.length);
    new DataView(nameBuffer.buffer).setUint32(0, nameEncoded.length, true);
    nameBuffer.set(nameEncoded, 4);
    
    const data = Buffer.concat([
      DISCRIMINATORS.addKey,
      Buffer.from(newPubkey),
      nameBuffer,
    ]);
    
    const ix = new TransactionInstruction({
      keys: [
        { pubkey: payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: identity, isSigner: false, isWritable: true },
      ],
      programId: PROGRAM_ID,
      data,
    });
    
    const tx = new Transaction().add(ix);
    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = payer.publicKey;
    tx.sign(payer);
    
    const signature = await this.connection.sendTransaction(tx, [payer]);
    await this.connection.confirmTransaction(signature);
    
    return signature;
  }

  /**
   * Execute a transaction (send SOL or set threshold)
   */
  async execute(
    identity: PublicKey,
    vault: PublicKey,
    params: {
      type: 'send';
      to: PublicKey;
      lamports: number;
      pubkey: Uint8Array;
      signatures: { keyIndex: number; signature: Uint8Array }[];
    },
    payer: Keypair
  ): Promise<string> {
    // Fetch current nonce
    const identityAccount = await this.getIdentity(identity);
    if (!identityAccount) {
      throw new Error('Identity account not found');
    }
    
    // Build message
    const message = this.buildMessage(
      { type: 'send', to: params.to, lamports: params.lamports },
      identityAccount.nonce
    );
    
    // Build secp256r1 verify instructions
    const verifyInstructions: TransactionInstruction[] = [];
    for (const sig of params.signatures) {
      const verifyIx = buildSecp256r1Instruction(
        params.pubkey,
        message,
        sig.signature
      );
      verifyInstructions.push(verifyIx);
    }
    
    // Encode action
    const actionData = new Uint8Array(1 + 32 + 8);
    actionData[0] = 0; // Send variant
    actionData.set(params.to.toBytes(), 1);
    new DataView(actionData.buffer).setBigUint64(33, BigInt(params.lamports), true);
    
    // Encode signatures
    const sigsData = new Uint8Array(4 + params.signatures.length * 66);
    new DataView(sigsData.buffer).setUint32(0, params.signatures.length, true);
    let offset = 4;
    for (const sig of params.signatures) {
      sigsData[offset++] = sig.keyIndex;
      sigsData.set(sig.signature, offset);
      offset += 64;
      sigsData[offset++] = 0; // recovery_id
    }
    
    const executeData = Buffer.concat([
      DISCRIMINATORS.execute,
      Buffer.from(actionData),
      Buffer.from(sigsData),
    ]);
    
    const executeIx = new TransactionInstruction({
      keys: [
        { pubkey: identity, isSigner: false, isWritable: true },
        { pubkey: vault, isSigner: false, isWritable: true },
        { pubkey: params.to, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_INSTRUCTIONS_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: PROGRAM_ID,
      data: executeData,
    });
    
    // Build transaction with verify instructions first
    const tx = new Transaction();
    for (const verifyIx of verifyInstructions) {
      tx.add(verifyIx);
    }
    tx.add(executeIx);
    
    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = payer.publicKey;
    tx.sign(payer);
    
    const signature = await this.connection.sendTransaction(tx, [payer]);
    await this.connection.confirmTransaction(signature);
    
    return signature;
  }

  /**
   * Get identity account data
   */
  async getIdentity(identityPDA: PublicKey): Promise<IdentityAccount | null> {
    try {
      const account = await this.connection.getAccountInfo(identityPDA);
      if (!account) return null;
      
      const data = account.data;
      let offset = 8; // Skip discriminator
      
      const bump = data[offset++];
      const vaultBump = data[offset++];
      const threshold = data[offset++];
      
      const nonce = Number(new DataView(data.buffer, data.byteOffset + offset).getBigUint64(0, true));
      offset += 8;
      
      const keysLen = new DataView(data.buffer, data.byteOffset + offset).getUint32(0, true);
      offset += 4;
      
      const keys = [];
      for (let i = 0; i < keysLen; i++) {
        const pubkey = data.slice(offset, offset + 33);
        offset += 33;
        
        const nameLen = new DataView(data.buffer, data.byteOffset + offset).getUint32(0, true);
        offset += 4;
        const nameBytes = data.slice(offset, offset + nameLen);
        const name = new TextDecoder().decode(nameBytes);
        offset += nameLen;
        
        const addedAt = Number(new DataView(data.buffer, data.byteOffset + offset).getBigInt64(0, true));
        offset += 8;
        
        keys.push({ pubkey, name, addedAt });
      }
      
      return { bump, vaultBump, threshold, nonce, keys };
    } catch (error) {
      console.error('Failed to fetch identity:', error);
      return null;
    }
  }

  /**
   * Get vault balance
   */
  async getBalance(vaultPDA: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(vaultPDA);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      return 0;
    }
  }
}

