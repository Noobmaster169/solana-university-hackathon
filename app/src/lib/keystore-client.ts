import { Keystore } from "@/types/keystore";
import {
  AccountMeta,
  Connection,
  PublicKey,
  TransactionInstruction,
  Keypair,
  Transaction,
} from "@solana/web3.js";
import { Address, BN } from "@coral-xyz/anchor";
import keystoreIdl from "@/idl/keystore.json";
import { ProgramClient } from "./program-client";

export class KeystoreClient extends ProgramClient<Keystore> {
    constructor(connection: Connection) {
        super(connection, keystoreIdl);
    }

    // Funded Keypair
    private getFundedKeypair(): Keypair {
        const adminKeypair = Keypair.fromSecretKey(
            new Uint8Array(JSON.parse(process.env.ADMIN_WALLET ?? ""))
        );
        return adminKeypair;
    }
    
    // PDAs
    getIdentityPDA(pubkey: Uint8Array) : PublicKey {
        // Derive identity PDA using "identity" seed and the provided public key 
        // (excluding first byte)
        return PublicKey.findProgramAddressSync(
            [
                Buffer.from("identity"), 
                pubkey.slice(1)
            ],
            this.program.programId
        )[0];
    }

    getVaultPDA(identity: PublicKey): PublicKey {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("vault"), identity.toBuffer()],
            this.program.programId
        )[0];
    }

    // Txs
    async createIdentityTx(pubkey: Uint8Array, deviceName: string, payer?: Keypair) {
        // Check if pubkey is 33 bytes
        if (pubkey.length !== 33) {
            throw new Error("Public key must be 33 bytes (secp256r1 compressed format)");
        } 
        try{
            // Get Payer Keypair
            const actualPayer = payer || this.getFundedKeypair();
            console.log("Using payer:", actualPayer.publicKey.toBase58());
            console.log("Public Key to register:", pubkey);
            
            // Get Identity PDA
            const identityPDA = this.getIdentityPDA(pubkey);

            const createIx = await this.program.methods
                .createIdentity(
                    Array.from(pubkey) as unknown as number[],
                    deviceName,
                )
                .accounts({
                    payer: actualPayer.publicKey,
                    identity: identityPDA,
                })
                .instruction();

            const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash();
            const transaction = new Transaction({
                feePayer: actualPayer.publicKey, 
                recentBlockhash: blockhash
            }).add(createIx);
            
            transaction.sign(actualPayer);
            
            // Use sendRawTransaction + polling instead of sendAndConfirmTransaction
            // to avoid WebSocket issues in serverless environments (Vercel)
            const sig = await this.connection.sendRawTransaction(transaction.serialize());
            
            // Poll for confirmation instead of using WebSocket subscription
            await this.confirmTransactionPolling(sig, lastValidBlockHeight);
            
            return sig;
        } catch (error) {
            console.error("Error creating identity:", error);
            throw error;
        }
    }

    // Helper to confirm transaction via polling (serverless-compatible)
    private async confirmTransactionPolling(
        signature: string, 
        lastValidBlockHeight: number,
        maxRetries = 30
    ): Promise<void> {
        for (let i = 0; i < maxRetries; i++) {
            const status = await this.connection.getSignatureStatus(signature);
            
            if (status.value !== null) {
                if (status.value.err) {
                    throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
                }
                if (status.value.confirmationStatus === 'confirmed' || 
                    status.value.confirmationStatus === 'finalized') {
                    return;
                }
            }
            
            // Check if blockhash expired
            const blockHeight = await this.connection.getBlockHeight();
            if (blockHeight > lastValidBlockHeight) {
                throw new Error('Transaction expired: blockhash no longer valid');
            }
            
            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        throw new Error('Transaction confirmation timeout');
    }
}


