import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

export function getConnection(cluster: "devnet" | "mainnet-beta" | "testnet" = "devnet"): Connection {
  return new Connection(clusterApiUrl(cluster), "confirmed");
}

export function formatAddress(address: string, length: number = 4): string {
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

export function formatSOL(lamports: number): string {
  return (lamports / 1e9).toFixed(4);
}

export function lamportsToSOL(lamports: number): number {
  return lamports / 1e9;
}

export function solToLamports(sol: number): number {
  return Math.floor(sol * 1e9);
}

