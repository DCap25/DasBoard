/**
 * Encrypted localStorage utility
 * Provides secure storage for sensitive data using AES encryption
 */

import * as CryptoJS from 'crypto-js';
import KeyManagement from './keyManagement';

class EncryptedStorage {
  // Dynamic key management - no longer hardcoded

  /**
   * Get the current user ID from auth context
   */
  private static getCurrentUserId(): string | undefined {
    try {
      // First try to get from window auth context (if available)
      if (typeof window !== 'undefined' && (window as any).__authUser) {
        const user = (window as any).__authUser;
        // Try various user ID fields
        if (user?.id) return user.id;
        if (user?.user?.id) return user.user.id;
      }

      // Try modern Supabase token format (sb-*-auth-token)
      const tokenKey = Object.keys(localStorage).find(
        k => k.startsWith('sb-') && k.endsWith('-auth-token')
      );

      if (tokenKey) {
        const tokenData = localStorage.getItem(tokenKey);
        if (tokenData) {
          try {
            const parsed = JSON.parse(tokenData);
            const userId = parsed?.currentSession?.user?.id || parsed?.user?.id;
            if (userId) {
              console.log('[EncryptedStorage] Found user ID from token:', userId);
              return userId;
            }
          } catch (e) {
            console.error('[EncryptedStorage] Error parsing token data:', e);
          }
        }
      }

      // Fallback: try legacy format
      const authData = localStorage.getItem('supabase.auth.token');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          return parsed?.currentSession?.user?.id;
        } catch {
          // Ignore parsing errors
        }
      }

      console.warn('[EncryptedStorage] Could not determine user ID');
    } catch (error) {
      console.error('[EncryptedStorage] Error in getCurrentUserId:', error);
    }

    return undefined;
  }

  /**
   * Encrypt data before storing
   */
  private static encrypt(data: string): string {
    try {
      const userId = this.getCurrentUserId();
      const key = KeyManagement.getSessionKey(userId);
      return CryptoJS.AES.encrypt(data, key).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data after retrieving
   */
  private static decrypt(encryptedData: string): string {
    try {
      const userId = this.getCurrentUserId();
      const key = KeyManagement.getSessionKey(userId);
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);

      if (!decrypted) {
        throw new Error('Failed to decrypt data - invalid key or corrupted data');
      }

      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Store encrypted data in localStorage
   */
  static setItem(key: string, value: any): void {
    try {
      const jsonString = JSON.stringify(value);
      const encrypted = this.encrypt(jsonString);
      localStorage.setItem(`enc_${key}`, encrypted);
    } catch (error) {
      console.error('Error storing encrypted data:', error);
      // Fallback to unencrypted storage in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Falling back to unencrypted storage');
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        throw error;
      }
    }
  }

  /**
   * Retrieve and decrypt data from localStorage
   */
  static getItem<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      // Try encrypted version first
      const encryptedData = localStorage.getItem(`enc_${key}`);

      if (encryptedData) {
        const decrypted = this.decrypt(encryptedData);
        return JSON.parse(decrypted) as T;
      }

      // Fallback to unencrypted version (for migration)
      const unencryptedData = localStorage.getItem(key);
      if (unencryptedData) {
        const parsed = JSON.parse(unencryptedData) as T;

        // Migrate to encrypted storage
        this.setItem(key, parsed);
        localStorage.removeItem(key); // Remove unencrypted version

        return parsed;
      }

      return defaultValue;
    } catch (error) {
      console.error('Error retrieving encrypted data:', error);
      return defaultValue;
    }
  }

  /**
   * Remove encrypted data from localStorage
   */
  static removeItem(key: string): void {
    localStorage.removeItem(`enc_${key}`);
    localStorage.removeItem(key); // Remove unencrypted version if exists
  }

  /**
   * Check if encrypted key exists
   */
  static hasItem(key: string): boolean {
    return localStorage.getItem(`enc_${key}`) !== null || localStorage.getItem(key) !== null;
  }

  /**
   * Clear all encrypted data (for debugging/testing)
   */
  static clearAll(): void {
    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('enc_')) {
        keys.push(key);
      }
    }

    keys.forEach(key => localStorage.removeItem(key));
    console.log(`Cleared ${keys.length} encrypted localStorage keys`);
  }

  /**
   * Get all encrypted keys (for debugging)
   */
  static getEncryptedKeys(): string[] {
    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('enc_')) {
        keys.push(key.substring(4)); // Remove 'enc_' prefix
      }
    }

    return keys;
  }
}

export default EncryptedStorage;
