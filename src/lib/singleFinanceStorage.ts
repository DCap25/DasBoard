// User-specific encrypted localStorage utility for Single Finance Manager
// This ensures each user's data is isolated, encrypted, and doesn't conflict with other users

import EncryptedStorage from './encryptedStorage';

export class SingleFinanceStorage {
  private static getUserKey(baseKey: string, userId: string): string {
    return `${baseKey}_${userId}`;
  }

  // Team Members (Encrypted) with enhanced debugging
  static getTeamMembers(userId: string): any[] {
    try {
      const key = this.getUserKey('singleFinanceTeamMembers', userId);
      console.log('[SingleFinanceStorage] Getting team members:', { userId, key });
      
      const teamMembers = EncryptedStorage.getItem(key, []);
      console.log('[SingleFinanceStorage] Retrieved team members:', {
        key,
        count: teamMembers.length,
        members: teamMembers.map(m => ({ id: m.id, name: `${m.firstName} ${m.lastName}`, role: m.role, active: m.active }))
      });
      
      return teamMembers;
    } catch (error) {
      console.error('[SingleFinanceStorage] Error loading team members:', error);
      return [];
    }
  }

  static setTeamMembers(userId: string, teamMembers: any[]): void {
    try {
      const key = this.getUserKey('singleFinanceTeamMembers', userId);
      console.log('[SingleFinanceStorage] Saving team members:', {
        userId,
        key,
        count: teamMembers.length,
        members: teamMembers.map(m => ({ id: m.id, name: `${m.firstName} ${m.lastName}`, role: m.role, active: m.active }))
      });
      
      EncryptedStorage.setItem(key, teamMembers);
      
      // Immediate verification
      const verification = EncryptedStorage.getItem(key, []);
      console.log('[SingleFinanceStorage] Save verification:', {
        key,
        savedCount: teamMembers.length,
        retrievedCount: verification.length,
        success: teamMembers.length === verification.length
      });
      
    } catch (error) {
      console.error('[SingleFinanceStorage] Error saving team members:', error);
      throw error; // Re-throw so caller can handle
    }
  }

  // Deals (Encrypted)
  static getDeals(userId: string): any[] {
    try {
      const key = this.getUserKey('singleFinanceDeals', userId);
      return EncryptedStorage.getItem(key, []);
    } catch (error) {
      console.error('Error loading deals:', error);
      return [];
    }
  }

  static setDeals(userId: string, deals: any[]): void {
    try {
      const key = this.getUserKey('singleFinanceDeals', userId);
      EncryptedStorage.setItem(key, deals);
    } catch (error) {
      console.error('Error saving deals:', error);
    }
  }

  // Pay Configuration (Encrypted)
  static getPayConfig(userId: string): any | null {
    try {
      const key = this.getUserKey('singleFinancePayConfig', userId);
      return EncryptedStorage.getItem(key, null);
    } catch (error) {
      console.error('Error loading pay config:', error);
      return null;
    }
  }

  static setPayConfig(userId: string, payConfig: any): void {
    try {
      const key = this.getUserKey('singleFinancePayConfig', userId);
      EncryptedStorage.setItem(key, payConfig);
    } catch (error) {
      console.error('Error saving pay config:', error);
    }
  }

  // Monthly Reset Tracking
  static getLastResetMonth(userId: string): string | null {
    try {
      const key = this.getUserKey('singleFinanceLastResetMonth', userId);
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error loading last reset month:', error);
      return null;
    }
  }

  static setLastResetMonth(userId: string, monthYear: string): void {
    try {
      const key = this.getUserKey('singleFinanceLastResetMonth', userId);
      localStorage.setItem(key, monthYear);
    } catch (error) {
      console.error('Error saving last reset month:', error);
    }
  }

  // Archive current month's deals before clearing
  static archiveCurrentMonth(userId: string): void {
    try {
      const currentDeals = this.getDeals(userId);
      if (currentDeals.length > 0) {
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const archiveKey = this.getUserKey(`singleFinanceDealsArchive_${monthKey}`, userId);
        
        EncryptedStorage.setItem(archiveKey, currentDeals);
        console.log(`[SingleFinanceStorage] Archived ${currentDeals.length} deals for ${monthKey}`);
      }
    } catch (error) {
      console.error('Error archiving deals:', error);
    }
  }

  // Get archived deals for a specific month
  static getArchivedDeals(userId: string, monthKey: string): any[] {
    try {
      const archiveKey = this.getUserKey(`singleFinanceDealsArchive_${monthKey}`, userId);
      return EncryptedStorage.getItem(archiveKey, []);
    } catch (error) {
      console.error('Error loading archived deals:', error);
      return [];
    }
  }

  // Get all available archive months for a user
  static getAvailableArchiveMonths(userId: string): string[] {
    try {
      const userKeyPrefix = `singleFinanceDealsArchive_`;
      const userKeySuffix = `_${userId}`;
      const months: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(userKeyPrefix) && key.endsWith(userKeySuffix)) {
          // Extract month from key: enc_singleFinanceDealsArchive_2024-01_userId
          const match = key.match(/singleFinanceDealsArchive_(\d{4}-\d{2})/);
          if (match) {
            months.push(match[1]);
          }
        }
      }

      return months.sort().reverse(); // Most recent first
    } catch (error) {
      console.error('Error getting available archive months:', error);
      return [];
    }
  }

  // Clear user's deals (for monthly reset)
  static clearDeals(userId: string): void {
    try {
      const key = this.getUserKey('singleFinanceDeals', userId);
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing deals:', error);
    }
  }

  // Debug: List all keys for a user
  static getUserKeys(userId: string): string[] {
    const keys: string[] = [];
    const suffix = `_${userId}`;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.endsWith(suffix) && key.startsWith('singleFinance')) {
        keys.push(key);
      }
    }
    
    return keys;
  }

  // Pay Privacy State (Encrypted)
  static getPayPrivacyState(userId: string): boolean {
    try {
      const key = this.getUserKey('singleFinancePayPrivacy', userId);
      return EncryptedStorage.getItem(key, false); // Default to hidden for privacy
    } catch (error) {
      console.error('Error loading pay privacy state:', error);
      return false;
    }
  }

  static setPayPrivacyState(userId: string, showPayAmounts: boolean): void {
    try {
      const key = this.getUserKey('singleFinancePayPrivacy', userId);
      EncryptedStorage.setItem(key, showPayAmounts);
    } catch (error) {
      console.error('Error saving pay privacy state:', error);
    }
  }

  // Clear all data for a user (useful for testing)
  static clearAllUserData(userId: string): void {
    const userKeys = this.getUserKeys(userId);
    userKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    console.log(`Cleared ${userKeys.length} localStorage keys for user ${userId}`);
  }

  // Debug storage state for troubleshooting
  static debugStorageState(userId: string): void {
    console.group('[SingleFinanceStorage] Storage Debug for user:', userId);
    
    const key = this.getUserKey('singleFinanceTeamMembers', userId);
    console.log('Expected storage key:', key);
    console.log('User ID:', userId);
    
    // Check encrypted storage
    const encryptedKey = `enc_${key}`;
    const encryptedData = localStorage.getItem(encryptedKey);
    console.log('Encrypted key exists:', !!encryptedData);
    console.log('Encrypted data length:', encryptedData?.length || 0);
    
    // Check unencrypted storage
    const unencryptedData = localStorage.getItem(key);
    console.log('Unencrypted key exists:', !!unencryptedData);
    if (unencryptedData) {
      try {
        const parsed = JSON.parse(unencryptedData);
        console.log('Unencrypted data:', parsed);
      } catch (e) {
        console.log('Unencrypted data (not JSON):', unencryptedData);
      }
    }
    
    // Check all related keys
    const allKeys = Object.keys(localStorage).filter(k => 
      k.includes('singleFinance') || k.includes('TeamMembers') || (userId && k.includes(userId))
    );
    console.log('All related localStorage keys:', allKeys);
    
    // Try to retrieve using encrypted storage
    try {
      const retrieved = this.getTeamMembers(userId);
      console.log('Successfully retrieved team members:', retrieved);
    } catch (error) {
      console.error('Error retrieving team members:', error);
    }
    
    console.groupEnd();
  }

  // Clear old format localStorage keys that might have sample data
  static clearOldFormatData(): void {
    const oldKeys = [
      'singleFinanceTeamMembers',  // Old format without user ID
      'teamMembers',               // Generic team members  
      'salespeople',               // Old salespeople data
      'salesManagers',             // Old sales managers data
      'sampleTeamMembers',         // Any sample data
      'defaultTeamMembers'         // Any default data
    ];

    let clearedCount = 0;
    oldKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        clearedCount++;
        console.log(`[Storage] Cleared old format key: ${key}`);
      }
    });

    // Also check for any keys that might contain sample names
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            // Check if it's team member data with sample names
            if (value.includes('John') || value.includes('Jane') || value.includes('Mike') || value.includes('Sarah')) {
              const parsed = JSON.parse(value);
              if (Array.isArray(parsed) && parsed.some((item: any) => item.firstName && item.lastName)) {
                localStorage.removeItem(key);
                clearedCount++;
                console.log(`[Storage] Cleared sample data from key: ${key}`);
              }
            }
          }
        } catch (e) {
          // Not JSON, skip
        }
      }
    }

    console.log(`[Storage] Cleared ${clearedCount} old format/sample data keys`);
  }
}