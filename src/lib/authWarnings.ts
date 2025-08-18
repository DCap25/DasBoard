/**
 * Development Warnings for Authentication Issues
 * 
 * FEATURES IMPLEMENTED:
 * - Console warnings for common auth problems
 * - Session health monitoring warnings
 * - Token expiration alerts
 * - Performance warnings for auth operations
 * - Security best practice alerts
 * - Environment-specific debugging
 * - Rate limiting detection
 * - Memory leak warnings
 * - Integration testing helpers
 */

// =================== TYPES ===================

export interface AuthWarningContext {
  userId?: string;
  email?: string;
  role?: string;
  sessionAge?: number;
  lastActivity?: number;
  requestCount?: number;
  memoryUsage?: number;
}

export type AuthWarningLevel = 'info' | 'warn' | 'error' | 'critical';

export interface AuthWarningConfig {
  enabled: boolean;
  level: AuthWarningLevel;
  includeStackTrace: boolean;
  logToConsole: boolean;
  logToStorage: boolean;
  maxStorageSize: number;
}

interface AuthWarningEntry {
  id: string;
  timestamp: number;
  level: AuthWarningLevel;
  category: string;
  message: string;
  context?: AuthWarningContext;
  stackTrace?: string;
  userAgent?: string;
}

// =================== CONFIGURATION ===================

const DEFAULT_CONFIG: AuthWarningConfig = {
  enabled: process.env.NODE_ENV === 'development',
  level: 'info',
  includeStackTrace: process.env.NODE_ENV === 'development',
  logToConsole: true,
  logToStorage: false,
  maxStorageSize: 100,
};

let currentConfig: AuthWarningConfig = { ...DEFAULT_CONFIG };

/**
 * Configure auth warning system
 */
export const configureAuthWarnings = (config: Partial<AuthWarningConfig>): void => {
  currentConfig = { ...currentConfig, ...config };
};

/**
 * Get current configuration
 */
export const getAuthWarningConfig = (): AuthWarningConfig => ({ ...currentConfig });

// =================== WARNING STORAGE ===================

class AuthWarningStorage {
  private warnings: AuthWarningEntry[] = [];
  private listeners: Array<(warning: AuthWarningEntry) => void> = [];
  
  add(warning: AuthWarningEntry): void {
    this.warnings.push(warning);
    
    // Limit storage size
    if (this.warnings.length > currentConfig.maxStorageSize) {
      this.warnings = this.warnings.slice(-currentConfig.maxStorageSize);
    }
    
    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(warning);
      } catch (error) {
        console.error('[AuthWarnings] Error in warning listener:', error);
      }
    });
  }
  
  getAll(): AuthWarningEntry[] {
    return [...this.warnings];
  }
  
  getByLevel(level: AuthWarningLevel): AuthWarningEntry[] {
    return this.warnings.filter(w => w.level === level);
  }
  
  getByCategory(category: string): AuthWarningEntry[] {
    return this.warnings.filter(w => w.category === category);
  }
  
  getRecent(minutes: number = 30): AuthWarningEntry[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.warnings.filter(w => w.timestamp >= cutoff);
  }
  
  clear(): void {
    this.warnings = [];
  }
  
  addListener(listener: (warning: AuthWarningEntry) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  export(): string {
    return JSON.stringify(this.warnings, null, 2);
  }
}

const warningStorage = new AuthWarningStorage();

// =================== WARNING UTILITIES ===================

/**
 * Get stack trace for debugging
 */
const getStackTrace = (): string => {
  try {
    throw new Error();
  } catch (error) {
    return error instanceof Error && error.stack ? error.stack : 'No stack trace available';
  }
};

/**
 * Generate unique ID for warnings
 */
const generateWarningId = (): string => {
  return `auth-warn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if warning level should be logged
 */
const shouldLogLevel = (level: AuthWarningLevel): boolean => {
  const levels = ['info', 'warn', 'error', 'critical'];
  const currentIndex = levels.indexOf(currentConfig.level);
  const warningIndex = levels.indexOf(level);
  return warningIndex >= currentIndex;
};

/**
 * Format warning for console output
 */
const formatWarningForConsole = (warning: AuthWarningEntry): void => {
  if (!currentConfig.logToConsole) return;
  
  const emoji = {
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    critical: '🚨',
  }[warning.level];
  
  const prefix = `${emoji} [AUTH WARNING - ${warning.category}]`;
  
  switch (warning.level) {
    case 'info':
      console.info(`%c${prefix}`, 'color: #3b82f6; font-weight: bold;', warning.message);
      break;
    case 'warn':
      console.warn(`%c${prefix}`, 'color: #f59e0b; font-weight: bold;', warning.message);
      break;
    case 'error':
      console.error(`%c${prefix}`, 'color: #ef4444; font-weight: bold;', warning.message);
      break;
    case 'critical':
      console.error(`%c${prefix}`, 'color: #dc2626; font-weight: bold; background: #fef2f2; padding: 4px;', warning.message);
      break;
  }
  
  // Log context if available
  if (warning.context && Object.keys(warning.context).length > 0) {
    console.group('Context:');
    Object.entries(warning.context).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
    console.groupEnd();
  }
  
  // Log stack trace if enabled and available
  if (currentConfig.includeStackTrace && warning.stackTrace) {
    console.group('Stack Trace:');
    console.log(warning.stackTrace);
    console.groupEnd();
  }
};

/**
 * Create and log warning
 */
const createWarning = (
  level: AuthWarningLevel,
  category: string,
  message: string,
  context?: AuthWarningContext
): void => {
  if (!currentConfig.enabled || !shouldLogLevel(level)) {
    return;
  }
  
  const warning: AuthWarningEntry = {
    id: generateWarningId(),
    timestamp: Date.now(),
    level,
    category,
    message,
    context,
    stackTrace: currentConfig.includeStackTrace ? getStackTrace() : undefined,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
  };
  
  // Log to console
  formatWarningForConsole(warning);
  
  // Store warning
  if (currentConfig.logToStorage) {
    warningStorage.add(warning);
  }
};

// =================== SPECIFIC WARNING FUNCTIONS ===================

/**
 * Session-related warnings
 */
export const AuthWarnings = {
  
  // Session Management
  sessionExpired: (context?: AuthWarningContext) => {
    createWarning('warn', 'SESSION', 'User session has expired and needs refresh', {
      ...context,
      sessionAge: context?.sessionAge || 0,
    });
  },
  
  sessionNearExpiry: (expiresInMinutes: number, context?: AuthWarningContext) => {
    createWarning('warn', 'SESSION', `Session expires in ${expiresInMinutes} minutes`, {
      ...context,
      sessionAge: context?.sessionAge || 0,
    });
  },
  
  sessionRefreshFailed: (error: string, context?: AuthWarningContext) => {
    createWarning('error', 'SESSION', `Session refresh failed: ${error}`, context);
  },
  
  sessionInvalidated: (reason: string, context?: AuthWarningContext) => {
    createWarning('warn', 'SESSION', `Session invalidated: ${reason}`, context);
  },
  
  multipleSessionsDetected: (count: number, context?: AuthWarningContext) => {
    createWarning('warn', 'SESSION', `Multiple active sessions detected: ${count}`, context);
  },
  
  // Authentication Warnings
  authStateMismatch: (expected: string, actual: string, context?: AuthWarningContext) => {
    createWarning('error', 'AUTH_STATE', `Auth state mismatch: expected ${expected}, got ${actual}`, context);
  },
  
  authListenerMissing: (context?: AuthWarningContext) => {
    createWarning('error', 'AUTH_STATE', 'Auth state listener not properly set up', context);
  },
  
  authInitializationTimeout: (timeoutMs: number, context?: AuthWarningContext) => {
    createWarning('warn', 'AUTH_INIT', `Auth initialization took longer than ${timeoutMs}ms`, context);
  },
  
  authInitializationFailed: (error: string, context?: AuthWarningContext) => {
    createWarning('error', 'AUTH_INIT', `Auth initialization failed: ${error}`, context);
  },
  
  // Token Management
  tokenMissing: (context?: AuthWarningContext) => {
    createWarning('error', 'TOKEN', 'Access token is missing from session', context);
  },
  
  tokenInvalid: (reason: string, context?: AuthWarningContext) => {
    createWarning('error', 'TOKEN', `Invalid token: ${reason}`, context);
  },
  
  tokenRefreshLoop: (attempts: number, context?: AuthWarningContext) => {
    createWarning('error', 'TOKEN', `Token refresh loop detected: ${attempts} attempts`, context);
  },
  
  // Permission & Role Warnings
  roleNotFound: (userId: string, context?: AuthWarningContext) => {
    createWarning('warn', 'PERMISSIONS', `No role found for user ${userId}, defaulting to viewer`, {
      ...context,
      userId,
    });
  },
  
  roleValidationFailed: (invalidRole: string, context?: AuthWarningContext) => {
    createWarning('warn', 'PERMISSIONS', `Invalid role "${invalidRole}", defaulting to viewer`, context);
  },
  
  permissionDenied: (action: string, requiredRole: string, userRole: string, context?: AuthWarningContext) => {
    createWarning('warn', 'PERMISSIONS', `Permission denied: ${action} requires ${requiredRole}, user has ${userRole}`, {
      ...context,
      role: userRole,
    });
  },
  
  // Network & Connection Warnings
  networkTimeout: (timeoutMs: number, operation: string, context?: AuthWarningContext) => {
    createWarning('warn', 'NETWORK', `Network timeout after ${timeoutMs}ms for operation: ${operation}`, context);
  },
  
  connectionFailed: (error: string, retryCount: number, context?: AuthWarningContext) => {
    createWarning('error', 'NETWORK', `Connection failed: ${error} (retry ${retryCount})`, context);
  },
  
  rateLimitExceeded: (operation: string, resetTime?: number, context?: AuthWarningContext) => {
    const resetMsg = resetTime ? ` (reset at ${new Date(resetTime).toLocaleTimeString()})` : '';
    createWarning('warn', 'RATE_LIMIT', `Rate limit exceeded for ${operation}${resetMsg}`, context);
  },
  
  // Security Warnings
  insecureConnection: (context?: AuthWarningContext) => {
    createWarning('critical', 'SECURITY', 'Authentication attempted over insecure connection (HTTP)', context);
  },
  
  suspiciousActivity: (activity: string, context?: AuthWarningContext) => {
    createWarning('critical', 'SECURITY', `Suspicious activity detected: ${activity}`, context);
  },
  
  tokenLeakRisk: (location: string, context?: AuthWarningContext) => {
    createWarning('critical', 'SECURITY', `Potential token leak risk: ${location}`, context);
  },
  
  // Performance Warnings
  slowOperation: (operation: string, duration: number, threshold: number, context?: AuthWarningContext) => {
    createWarning('warn', 'PERFORMANCE', `Slow operation: ${operation} took ${duration}ms (threshold: ${threshold}ms)`, context);
  },
  
  memoryLeakRisk: (componentName: string, leakType: string, context?: AuthWarningContext) => {
    createWarning('error', 'MEMORY', `Potential memory leak in ${componentName}: ${leakType}`, {
      ...context,
      memoryUsage: typeof performance !== 'undefined' ? performance.memory?.usedJSHeapSize : undefined,
    });
  },
  
  excessiveReRenders: (componentName: string, count: number, context?: AuthWarningContext) => {
    createWarning('warn', 'PERFORMANCE', `Excessive re-renders in ${componentName}: ${count} renders`, context);
  },
  
  // Development Warnings
  devModeWarning: (message: string, context?: AuthWarningContext) => {
    if (process.env.NODE_ENV === 'development') {
      createWarning('info', 'DEV', message, context);
    }
  },
  
  missingConfiguration: (configKey: string, defaultValue: string, context?: AuthWarningContext) => {
    createWarning('warn', 'CONFIG', `Missing configuration: ${configKey}, using default: ${defaultValue}`, context);
  },
  
  deprecatedFeature: (feature: string, replacement?: string, context?: AuthWarningContext) => {
    const msg = replacement 
      ? `Deprecated feature used: ${feature}. Use ${replacement} instead.`
      : `Deprecated feature used: ${feature}`;
    createWarning('warn', 'DEPRECATED', msg, context);
  },
  
  // Testing Warnings
  testModeActive: (context?: AuthWarningContext) => {
    createWarning('info', 'TEST', 'Test mode is active - using mock authentication', context);
  },
  
  mockDataUsed: (mockType: string, context?: AuthWarningContext) => {
    createWarning('info', 'TEST', `Using mock data: ${mockType}`, context);
  },
  
};

// =================== WARNING MONITORING ===================

/**
 * Monitor auth warnings and provide insights
 */
export class AuthWarningMonitor {
  private static instance: AuthWarningMonitor;
  
  static getInstance(): AuthWarningMonitor {
    if (!AuthWarningMonitor.instance) {
      AuthWarningMonitor.instance = new AuthWarningMonitor();
    }
    return AuthWarningMonitor.instance;
  }
  
  /**
   * Get warning statistics
   */
  getStats(): {
    total: number;
    byLevel: Record<AuthWarningLevel, number>;
    byCategory: Record<string, number>;
    recent: number;
  } {
    const warnings = warningStorage.getAll();
    const recent = warningStorage.getRecent(30);
    
    const byLevel = warnings.reduce((acc, w) => {
      acc[w.level] = (acc[w.level] || 0) + 1;
      return acc;
    }, {} as Record<AuthWarningLevel, number>);
    
    const byCategory = warnings.reduce((acc, w) => {
      acc[w.category] = (acc[w.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: warnings.length,
      byLevel,
      byCategory,
      recent: recent.length,
    };
  }
  
  /**
   * Get critical warnings that need immediate attention
   */
  getCriticalWarnings(): AuthWarningEntry[] {
    return warningStorage.getByLevel('critical');
  }
  
  /**
   * Check for warning patterns that indicate problems
   */
  analyzePatterns(): {
    issues: string[];
    recommendations: string[];
  } {
    const warnings = warningStorage.getRecent(60); // Last hour
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // Check for excessive session refreshes
    const sessionRefreshWarnings = warnings.filter(w => 
      w.category === 'SESSION' && w.message.includes('refresh')
    );
    if (sessionRefreshWarnings.length > 5) {
      issues.push('Excessive session refresh attempts detected');
      recommendations.push('Check session timeout configuration and token expiry handling');
    }
    
    // Check for repeated auth failures
    const authFailures = warnings.filter(w => 
      w.category === 'AUTH_STATE' && w.level === 'error'
    );
    if (authFailures.length > 3) {
      issues.push('Multiple authentication failures detected');
      recommendations.push('Verify auth state management and error handling');
    }
    
    // Check for network issues
    const networkIssues = warnings.filter(w => w.category === 'NETWORK');
    if (networkIssues.length > 10) {
      issues.push('Frequent network issues detected');
      recommendations.push('Implement better retry logic and connection handling');
    }
    
    // Check for security warnings
    const securityWarnings = warnings.filter(w => w.category === 'SECURITY');
    if (securityWarnings.length > 0) {
      issues.push('Security warnings detected');
      recommendations.push('Review security practices and fix identified issues immediately');
    }
    
    return { issues, recommendations };
  }
  
  /**
   * Generate warning report
   */
  generateReport(): {
    summary: string;
    stats: ReturnType<AuthWarningMonitor['getStats']>;
    patterns: ReturnType<AuthWarningMonitor['analyzePatterns']>;
    recentWarnings: AuthWarningEntry[];
  } {
    const stats = this.getStats();
    const patterns = this.analyzePatterns();
    const recentWarnings = warningStorage.getRecent(30);
    
    let summary = 'Auth Warning Report:\n';
    summary += `Total warnings: ${stats.total}\n`;
    summary += `Recent warnings (30 min): ${stats.recent}\n`;
    
    if (patterns.issues.length > 0) {
      summary += `\nIssues identified: ${patterns.issues.length}`;
    } else {
      summary += '\nNo patterns of concern detected';
    }
    
    return {
      summary,
      stats,
      patterns,
      recentWarnings,
    };
  }
}

// =================== UTILITY FUNCTIONS ===================

/**
 * Start monitoring auth warnings
 */
export const startAuthWarningMonitor = (): (() => void) => {
  const monitor = AuthWarningMonitor.getInstance();
  
  // Set up periodic analysis
  const intervalId = setInterval(() => {
    const patterns = monitor.analyzePatterns();
    
    if (patterns.issues.length > 0) {
      console.group('🔍 Auth Warning Analysis');
      patterns.issues.forEach(issue => {
        console.warn('Issue:', issue);
      });
      patterns.recommendations.forEach(rec => {
        console.info('Recommendation:', rec);
      });
      console.groupEnd();
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
  
  return () => {
    clearInterval(intervalId);
  };
};

/**
 * Export warnings for debugging
 */
export const exportAuthWarnings = (): string => {
  return warningStorage.export();
};

/**
 * Clear all warnings
 */
export const clearAuthWarnings = (): void => {
  warningStorage.clear();
};

/**
 * Subscribe to new warnings
 */
export const subscribeToAuthWarnings = (
  callback: (warning: AuthWarningEntry) => void
): (() => void) => {
  return warningStorage.addListener(callback);
};

// =================== DEVELOPMENT HELPERS ===================

/**
 * Test auth warning system
 */
export const testAuthWarnings = (): void => {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Auth warning tests only available in development');
    return;
  }
  
  console.group('🧪 Testing Auth Warning System');
  
  AuthWarnings.devModeWarning('This is a test warning');
  AuthWarnings.sessionExpired({ userId: 'test-user', sessionAge: 3600 });
  AuthWarnings.tokenInvalid('Test token validation');
  AuthWarnings.slowOperation('test-operation', 5000, 1000);
  
  const stats = AuthWarningMonitor.getInstance().getStats();
  console.log('Warning stats:', stats);
  
  console.groupEnd();
};

// =================== EXPORTS ===================

export {
  warningStorage as authWarningStorage,
  AuthWarningMonitor,
  type AuthWarningEntry,
  type AuthWarningContext,
  type AuthWarningLevel,
  type AuthWarningConfig,
};