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
    getIdentityPDA(owner: Address) : PublicKey {
        return PublicKey.findProgramAddressSync(
            [Buffer.from("identity"), new PublicKey(owner).toBuffer()],
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
    async createIdentityTx(pubkey: PublicKey, deviceName: string, payer?: Keypair) {
        try{
            // For hackathon demo: use hardcoded funded keypair or request one
            // In production: use relayer service
            const actualPayer = payer || this.getFundedKeypair();
            console.log("Using payer:", actualPayer.publicKey.toBase58());
            console.log("Public Key to register:", pubkey.toBase58());

            // Program expects 33-byte array (compressed pubkey format)
            const pubkeyBytes = new Uint8Array(33);
            pubkeyBytes.set(pubkey.toBytes(), 0);

            const createIx = await this.program.methods
                .createIdentity(
                    Array.from(pubkeyBytes) as unknown as number[],
                    deviceName,
                )
                .accounts({
                    payer: actualPayer.publicKey,
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


