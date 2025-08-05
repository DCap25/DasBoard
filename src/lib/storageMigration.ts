/**
 * Storage Migration Utility
 * Helps migrate existing unencrypted localStorage data to encrypted storage
 */

import EncryptedStorage from './encryptedStorage';

interface MigrationResult {
  success: boolean;
  migratedKeys: string[];
  errors: string[];
}

class StorageMigration {
  private static readonly SENSITIVE_KEYS = [
    'financeDeals',
    'singleFinanceDeals',
    'singleFinanceTeamMembers',
    'singleFinancePayConfig',
    'singleFinancePayPrivacy',
    'singleFinanceLastResetMonth'
  ];

  /**
   * Migrate all sensitive data to encrypted storage
   */
  static async migrateAllSensitiveData(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migratedKeys: [],
      errors: []
    };

    // Get all localStorage keys
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) allKeys.push(key);
    }

    // Filter for sensitive keys (including user-specific ones)
    const sensitiveKeys = allKeys.filter(key => {
      return this.SENSITIVE_KEYS.some(sensitiveKey => 
        key.includes(sensitiveKey) && !key.startsWith('enc_')
      );
    });

    console.log(`Found ${sensitiveKeys.length} keys to migrate:`, sensitiveKeys);

    // Migrate each key
    for (const key of sensitiveKeys) {
      try {
        await this.migrateKey(key);
        result.migratedKeys.push(key);
      } catch (error) {
        const errorMsg = `Failed to migrate ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
        result.success = false;
      }
    }

    console.log(`Migration complete. Migrated: ${result.migratedKeys.length}, Errors: ${result.errors.length}`);
    return result;
  }

  /**
   * Migrate a single key from unencrypted to encrypted storage
   */
  private static async migrateKey(key: string): Promise<void> {
    const unencryptedData = localStorage.getItem(key);
    
    if (!unencryptedData) return;

    try {
      // Parse the unencrypted data
      const parsedData = JSON.parse(unencryptedData);
      
      // Store it encrypted (this will create enc_${key})
      EncryptedStorage.setItem(key, parsedData);
      
      // Remove the unencrypted version
      localStorage.removeItem(key);
      
      console.log(`Successfully migrated key: ${key}`);
    } catch (error) {
      throw new Error(`Migration failed for ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if migration is needed
   */
  static needsMigration(): boolean {
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) allKeys.push(key);
    }

    // Check for any unencrypted sensitive keys
    return allKeys.some(key => {
      return this.SENSITIVE_KEYS.some(sensitiveKey => 
        key.includes(sensitiveKey) && !key.startsWith('enc_')
      );
    });
  }

  /**
   * Get migration status
   */
  static getMigrationStatus(): {
    needsMigration: boolean;
    unencryptedKeys: string[];
    encryptedKeys: string[];
  } {
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) allKeys.push(key);
    }

    const unencryptedKeys = allKeys.filter(key => {
      return this.SENSITIVE_KEYS.some(sensitiveKey => 
        key.includes(sensitiveKey) && !key.startsWith('enc_')
      );
    });

    const encryptedKeys = allKeys.filter(key => key.startsWith('enc_'));

    return {
      needsMigration: unencryptedKeys.length > 0,
      unencryptedKeys,
      encryptedKeys
    };
  }

  /**
   * Clear all unencrypted sensitive data (use with caution)
   */
  static clearUnencryptedSensitiveData(): number {
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) allKeys.push(key);
    }

    const keysToRemove = allKeys.filter(key => {
      return this.SENSITIVE_KEYS.some(sensitiveKey => 
        key.includes(sensitiveKey) && !key.startsWith('enc_')
      );
    });

    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log(`Cleared ${keysToRemove.length} unencrypted sensitive keys`);
    return keysToRemove.length;
  }
}

export default StorageMigration;