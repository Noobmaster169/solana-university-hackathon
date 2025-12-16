use anchor_lang::prelude::*;

#[account]
pub struct Identity {
    pub bump: u8,
    pub vault_bump: u8,
    pub threshold: u8,
    pub nonce: u64,
    pub keys: Vec<RegisteredKey>,
}

impl Identity {
    pub const MAX_KEYS: usize = 5;
    pub const SIZE: usize = 8 + 1 + 1 + 1 + 8 + 4 + (Self::MAX_KEYS * RegisteredKey::SIZE);
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct RegisteredKey {
    pub pubkey: [u8; 33],
    pub name: String,
    pub added_at: i64,
}

impl RegisteredKey {
    pub const SIZE: usize = 33 + 36 + 8; // pubkey + name (4 + 32) + timestamp
}

/// On-chain registry for WebAuthn credential IDs
/// This allows users to recover their wallet from any device
#[account]
pub struct CredentialRegistry {
    pub bump: u8,
    pub identity: Pubkey,
    pub key_index: u8,
    pub credential_id: Vec<u8>,
    pub device_name: String,
    pub registered_at: i64,
}

impl CredentialRegistry {
    pub const SIZE: usize = 8 + 1 + 32 + 1 + 4 + 256 + 4 + 32 + 8; // Max 256 bytes for credential_id
}

