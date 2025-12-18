import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';
import { KeystoreClient } from '@/lib/keystore-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pubkey, deviceName } = body;

    if (!pubkey) {
      return NextResponse.json(
        { error: 'pubkey is required' },
        { status: 400 }
      );
    }

    if (!deviceName) {
      return NextResponse.json(
        { error: 'deviceName is required' },
        { status: 400 }
      );
    }

    const rpcUrl = process.env.SOLANA_RPC_URL;
    if (!rpcUrl) {
      return NextResponse.json(
        { error: 'SOLANA_RPC_URL not configured' },
        { status: 500 }
      );
    }

    const adminWallet = process.env.ADMIN_WALLET;
    if (!adminWallet) {
      return NextResponse.json(
        { error: 'ADMIN_WALLET not configured' },
        { status: 500 }
      );
    }

    let publicKey: PublicKey;
    try {
      publicKey = new PublicKey(pubkey);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid public key format' },
        { status: 400 }
      );
    }

    const connection = new Connection(rpcUrl, 'confirmed');
    const keystoreClient = new KeystoreClient(connection);

    const signature = await keystoreClient.createIdentityTx(publicKey, deviceName);

    const identityPDA = keystoreClient.getIdentityPDA(publicKey);
    const vaultPDA = keystoreClient.getVaultPDA(identityPDA);

    return NextResponse.json({
      success: true,
      signature,
      identityPDA: identityPDA.toBase58(),
      vaultPDA: vaultPDA.toBase58(),
      pubkey: publicKey.toBase58(),
      deviceName,
    });
  } catch (error) {
    console.error('Error creating identity:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create identity', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
