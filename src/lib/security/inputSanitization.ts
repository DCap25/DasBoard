/**
 * Input Sanitization and XSS Prevention Utilities
 * 
 * This module provides comprehensive input sanitization functions to prevent
 * XSS attacks, HTML injection, and other security vulnerabilities.
 * 
 * Security Features:
 * - HTML entity encoding
 * - Script tag removal
 * - Event handler attribute stripping
 * - URL validation and sanitization
 * - Safe HTML parsing with allowlist
 * - Type-safe input validation
 */

// Simple HTML entity encoding without external dependencies
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

/**
 * Escapes HTML entities to prevent XSS attacks
 * @param input - The string to escape
 * @returns Safely escaped string
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') {
    return String(input);
  }
  
  return input.replace(/[&<>"'`=/]/g, (match) => HTML_ENTITIES[match] || match);
}

/**
 * Removes or neutralizes potentially dangerous HTML tags and attributes
 * @param input - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^>\s]+/gi, '');
  
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript\s*:/gi, '');
  
  // Remove data: URLs (except safe image formats)
  sanitized = sanitized.replace(/data:(?!image\/(png|jpeg|jpg|gif|svg\+xml))[^;,]+[;,]/gi, 'data:text/plain,');
  
  // Remove dangerous tags
  const dangerousTags = [
    'script', 'object', 'embed', 'link', 'style', 'iframe', 'frame', 'frameset',
    'applet', 'meta', 'base', 'form', 'input', 'button', 'textarea', 'select'
  ];
  
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  return sanitized;
}

/**
 * Sanitizes user input for safe database storage and display
 * @param input - The user input to sanitize
 * @param options - Sanitization options
 * @returns Sanitized string
 */
export function sanitizeUserInput(
  input: string,
  options: {
    allowHtml?: boolean;
    maxLength?: number;
    trimWhitespace?: boolean;
    normalizeSpaces?: boolean;
  } = {}
): string {
  if (typeof input !== 'string') {
    return '';
  }

  const {
    allowHtml = false,
    maxLength = 10000,
    trimWhitespace = true,
    normalizeSpaces = true
  } = options;

  let sanitized = input;

  // Trim whitespace if requested
  if (trimWhitespace) {
    sanitized = sanitized.trim();
  }

  // Normalize multiple spaces to single space
  if (normalizeSpaces) {
    sanitized = sanitized.replace(/\s+/g, ' ');
  }

  // Truncate to max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  // Handle HTML based on allowHtml flag
  if (allowHtml) {
    sanitized = sanitizeHtml(sanitized);
  } else {
    sanitized = escapeHtml(sanitized);
  }

  return sanitized;
}

/**
 * Validates and sanitizes email addresses
 * @param email - The email to validate and sanitize
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  if (typeof email !== 'string') {
    return null;
  }

  // Basic sanitization
  const sanitized = email.trim().toLowerCase();
  
  // Basic email regex (more permissive than RFC compliant for UX)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(sanitized)) {
    return null;
  }

  // Additional safety checks
  if (sanitized.includes('..') || sanitized.startsWith('.') || sanitized.endsWith('.')) {
    return null;
  }

  return sanitized;
}

/**
 * Sanitizes URLs to prevent XSS via malicious links
 * @param url - The URL to sanitize
 * @returns Sanitized URL or null if invalid/dangerous
 */
export function sanitizeUrl(url: string): string | null {
  if (typeof url !== 'string') {
    return null;
  }

  const sanitized = url.trim();
  
  // Allow only safe protocols
  const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
  
  try {
    const urlObj = new URL(sanitized);
    if (!safeProtocols.includes(urlObj.protocol)) {
      return null;
    }
    return urlObj.toString();
  } catch {
    // Not a valid URL, check if it's a relative path
    if (sanitized.startsWith('/') && !sanitized.startsWith('//')) {
      // Safe relative path
      return sanitized.replace(/[<>"']/g, '');
    }
    return null;
  }
}

/**
 * Type guard to check if input is a non-empty string
 * @param value - The value to check
 * @returns True if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard to check if input is a valid email format
 * @param value - The value to check
 * @returns True if value is a valid email string
 */
export function isValidEmail(value: unknown): value is string {
  return isNonEmptyString(value) && sanitizeEmail(value) !== null;
}

/**
 * Type guard to check if input is a safe string for database storage
 * @param value - The value to check
 * @param maxLength - Maximum allowed length
 * @returns True if value is safe for storage
 */
export function isSafeString(value: unknown, maxLength: number = 1000): value is string {
  if (!isNonEmptyString(value)) {
    return false;
  }
  
  if (value.length > maxLength) {
    return false;
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /vbscript:/i,
    /data:(?!image)/i,
    /on\w+\s*=/i
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(value));
}

/**
 * Validates and sanitizes form data before submission
 * @param formData - The form data to validate
 * @param schema - Validation schema
 * @returns Sanitized and validated form data
 */
export function validateFormData<T extends Record<string, unknown>>(
  formData: T,
  schema: {
    [K in keyof T]?: {
      required?: boolean;
      type?: 'string' | 'email' | 'url' | 'number';
      maxLength?: number;
      allowHtml?: boolean;
      sanitize?: boolean;
    };
  }
): { isValid: boolean; sanitizedData: T; errors: Record<string, string> } {
  const sanitizedData = { ...formData };
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [field, rules] of Object.entries(schema)) {
    const value = formData[field];
    const fieldRules = rules || {};

    // Check required fields
    if (fieldRules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = `${field} is required`;
      isValid = false;
      continue;
    }

    // Skip validation for empty non-required fields
    if (!value && !fieldRules.required) {
      continue;
    }

    // Type-specific validation and sanitization
    switch (fieldRules.type) {
      case 'email':
        if (typeof value === 'string') {
          const sanitizedEmail = sanitizeEmail(value);
          if (sanitizedEmail === null) {
            errors[field] = `${field} must be a valid email address`;
            isValid = false;
          } else {
            (sanitizedData as any)[field] = sanitizedEmail;
          }
        }
        break;

      case 'url':
        if (typeof value === 'string') {
          const sanitizedUrl = sanitizeUrl(value);
          if (sanitizedUrl === null) {
            errors[field] = `${field} must be a valid URL`;
            isValid = false;
          } else {
            (sanitizedData as any)[field] = sanitizedUrl;
          }
        }
        break;

      case 'string':
        if (typeof value === 'string') {
          if (fieldRules.sanitize !== false) {
            const sanitized = sanitizeUserInput(value, {
              allowHtml: fieldRules.allowHtml || false,
              maxLength: fieldRules.maxLength || 1000,
              trimWhitespace: true,
              normalizeSpaces: true
            });
            (sanitizedData as any)[field] = sanitized;
          }
        }
        break;

      case 'number':
        if (typeof value === 'string') {
          const numValue = parseFloat(value);
          if (isNaN(numValue)) {
            errors[field] = `${field} must be a valid number`;
            isValid = false;
          } else {
            (sanitizedData as any)[field] = numValue;
          }
        }
        break;
    }

    // Length validation
    if (fieldRules.maxLength && typeof value === 'string' && value.length > fieldRules.maxLength) {
      errors[field] = `${field} must be less than ${fieldRules.maxLength} characters`;
      isValid = false;
    }
  }

  return { isValid, sanitizedData, errors };
}

/**
 * Creates a safe React component prop object by sanitizing all string values
 * @param props - The props object to sanitize
 * @returns Sanitized props object
 */
export function sanitizeComponentProps<T extends Record<string, unknown>>(props: T): T {
  const sanitized = { ...props };

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      (sanitized as any)[key] = sanitizeUserInput(value, {
        allowHtml: false,
        maxLength: 5000,
        trimWhitespace: true
      });
    }
  }

  return sanitized;
}

// Export security constants for external use
export const SECURITY_LIMITS = {
  MAX_INPUT_LENGTH: 10000,
  MAX_EMAIL_LENGTH: 254,
  MAX_URL_LENGTH: 2048,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 2000
} as const;

// Export common validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  PHONE: /^\+?[\d\s\-\(\)]{10,15}$/,
  ZIP_CODE: /^[\d\-\s]{5,10}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9\s]+$/,
  NO_SPECIAL_CHARS: /^[a-zA-Z0-9\s\-_]+$/
} as const;