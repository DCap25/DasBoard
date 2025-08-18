/**
 * Secure Key Management System
 * Generates and manages encryption keys dynamically per session
 */

import * as CryptoJS from 'crypto-js';

class KeyManagement {
  private static readonly KEY_STORAGE = 'session_key';
  private static readonly KEY_ROTATION_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly KEY_METADATA = 'key_metadata';

  /**
   * Generate a cryptographically secure key
   */
  private static generateSecureKey(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Derive a key from user-specific data
   */
  private static deriveKeyFromUserData(userId: string, salt: string): string {
    // Use PBKDF2 to derive a key from user ID and salt
    const iterations = 10000;
    const keySize = 256 / 32;

    const derived = CryptoJS.PBKDF2(userId, salt, {
      keySize: keySize,
      iterations: iterations,
      hasher: CryptoJS.algo.SHA256,
    });

    return derived.toString();
  }

  /**
   * Get or generate a session-specific encryption key
   */
  static getSessionKey(userId?: string): string {
    try {
      // Check if we have a valid session key
      const stored = sessionStorage.getItem(this.KEY_STORAGE);
      const metadata = sessionStorage.getItem(this.KEY_METADATA);

      if (stored && metadata) {
        const meta = JSON.parse(metadata);
        const now = Date.now();

        // Check if key needs rotation
        if (now - meta.created < this.KEY_ROTATION_INTERVAL) {
          return stored;
        }
      }

      // Generate new key
      const baseKey = this.generateSecureKey();
      const salt = this.generateSecureKey();

      // If we have a user ID, derive a user-specific key
      let finalKey = baseKey;
      if (userId) {
        finalKey = this.deriveKeyFromUserData(userId + baseKey, salt);
      }

      // Store the key and metadata
      sessionStorage.setItem(this.KEY_STORAGE, finalKey);
      sessionStorage.setItem(
        this.KEY_METADATA,
        JSON.stringify({
          created: Date.now(),
          salt: salt,
          version: '1.0',
        })
      );

      return finalKey;
    } catch (error) {
      console.error('Error generating session key:', error);
      // Fallback to a generated key if session storage fails
      return this.generateSecureKey();
    }
  }

  /**
   * Clear the session key (on logout)
   */
  static clearSessionKey(): void {
    sessionStorage.removeItem(this.KEY_STORAGE);
    sessionStorage.removeItem(this.KEY_METADATA);
  }

  /**
   * Rotate the session key
   */
  static rotateKey(userId?: string): string {
    this.clearSessionKey();
    return this.getSessionKey(userId);
  }

  /**
   * Validate key integrity
   */
  static validateKey(): boolean {
    const stored = sessionStorage.getItem(this.KEY_STORAGE);
    const metadata = sessionStorage.getItem(this.KEY_METADATA);

    if (!stored || !metadata) {
      return false;
    }

    try {
      const meta = JSON.parse(metadata);
      const now = Date.now();

      // Check if key is expired
      if (now - meta.created > this.KEY_ROTATION_INTERVAL) {
        return false;
      }

      // Validate key format
      if (stored.length < 32) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get key age in milliseconds
   */
  static getKeyAge(): number | null {
    const metadata = sessionStorage.getItem(this.KEY_METADATA);

    if (!metadata) {
      return null;
    }

    try {
      const meta = JSON.parse(metadata);
      return Date.now() - meta.created;
    } catch {
      return null;
    }
  }
}

export default KeyManagement;
