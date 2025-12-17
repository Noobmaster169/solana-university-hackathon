import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { sha256 } from '@noble/hashes/sha256';
import { PasskeyCredential, BiometricSignatureResult } from './types';

const rnBiometrics = new ReactNativeBiometrics({
  allowDeviceCredentials: false,
});

export class BiometricManager {
  /**
   * Check if biometric authentication is available on the device
   */
  static async isBiometricAvailable(): Promise<{
    available: boolean;
    biometryType?: 'TouchID' | 'FaceID' | 'Biometrics';
  }> {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      
      let type: 'TouchID' | 'FaceID' | 'Biometrics' | undefined;
      if (biometryType === BiometryTypes.TouchID) {
        type = 'TouchID';
      } else if (biometryType === BiometryTypes.FaceID) {
        type = 'FaceID';
      } else if (biometryType === BiometryTypes.Biometrics) {
        type = 'Biometrics';
      }
      
      return { available, biometryType: type };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return { available: false };
    }
  }

  /**
   * Create a new biometric-protected keypair
   * This generates an secp256r1 keypair in Android Keystore
   */
  static async createKeypair(deviceName: string): Promise<PasskeyCredential> {
    try {
      // Create keys in Android Keystore (hardware-backed)
      const { publicKey } = await rnBiometrics.createKeys();
      
      if (!publicKey) {
        throw new Error('Failed to create biometric keys');
      }

      // The publicKey from react-native-biometrics is base64-encoded
      // We need to convert it to the compressed secp256r1 format
      const publicKeyBytes = this.base64ToUint8Array(publicKey);
      const compressedPublicKey = this.compressPublicKey(publicKeyBytes);
      
      // Generate a credential ID (unique identifier for this keypair)
      const credentialId = this.generateCredentialId(deviceName);
      
      return {
        publicKey: compressedPublicKey,
        credentialId,
      };
    } catch (error) {
      console.error('Error creating biometric keypair:', error);
      throw new Error('Failed to create biometric keypair');
    }
  }

  /**
   * Sign a message using biometric authentication
   */
  static async signMessage(
    message: Uint8Array,
    promptMessage: string = 'Sign transaction'
  ): Promise<Uint8Array> {
    try {
      // Convert message to base64 for the biometric API
      const messageBase64 = this.uint8ArrayToBase64(message);
      
      // Prompt for biometric authentication and sign
      const { success, signature } = await rnBiometrics.createSignature({
        promptMessage,
        payload: messageBase64,
        cancelButtonText: 'Cancel',
      });

      if (!success || !signature) {
        throw new Error('Biometric authentication failed or was cancelled');
      }

      // Convert signature from base64 to Uint8Array
      const signatureBytes = this.base64ToUint8Array(signature);
      
      // Convert DER signature to raw format (r || s, 64 bytes)
      const rawSignature = this.derToRaw(signatureBytes);
      
      return rawSignature;
    } catch (error) {
      console.error('Error signing with biometrics:', error);
      throw new Error('Failed to sign message with biometrics');
    }
  }

  /**
   * Delete the biometric keys
   */
  static async deleteKeys(): Promise<boolean> {
    try {
      const { keysDeleted } = await rnBiometrics.deleteKeys();
      return keysDeleted;
    } catch (error) {
      console.error('Error deleting biometric keys:', error);
      return false;
    }
  }

  // Helper methods

  private static base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private static uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Compress an uncompressed secp256r1 public key (65 bytes) to compressed format (33 bytes)
   */
  private static compressPublicKey(uncompressed: Uint8Array): Uint8Array {
    // If already compressed (33 bytes), return as is
    if (uncompressed.length === 33) {
      return uncompressed;
    }

    // Uncompressed format: 0x04 || x (32 bytes) || y (32 bytes)
    if (uncompressed.length !== 65 || uncompressed[0] !== 0x04) {
      throw new Error('Invalid uncompressed public key format');
    }

    const x = uncompressed.slice(1, 33);
    const y = uncompressed.slice(33, 65);
    
    // Compressed format: prefix || x
    // prefix is 0x02 if y is even, 0x03 if y is odd
    const prefix = (y[31] & 1) === 0 ? 0x02 : 0x03;
    
    const compressed = new Uint8Array(33);
    compressed[0] = prefix;
    compressed.set(x, 1);
    
    return compressed;
  }

  /**
   * Convert DER-encoded signature to raw format (r || s, 64 bytes)
   */
  private static derToRaw(der: Uint8Array): Uint8Array {
    // DER format: 0x30 [total-length] 0x02 [r-length] [r] 0x02 [s-length] [s]
    let offset = 2; // Skip 0x30 and total length
    
    // Read r
    const rLen = der[offset + 1];
    const r = der.slice(offset + 2, offset + 2 + rLen);
    offset += 2 + rLen;
    
    // Read s
    const sLen = der[offset + 1];
    const s = der.slice(offset + 2, offset + 2 + sLen);
    
    // Pad or trim r and s to 32 bytes each
    const raw = new Uint8Array(64);
    
    if (r.length > 32) {
      raw.set(r.slice(-32), 0);
    } else {
      raw.set(r, 32 - r.length);
    }
    
    if (s.length > 32) {
      raw.set(s.slice(-32), 32);
    } else {
      raw.set(s, 64 - s.length);
    }
    
    return raw;
  }

  /**
   * Generate a unique credential ID for this device
   */
  private static generateCredentialId(deviceName: string): Uint8Array {
    const timestamp = Date.now().toString();
    const combined = `${deviceName}-${timestamp}`;
    const hash = sha256(combined);
    return hash;
  }
}

