import { Keystore } from "@/types/keystore";
import {
  AccountMeta,
  Connection,
  PublicKey,
  TransactionInstruction,
  Keypair,
  Transaction,
  sendAndConfirmTransaction,
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

            const blockhash = (await this.connection.getLatestBlockhash()).blockhash;
            const transaction = new Transaction({feePayer: actualPayer.publicKey, recentBlockhash: blockhash})
                .add(createIx);
            const sig = await sendAndConfirmTransaction(this.connection, transaction, [actualPayer]);
            return sig;
        } catch (error) {
            console.error("Error creating identity:", error);
            throw error;
        }
    }
}


