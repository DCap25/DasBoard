/**
 * CSRF Protection Utility
 * Generates and validates CSRF tokens for form submissions
 */

interface CSRFTokenData {
  token: string;
  timestamp: number;
  expiresAt: number;
}

class CSRFProtection {
  private static readonly TOKEN_LIFETIME_MS = 30 * 60 * 1000; // 30 minutes
  private static readonly STORAGE_KEY = 'csrf_token';

  /**
   * Generate a cryptographically secure CSRF token
   */
  private static generateSecureToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Get or generate a CSRF token
   */
  static getToken(): string {
    const stored = sessionStorage.getItem(this.STORAGE_KEY);
    const now = Date.now();

    if (stored) {
      try {
        const tokenData: CSRFTokenData = JSON.parse(stored);

        // Check if token is still valid
        if (now < tokenData.expiresAt) {
          return tokenData.token;
        }
      } catch (error) {
        // Invalid stored token, generate new one
      }
    }

    // Generate new token
    const token = this.generateSecureToken();
    const tokenData: CSRFTokenData = {
      token,
      timestamp: now,
      expiresAt: now + this.TOKEN_LIFETIME_MS,
    };

    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokenData));
    return token;
  }

  /**
   * Validate a CSRF token
   */
  static validateToken(providedToken: string): boolean {
    if (!providedToken) return false;

    const stored = sessionStorage.getItem(this.STORAGE_KEY);
    if (!stored) return false;

    try {
      const tokenData: CSRFTokenData = JSON.parse(stored);
      const now = Date.now();

      // Check if token is expired
      if (now >= tokenData.expiresAt) {
        this.clearToken();
        return false;
      }

      // Constant-time comparison to prevent timing attacks
      return this.constantTimeEquals(providedToken, tokenData.token);
    } catch (error) {
      this.clearToken();
      return false;
    }
  }

  /**
   * Constant-time string comparison
   */
  private static constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) return false;

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }

  /**
   * Clear the current CSRF token
   */
  static clearToken(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Refresh the CSRF token (generate a new one)
   */
  static refreshToken(): string {
    this.clearToken();
    return this.getToken();
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(): Date | null {
    const stored = sessionStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;

    try {
      const tokenData: CSRFTokenData = JSON.parse(stored);
      return new Date(tokenData.expiresAt);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token will expire soon (within 5 minutes)
   */
  static isTokenNearExpiry(): boolean {
    const expiration = this.getTokenExpiration();
    if (!expiration) return true;

    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    return expiration <= fiveMinutesFromNow;
  }

  /**
   * Create hidden input element for forms
   */
  static createHiddenInput(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'csrf_token';
    input.value = this.getToken();
    return input;
  }

  /**
   * Add CSRF token to FormData
   */
  static addToFormData(formData: FormData): void {
    formData.append('csrf_token', this.getToken());
  }

  /**
   * Add CSRF token to request headers
   */
  static addToHeaders(headers: Record<string, string> = {}): Record<string, string> {
    return {
      ...headers,
      'X-CSRF-Token': this.getToken(),
    };
  }

  /**
   * Validate CSRF token from request data
   */
  static validateFromRequest(data: { csrf_token?: string } | FormData | Headers): boolean {
    let token: string | null = null;

    if (data instanceof FormData) {
      token = data.get('csrf_token') as string;
    } else if (data instanceof Headers) {
      token = data.get('X-CSRF-Token');
    } else if (data && typeof data === 'object') {
      token = data.csrf_token || null;
    }

    return token ? this.validateToken(token) : false;
  }
}

export default CSRFProtection;
