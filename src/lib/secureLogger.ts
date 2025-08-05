// Secure logging utility to prevent sensitive data leakage

interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

// Sensitive fields that should never be logged
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'session',
  'auth',
  'secret',
  'key',
  'credential',
  'authorization'
];

/**
 * Sanitizes an object by removing or masking sensitive fields
 */
function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }

  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  });

  return sanitized;
}

/**
 * Secure logger that automatically sanitizes sensitive data
 */
export class SecureLogger {
  private static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  private static shouldLog(level: string): boolean {
    // In production, only log warnings and errors
    if (process.env.NODE_ENV === 'production') {
      return level === LOG_LEVELS.WARN || level === LOG_LEVELS.ERROR;
    }
    return true;
  }

  static debug(message: string, data?: any): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(`[DEBUG] ${message}`, data ? sanitizeData(data) : '');
    }
  }

  static info(message: string, data?: any): void {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      console.log(`[INFO] ${message}`, data ? sanitizeData(data) : '');
    }
  }

  static warn(message: string, data?: any): void {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      console.warn(`[WARN] ${message}`, data ? sanitizeData(data) : '');
    }
  }

  static error(message: string, error?: any): void {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      // For errors, we still want some debugging info but sanitized
      console.error(`[ERROR] ${message}`, error ? sanitizeData(error) : '');
    }
  }

  /**
   * Special method for auth-related logging that's extra cautious
   */
  static auth(message: string, data?: any): void {
    if (this.isDevelopment()) {
      // In development, show sanitized auth info
      console.log(`[AUTH] ${message}`, data ? sanitizeData(data) : '');
    } else {
      // In production, only show the message without data
      console.log(`[AUTH] ${message}`);
    }
  }
}

export default SecureLogger;