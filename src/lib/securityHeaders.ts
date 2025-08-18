/**
 * Security Headers Configuration
 * Provides utilities for setting up security headers in API responses
 */

export interface SecurityHeaders {
  'Content-Security-Policy'?: string;
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Strict-Transport-Security': string;
  'Referrer-Policy': string;
  'Permissions-Policy'?: string;
}

class SecurityHeadersManager {
  private static readonly DEFAULT_CSP = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://iugjtokydvbcvmrpeziv.supabase.co https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://iugjtokydvbcvmrpeziv.supabase.co wss://iugjtokydvbcvmrpeziv.supabase.co https://api.stripe.com",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; ');

  /**
   * Get default security headers
   */
  static getDefaultHeaders(): SecurityHeaders {
    return {
      'Content-Security-Policy': this.DEFAULT_CSP,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy':
        'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
    };
  }

  /**
   * Get API-specific security headers
   */
  static getApiHeaders(): SecurityHeaders {
    return {
      'Content-Security-Policy': "default-src 'none'",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Referrer-Policy': 'no-referrer',
    };
  }

  /**
   * Generate nonce for inline scripts
   */
  static generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)));
  }

  /**
   * Create CSP with nonce for inline scripts
   */
  static createCSPWithNonce(nonce: string): string {
    return this.DEFAULT_CSP.replace("'unsafe-inline'", `'nonce-${nonce}'`);
  }

  /**
   * Validate and sanitize CSP
   */
  static validateCSP(csp: string): boolean {
    // Basic validation - check for dangerous directives
    const dangerous = ["'unsafe-eval'", 'data:', '*', 'javascript:', 'unsafe-inline'];

    // Allow unsafe-inline and unsafe-eval for development
    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    // In production, warn about potentially dangerous directives
    for (const directive of dangerous) {
      if (csp.includes(directive)) {
        console.warn(`[Security] Potentially dangerous CSP directive found: ${directive}`);
      }
    }

    return true;
  }

  /**
   * Add security headers to fetch options
   */
  static addToFetchOptions(options: RequestInit = {}): RequestInit {
    const headers = this.getApiHeaders();

    return {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };
  }

  /**
   * Check if running in secure context
   */
  static isSecureContext(): boolean {
    return window.isSecureContext || window.location.protocol === 'https:';
  }

  /**
   * Log security violations (for CSP reporting)
   */
  static setupCSPReporting(): void {
    document.addEventListener('securitypolicyviolation', event => {
      console.error('[CSP Violation]', {
        blockedURI: event.blockedURI,
        directive: event.violatedDirective,
        originalPolicy: event.originalPolicy,
        referrer: event.referrer,
        statusCode: event.statusCode,
      });

      // In production, you might want to send this to a logging service
      if (process.env.NODE_ENV === 'production') {
        // Send to logging service
        fetch('/api/csp-violation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            blockedURI: event.blockedURI,
            directive: event.violatedDirective,
            originalPolicy: event.originalPolicy,
            timestamp: new Date().toISOString(),
          }),
        }).catch(console.error);
      }
    });
  }
}

export default SecurityHeadersManager;
