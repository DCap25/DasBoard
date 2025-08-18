/**
 * Client-side Rate Limiter
 * Protects against brute force attacks on authentication endpoints
 */

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  blockUntil?: number;
}

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Maximum attempts per window
  blockDurationMs: number; // How long to block after limit exceeded
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private readonly defaultConfigs = {
    // Authentication endpoints - strict limits
    signIn: { windowMs: 15 * 60 * 1000, maxAttempts: 5, blockDurationMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes, block for 15 minutes
    signUp: { windowMs: 10 * 60 * 1000, maxAttempts: 3, blockDurationMs: 30 * 60 * 1000 }, // 3 attempts per 10 minutes, block for 30 minutes
    passwordReset: { windowMs: 5 * 60 * 1000, maxAttempts: 3, blockDurationMs: 10 * 60 * 1000 }, // 3 attempts per 5 minutes, block for 10 minutes

    // General endpoints - more lenient
    api: { windowMs: 1 * 60 * 1000, maxAttempts: 30, blockDurationMs: 5 * 60 * 1000 }, // 30 attempts per minute, block for 5 minutes
  };

  /**
   * Get rate limit key based on action and identifier (usually IP or user ID)
   */
  private getKey(action: string, identifier: string): string {
    return `${action}:${identifier}`;
  }

  /**
   * Get client identifier (fallback to session ID if no user)
   */
  private getClientId(userId?: string): string {
    if (userId) return userId;

    // Use session storage to create a persistent client ID for anonymous users
    let clientId = sessionStorage.getItem('client_id');
    if (!clientId) {
      clientId = 'anon_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      sessionStorage.setItem('client_id', clientId);
    }
    return clientId;
  }

  /**
   * Check if action is rate limited
   */
  isLimited(
    action: keyof typeof this.defaultConfigs,
    userId?: string
  ): {
    limited: boolean;
    retryAfterMs?: number;
    remainingAttempts?: number;
  } {
    const config = this.defaultConfigs[action];
    const clientId = this.getClientId(userId);
    const key = this.getKey(action, clientId);
    const now = Date.now();

    let entry = this.storage.get(key);

    // Clean up expired entries
    if (entry && now - entry.firstAttempt > config.windowMs) {
      entry = undefined;
      this.storage.delete(key);
    }

    // Check if currently blocked
    if (entry?.blockUntil && now < entry.blockUntil) {
      return {
        limited: true,
        retryAfterMs: entry.blockUntil - now,
      };
    }

    // If no entry or block expired, allow the request
    if (!entry || (entry.blockUntil && now >= entry.blockUntil)) {
      return {
        limited: false,
        remainingAttempts: config.maxAttempts - 1,
      };
    }

    // Check if within rate limit
    if (entry.attempts < config.maxAttempts) {
      return {
        limited: false,
        remainingAttempts: config.maxAttempts - entry.attempts - 1,
      };
    }

    // Rate limit exceeded - this shouldn't happen if recordAttempt is called properly
    return {
      limited: true,
      retryAfterMs: config.blockDurationMs,
    };
  }

  /**
   * Record an attempt (both successful and failed)
   */
  recordAttempt(action: keyof typeof this.defaultConfigs, success: boolean, userId?: string): void {
    const config = this.defaultConfigs[action];
    const clientId = this.getClientId(userId);
    const key = this.getKey(action, clientId);
    const now = Date.now();

    let entry = this.storage.get(key);

    // Clean up expired entries
    if (entry && now - entry.firstAttempt > config.windowMs) {
      entry = undefined;
    }

    if (!entry) {
      entry = {
        attempts: 1,
        firstAttempt: now,
        lastAttempt: now,
      };
    } else {
      entry.attempts++;
      entry.lastAttempt = now;
    }

    // If this attempt exceeded the limit, set block time
    if (entry.attempts >= config.maxAttempts && !success) {
      entry.blockUntil = now + config.blockDurationMs;
    }

    // If successful, reset the counter (for failed login attempts)
    if (success && action === 'signIn') {
      this.storage.delete(key);
      return;
    }

    this.storage.set(key, entry);

    // Clean up old entries periodically
    this.cleanup();
  }

  /**
   * Get remaining time until rate limit resets
   */
  getTimeUntilReset(action: keyof typeof this.defaultConfigs, userId?: string): number | null {
    const config = this.defaultConfigs[action];
    const clientId = this.getClientId(userId);
    const key = this.getKey(action, clientId);
    const entry = this.storage.get(key);

    if (!entry) return null;

    const now = Date.now();
    const windowEnd = entry.firstAttempt + config.windowMs;

    if (entry.blockUntil && now < entry.blockUntil) {
      return entry.blockUntil - now;
    }

    if (now < windowEnd) {
      return windowEnd - now;
    }

    return null;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const entriesToDelete: string[] = [];

    for (const [key, entry] of this.storage.entries()) {
      // Remove entries that are expired and not blocked
      if (
        (!entry.blockUntil || now >= entry.blockUntil) &&
        now - entry.firstAttempt >
          Math.max(...Object.values(this.defaultConfigs).map(c => c.windowMs))
      ) {
        entriesToDelete.push(key);
      }
    }

    entriesToDelete.forEach(key => this.storage.delete(key));
  }

  /**
   * Clear all rate limit data (for testing)
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Get current rate limit status for debugging
   */
  getStatus(
    action: keyof typeof this.defaultConfigs,
    userId?: string
  ): {
    attempts: number;
    isBlocked: boolean;
    blockUntilMs?: number;
    remainingAttempts: number;
  } | null {
    const config = this.defaultConfigs[action];
    const clientId = this.getClientId(userId);
    const key = this.getKey(action, clientId);
    const entry = this.storage.get(key);
    const now = Date.now();

    if (!entry) {
      return {
        attempts: 0,
        isBlocked: false,
        remainingAttempts: config.maxAttempts,
      };
    }

    const isBlocked = !!(entry.blockUntil && now < entry.blockUntil);

    return {
      attempts: entry.attempts,
      isBlocked,
      blockUntilMs: entry.blockUntil,
      remainingAttempts: Math.max(0, config.maxAttempts - entry.attempts),
    };
  }
}

// Export singleton instance
const rateLimiter = new RateLimiter();
export default rateLimiter;
