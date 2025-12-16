import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Connection, Keypair, Transaction, PublicKey } from '@solana/web3.js';
import { RateLimiter } from './rateLimit';
import { RelayerService } from './relayer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const connection = new Connection(
  process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

// Load relayer keypair from environment
const relayerKeypair = Keypair.fromSecretKey(
  Buffer.from(JSON.parse(process.env.RELAYER_PRIVATE_KEY || '[]'))
);

const rateLimiter = new RateLimiter();
const relayerService = new RelayerService(connection, relayerKeypair);

console.log(`🚀 Relayer initialized with pubkey: ${relayerKeypair.publicKey.toBase58()}`);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    relayer: relayerKeypair.publicKey.toBase58(),
    network: process.env.SOLANA_NETWORK || 'devnet',
  });
});

// Get relayer balance
app.get('/balance', async (req: Request, res: Response) => {
  try {
    const balance = await connection.getBalance(relayerKeypair.publicKey);
    res.json({
      balance: balance / 1e9,
      lamports: balance,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Relay a transaction
app.post('/relay', async (req: Request, res: Response) => {
  try {
    const { transaction, identity } = req.body;

    if (!transaction || !identity) {
      return res.status(400).json({ error: 'Missing transaction or identity' });
    }

    // Rate limiting
    const identityPubkey = new PublicKey(identity);
    const allowed = await rateLimiter.checkLimit(identityPubkey.toBase58());
    
    if (!allowed) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    // Deserialize transaction
    const tx = Transaction.from(Buffer.from(transaction, 'base64'));

    // Relay the transaction
    const signature = await relayerService.relayTransaction(tx, identityPubkey);

    // Record usage
    await rateLimiter.recordUsage(identityPubkey.toBase58());

    res.json({
      signature,
      status: 'success',
    });
  } catch (error: any) {
    console.error('Relay error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get relayer stats
app.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await relayerService.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Relayer service running on port ${PORT}`);
  console.log(`📡 Network: ${process.env.SOLANA_NETWORK || 'devnet'}`);
  console.log(`💰 Relayer: ${relayerKeypair.publicKey.toBase58()}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down relayer...');
  await rateLimiter.close();
  process.exit(0);
});

