// User-specific localStorage utility for Single Finance Manager
// This ensures each user's data is isolated and doesn't conflict with other users

export class SingleFinanceStorage {
  private static getUserKey(baseKey: string, userId: string): string {
    return `${baseKey}_${userId}`;
  }

  // Team Members
  static getTeamMembers(userId: string): any[] {
    try {
      const key = this.getUserKey('singleFinanceTeamMembers', userId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading team members:', error);
      return [];
    }
  }

  static setTeamMembers(userId: string, teamMembers: any[]): void {
    try {
      const key = this.getUserKey('singleFinanceTeamMembers', userId);
      localStorage.setItem(key, JSON.stringify(teamMembers));
    } catch (error) {
      console.error('Error saving team members:', error);
    }
  }

  // Deals
  static getDeals(userId: string): any[] {
    try {
      const key = this.getUserKey('singleFinanceDeals', userId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading deals:', error);
      return [];
    }
  }

  static setDeals(userId: string, deals: any[]): void {
    try {
      const key = this.getUserKey('singleFinanceDeals', userId);
      localStorage.setItem(key, JSON.stringify(deals));
    } catch (error) {
      console.error('Error saving deals:', error);
    }
  }

  // Pay Configuration
  static getPayConfig(userId: string): any | null {
    try {
      const key = this.getUserKey('singleFinancePayConfig', userId);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading pay config:', error);
      return null;
    }
  }

  static setPayConfig(userId: string, payConfig: any): void {
    try {
      const key = this.getUserKey('singleFinancePayConfig', userId);
      localStorage.setItem(key, JSON.stringify(payConfig));
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

  // Clear all data for a user (useful for testing)
  static clearAllUserData(userId: string): void {
    const userKeys = this.getUserKeys(userId);
    userKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    console.log(`Cleared ${userKeys.length} localStorage keys for user ${userId}`);
  }
}