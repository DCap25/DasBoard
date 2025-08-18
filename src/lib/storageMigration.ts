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
    'singleFinanceLastResetMonth',
  ];

  /**
   * Migrate all sensitive data to encrypted storage
   */
  static async migrateAllSensitiveData(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: true,
      migratedKeys: [],
      errors: [],
    };

    // Get all localStorage keys
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) allKeys.push(key);
    }

    // Filter for sensitive keys (including user-specific ones)
    const sensitiveKeys = allKeys.filter(key => {
      return this.SENSITIVE_KEYS.some(
        sensitiveKey => key.includes(sensitiveKey) && !key.startsWith('enc_')
      );
    });

    console.log(`Found ${sensitiveKeys.length} keys to migrate:`, sensitiveKeys);

    // Migrate each key
    for (const key of sensitiveKeys) {
      try {
        await this.migrateKey(key);
        result.migratedKeys.push(key);
        console.log(`✓ Migrated: ${key}`);
      } catch (error) {
        const errorMsg = `Failed to migrate ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.error(`✗ ${errorMsg}`);

        // Don't mark the entire migration as failed for individual key failures
        // This allows the migration to continue with other keys
      }
    }

    // Only mark migration as failed if ALL keys failed
    if (result.migratedKeys.length === 0 && sensitiveKeys.length > 0) {
      result.success = false;
    }

    console.log(
      `Migration complete. Migrated: ${result.migratedKeys.length}, Errors: ${result.errors.length}`
    );
    return result;
  }

  /**
   * Migrate a single key from unencrypted to encrypted storage
   */
  private static async migrateKey(key: string): Promise<void> {
    const unencryptedData = localStorage.getItem(key);

    if (!unencryptedData) return;

    try {
      // Security: Validate and sanitize data before parsing
      const sanitizedData = this.sanitizeStorageData(unencryptedData);
      if (!sanitizedData) {
        console.warn(`Skipping migration for ${key}: data could not be sanitized`);
        localStorage.removeItem(key); // Remove corrupted data
        return;
      }

      // Parse the sanitized data
      const parsedData = this.parseWithFallback(sanitizedData);
      if (parsedData === null) {
        console.warn(`Skipping migration for ${key}: data could not be parsed`);
        localStorage.removeItem(key); // Remove unparseable data
        return;
      }

      // Validate the parsed data structure
      if (!this.isValidMigrationData(parsedData)) {
        console.warn(`Skipping migration for ${key}: invalid data structure`);
        localStorage.removeItem(key); // Remove invalid data
        return;
      }

      // Store it encrypted (this will create enc_${key})
      await EncryptedStorage.setItem(key, parsedData);

      // Remove the unencrypted version
      localStorage.removeItem(key);

      console.log(`Successfully migrated key: ${key}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Migration failed for ${key}: ${errorMsg}`);

      // Don't throw - continue with other keys
      // Instead, mark this key for cleanup
      try {
        localStorage.removeItem(key); // Remove problematic data
        console.log(`Removed corrupted data for key: ${key}`);
      } catch (cleanupError) {
        console.error(`Failed to cleanup corrupted key ${key}:`, cleanupError);
      }
    }
  }

  /**
   * Sanitize storage data to prevent injection and fix common JSON issues
   */
  private static sanitizeStorageData(data: string): string | null {
    if (!data || typeof data !== 'string') {
      return null;
    }

    // Security: Check for potential injection patterns
    const dangerousPatterns = [
      '<script',
      'javascript:',
      'data:text/html',
      'vbscript:',
      'on[a-z]+\\s*=',
      '\\.constructor',
      '__proto__',
      'eval\\s*\\(',
    ];

    const lowerData = data.toLowerCase();
    for (const pattern of dangerousPatterns) {
      if (new RegExp(pattern, 'i').test(lowerData)) {
        console.warn('Detected potentially dangerous pattern in storage data');
        return null;
      }
    }

    // Fix common JSON formatting issues
    let sanitized = data.trim();

    // Remove BOM if present
    if (sanitized.charCodeAt(0) === 0xfeff) {
      sanitized = sanitized.slice(1);
    }

    // Remove null characters
    sanitized = sanitized.replace(/\0/g, '');

    // Fix escaped quotes issues
    sanitized = sanitized.replace(/\\"/g, '"');

    // Remove control characters except newlines and tabs
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    return sanitized;
  }

  /**
   * Parse JSON with multiple fallback strategies
   */
  private static parseWithFallback(data: string): unknown {
    // Strategy 1: Direct JSON.parse
    try {
      return JSON.parse(data);
    } catch (error) {
      console.debug('Direct JSON parse failed, trying fallback strategies');
    }

    // Strategy 2: Try parsing as a simple string value
    if (data.startsWith('"') && data.endsWith('"')) {
      try {
        return JSON.parse(data);
      } catch (error) {
        // If it looks like a quoted string but fails, return the unquoted content
        return data.slice(1, -1);
      }
    }

    // Strategy 3: Check if it's a plain string (no quotes)
    if (!data.startsWith('{') && !data.startsWith('[') && !data.startsWith('"')) {
      // Treat as a plain string value
      return data;
    }

    // Strategy 4: Try to fix common JSON issues
    try {
      let fixed = data;

      // Fix trailing commas
      fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

      // Fix single quotes
      fixed = fixed.replace(/'/g, '"');

      // Try parsing the fixed version
      return JSON.parse(fixed);
    } catch (error) {
      console.debug('JSON repair attempts failed');
    }

    // Strategy 5: Try to extract just the data part if there's extra content
    try {
      const jsonMatch = data.match(/[\{\[].*[\}\]]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.debug('JSON extraction failed');
    }

    console.warn('All JSON parsing strategies failed for data:', data.substring(0, 50) + '...');
    return null;
  }

  /**
   * Validate that the parsed data is safe and expected for migration
   */
  private static isValidMigrationData(data: unknown): boolean {
    if (data === null || data === undefined) {
      return false;
    }

    // Allow primitive values
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
      return true;
    }

    // Allow arrays and objects, but validate structure
    if (typeof data === 'object') {
      try {
        // Security: Ensure we can stringify it (prevents circular references)
        JSON.stringify(data);

        // Check for suspicious properties
        if (Array.isArray(data)) {
          return data.every(item => this.isValidMigrationData(item));
        } else {
          const obj = data as Record<string, unknown>;
          const suspiciousKeys = ['__proto__', 'constructor', 'prototype'];

          for (const key of Object.keys(obj)) {
            if (suspiciousKeys.includes(key.toLowerCase())) {
              return false;
            }
          }

          return Object.values(obj).every(value => this.isValidMigrationData(value));
        }
      } catch (error) {
        return false;
      }
    }

    return false;
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
      return this.SENSITIVE_KEYS.some(
        sensitiveKey => key.includes(sensitiveKey) && !key.startsWith('enc_')
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
      return this.SENSITIVE_KEYS.some(
        sensitiveKey => key.includes(sensitiveKey) && !key.startsWith('enc_')
      );
    });

    const encryptedKeys = allKeys.filter(key => key.startsWith('enc_'));

    return {
      needsMigration: unencryptedKeys.length > 0,
      unencryptedKeys,
      encryptedKeys,
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
      return this.SENSITIVE_KEYS.some(
        sensitiveKey => key.includes(sensitiveKey) && !key.startsWith('enc_')
      );
    });

    keysToRemove.forEach(key => localStorage.removeItem(key));

    console.log(`Cleared ${keysToRemove.length} unencrypted sensitive keys`);
    return keysToRemove.length;
  }

  /**
   * Debug utility to inspect problematic storage data
   */
  static debugStorageData(key?: string): void {
    if (typeof window === 'undefined') {
      console.log('No window object available');
      return;
    }

    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey) allKeys.push(storageKey);
    }

    const keysToInspect = key
      ? [key]
      : allKeys.filter(k => this.SENSITIVE_KEYS.some(sensitiveKey => k.includes(sensitiveKey)));

    console.log(`Inspecting ${keysToInspect.length} storage keys:`, keysToInspect);

    keysToInspect.forEach(storageKey => {
      const rawData = localStorage.getItem(storageKey);
      if (!rawData) {
        console.log(`${storageKey}: [EMPTY]`);
        return;
      }

      console.group(`${storageKey}:`);
      console.log('Raw data length:', rawData.length);
      console.log('First 100 chars:', rawData.substring(0, 100));
      console.log('Last 50 chars:', rawData.substring(Math.max(0, rawData.length - 50)));

      // Show character codes for the first few characters to identify issues
      const firstChars = rawData.substring(0, 10);
      const charCodes = Array.from(firstChars).map(char => `'${char}'(${char.charCodeAt(0)})`);
      console.log('First 10 char codes:', charCodes);

      // Test sanitization
      const sanitized = this.sanitizeStorageData(rawData);
      console.log('Sanitization result:', sanitized ? 'OK' : 'FAILED');

      if (sanitized) {
        const parsed = this.parseWithFallback(sanitized);
        console.log('Parse result:', parsed !== null ? 'OK' : 'FAILED');

        if (parsed !== null) {
          const isValid = this.isValidMigrationData(parsed);
          console.log('Validation result:', isValid ? 'OK' : 'FAILED');
        }
      }

      console.groupEnd();
    });
  }

  /**
   * Force clean migration - removes all problematic keys and retries migration
   */
  static async forceCleanMigration(): Promise<MigrationResult> {
    console.log('Starting force clean migration...');

    // First, get a list of all problematic keys
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) allKeys.push(key);
    }

    const sensitiveKeys = allKeys.filter(key => {
      return this.SENSITIVE_KEYS.some(
        sensitiveKey => key.includes(sensitiveKey) && !key.startsWith('enc_')
      );
    });

    // Test each key and categorize
    const validKeys: string[] = [];
    const invalidKeys: string[] = [];

    for (const key of sensitiveKeys) {
      const rawData = localStorage.getItem(key);
      if (!rawData) continue;

      const sanitized = this.sanitizeStorageData(rawData);
      if (!sanitized) {
        invalidKeys.push(key);
        continue;
      }

      const parsed = this.parseWithFallback(sanitized);
      if (parsed === null || !this.isValidMigrationData(parsed)) {
        invalidKeys.push(key);
        continue;
      }

      validKeys.push(key);
    }

    console.log(`Found ${validKeys.length} valid keys and ${invalidKeys.length} invalid keys`);

    // Remove invalid keys
    invalidKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed invalid key: ${key}`);
    });

    // Now run normal migration on valid keys
    return this.migrateAllSensitiveData();
  }
}

export default StorageMigration;
