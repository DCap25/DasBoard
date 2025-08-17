/**
 * Safe Rendering Components and Utilities
 * 
 * This module provides React components and utilities for safely rendering
 * user-generated content while preventing XSS attacks and other security issues.
 * 
 * Security Features:
 * - Safe HTML rendering with content sanitization
 * - Type-safe prop validation
 * - Automatic XSS prevention
 * - Content Security Policy compliance
 * - Safe URL handling for links and images
 */

import React, { ReactNode, HTMLAttributes, AnchorHTMLAttributes, ImgHTMLAttributes } from 'react';
import { 
  sanitizeHtml, 
  escapeHtml, 
  sanitizeUrl, 
  sanitizeUserInput, 
  isNonEmptyString, 
  isSafeString 
} from './inputSanitization';

/**
 * Props for SafeText component
 */
interface SafeTextProps {
  children: unknown;
  allowHtml?: boolean;
  maxLength?: number;
  className?: string;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  fallback?: ReactNode;
}

/**
 * Safely renders text content with automatic sanitization
 * Prevents XSS attacks by escaping HTML entities or sanitizing allowed HTML
 */
export function SafeText({ 
  children, 
  allowHtml = false, 
  maxLength = 1000, 
  className, 
  as: Component = 'span',
  fallback = null 
}: SafeTextProps) {
  // Type guard to ensure we have a string
  if (!isNonEmptyString(children)) {
    return <>{fallback}</>;
  }

  // Additional safety check
  if (!isSafeString(children, maxLength)) {
    console.warn('[SafeText] Potentially unsafe content detected, using fallback');
    return <>{fallback}</>;
  }

  const sanitizedContent = sanitizeUserInput(children, {
    allowHtml,
    maxLength,
    trimWhitespace: true,
    normalizeSpaces: true
  });

  if (allowHtml && sanitizedContent) {
    // Use sanitized HTML with dangerouslySetInnerHTML as last resort
    return (
      <Component 
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    );
  }

  // Safe text rendering without HTML
  return <Component className={className}>{sanitizedContent}</Component>;
}

/**
 * Props for SafeLink component
 */
interface SafeLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: ReactNode;
  external?: boolean;
  allowedDomains?: string[];
  fallback?: ReactNode;
}

/**
 * Safely renders links with URL validation and security attributes
 * Prevents XSS attacks through malicious URLs
 */
export function SafeLink({ 
  href, 
  children, 
  external = false, 
  allowedDomains = [],
  fallback = null,
  ...props 
}: SafeLinkProps) {
  const sanitizedUrl = sanitizeUrl(href);
  
  if (!sanitizedUrl) {
    console.warn('[SafeLink] Invalid or unsafe URL detected:', href);
    return <>{fallback || children}</>;
  }

  // Additional domain validation for external links
  if (external && allowedDomains.length > 0) {
    try {
      const url = new URL(sanitizedUrl);
      const isAllowed = allowedDomains.some(domain => 
        url.hostname === domain || url.hostname.endsWith(`.${domain}`)
      );
      
      if (!isAllowed) {
        console.warn('[SafeLink] Domain not in allowlist:', url.hostname);
        return <>{fallback || children}</>;
      }
    } catch {
      console.warn('[SafeLink] Failed to parse URL for domain validation:', sanitizedUrl);
      return <>{fallback || children}</>;
    }
  }

  const linkProps: AnchorHTMLAttributes<HTMLAnchorElement> = {
    ...props,
    href: sanitizedUrl,
  };

  // Add security attributes for external links
  if (external) {
    linkProps.target = '_blank';
    linkProps.rel = 'noopener noreferrer';
  }

  return <a {...linkProps}>{children}</a>;
}

/**
 * Props for SafeImage component
 */
interface SafeImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string;
  alt: string;
  allowedDomains?: string[];
  fallback?: ReactNode;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Safely renders images with URL validation and security attributes
 * Prevents XSS attacks through malicious image URLs
 */
export function SafeImage({ 
  src, 
  alt, 
  allowedDomains = [],
  fallback = null,
  maxWidth,
  maxHeight,
  style,
  ...props 
}: SafeImageProps) {
  const sanitizedSrc = sanitizeUrl(src);
  const sanitizedAlt = sanitizeUserInput(alt, { allowHtml: false, maxLength: 200 });
  
  if (!sanitizedSrc) {
    console.warn('[SafeImage] Invalid or unsafe image URL detected:', src);
    return <>{fallback}</>;
  }

  // Validate image domains if specified
  if (allowedDomains.length > 0) {
    try {
      const url = new URL(sanitizedSrc);
      const isAllowed = allowedDomains.some(domain => 
        url.hostname === domain || url.hostname.endsWith(`.${domain}`)
      );
      
      if (!isAllowed) {
        console.warn('[SafeImage] Image domain not in allowlist:', url.hostname);
        return <>{fallback}</>;
      }
    } catch {
      // Relative URLs are allowed
      if (!sanitizedSrc.startsWith('/')) {
        console.warn('[SafeImage] Failed to parse image URL:', sanitizedSrc);
        return <>{fallback}</>;
      }
    }
  }

  // Combine styles with size limits
  const safeStyle: React.CSSProperties = {
    ...style,
    ...(maxWidth && { maxWidth }),
    ...(maxHeight && { maxHeight }),
  };

  return (
    <img 
      {...props}
      src={sanitizedSrc}
      alt={sanitizedAlt}
      style={safeStyle}
      // Add security attributes
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
    />
  );
}

/**
 * Props for SafeHtml component
 */
interface SafeHtmlProps {
  html: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
  className?: string;
  maxLength?: number;
  fallback?: ReactNode;
}

/**
 * Safely renders HTML content with strict sanitization
 * Use only when absolutely necessary and with trusted content
 */
export function SafeHtml({ 
  html, 
  allowedTags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
  allowedAttributes = ['class'],
  className,
  maxLength = 5000,
  fallback = null 
}: SafeHtmlProps) {
  if (!isNonEmptyString(html)) {
    return <>{fallback}</>;
  }

  if (html.length > maxLength) {
    console.warn('[SafeHtml] Content exceeds maximum length, truncating');
    html = html.substring(0, maxLength);
  }

  // Sanitize HTML with allowed tags and attributes
  let sanitized = sanitizeHtml(html);
  
  // Additional filtering for allowed tags
  if (allowedTags.length > 0) {
    const tagRegex = /<\/?(\w+)[^>]*>/g;
    sanitized = sanitized.replace(tagRegex, (match, tagName) => {
      if (!allowedTags.includes(tagName.toLowerCase())) {
        return '';
      }
      return match;
    });
  }

  // Filter attributes to only allowed ones
  if (allowedAttributes.length > 0) {
    const attrRegex = /(\w+)=["'][^"']*["']/g;
    sanitized = sanitized.replace(attrRegex, (match, attrName) => {
      if (!allowedAttributes.includes(attrName.toLowerCase())) {
        return '';
      }
      return match;
    });
  }

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}

/**
 * Higher-order component that adds input sanitization to form components
 */
export function withInputSanitization<T extends { value?: string; onChange?: (value: string) => void }>(
  Component: React.ComponentType<T>
) {
  return function SafeInputComponent(props: T) {
    const { value, onChange, ...otherProps } = props;

    const handleChange = (newValue: string) => {
      if (onChange) {
        const sanitized = sanitizeUserInput(newValue, {
          allowHtml: false,
          maxLength: 1000,
          trimWhitespace: false, // Don't trim while typing
          normalizeSpaces: false // Don't normalize while typing
        });
        onChange(sanitized);
      }
    };

    const sanitizedValue = value ? sanitizeUserInput(value, {
      allowHtml: false,
      maxLength: 1000,
      trimWhitespace: false,
      normalizeSpaces: false
    }) : value;

    return (
      <Component 
        {...(otherProps as T)}
        value={sanitizedValue}
        onChange={handleChange}
      />
    );
  };
}

/**
 * Type guard component that validates children before rendering
 */
interface SafeRenderProps {
  children: unknown;
  validator: (value: unknown) => boolean;
  fallback?: ReactNode;
  errorMessage?: string;
}

export function SafeRender({ children, validator, fallback = null, errorMessage }: SafeRenderProps) {
  if (!validator(children)) {
    if (errorMessage) {
      console.warn('[SafeRender]', errorMessage);
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Safe wrapper for dynamic content rendering
 */
interface DynamicContentProps {
  content: unknown;
  type: 'text' | 'html' | 'markdown';
  maxLength?: number;
  className?: string;
  fallback?: ReactNode;
}

export function DynamicContent({ 
  content, 
  type, 
  maxLength = 2000, 
  className, 
  fallback = null 
}: DynamicContentProps) {
  if (!isNonEmptyString(content)) {
    return <>{fallback}</>;
  }

  switch (type) {
    case 'text':
      return (
        <SafeText 
          className={className}
          maxLength={maxLength}
          fallback={fallback}
        >
          {content}
        </SafeText>
      );

    case 'html':
      return (
        <SafeHtml 
          html={content}
          className={className}
          maxLength={maxLength}
          fallback={fallback}
        />
      );

    case 'markdown':
      // For now, treat markdown as text (you could add a markdown parser later)
      return (
        <SafeText 
          className={className}
          maxLength={maxLength}
          fallback={fallback}
        >
          {content}
        </SafeText>
      );

    default:
      return <>{fallback}</>;
  }
}

/**
 * Utility function to create safe event handlers
 */
export function createSafeEventHandler<T extends Event>(
  handler: (event: T, sanitizedData?: Record<string, string>) => void,
  sanitizeFormData: boolean = true
) {
  return (event: T) => {
    try {
      let sanitizedData: Record<string, string> | undefined;

      if (sanitizeFormData && event.target instanceof HTMLFormElement) {
        const formData = new FormData(event.target);
        sanitizedData = {};

        for (const [key, value] of formData.entries()) {
          if (typeof value === 'string') {
            sanitizedData[key] = sanitizeUserInput(value);
          }
        }
      }

      handler(event, sanitizedData);
    } catch (error) {
      console.error('[SafeEventHandler] Error in event handler:', error);
    }
  };
}

// Export utility functions for external use
export const safeRenderingUtils = {
  sanitizeProps: (props: Record<string, unknown>) => {
    const sanitized = { ...props };
    for (const [key, value] of Object.entries(sanitized)) {
      if (typeof value === 'string') {
        sanitized[key] = sanitizeUserInput(value);
      }
    }
    return sanitized;
  },

  validateContent: (content: unknown, type: 'text' | 'email' | 'url'): boolean => {
    if (!isNonEmptyString(content)) return false;

    switch (type) {
      case 'text':
        return isSafeString(content);
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content);
      case 'url':
        return sanitizeUrl(content) !== null;
      default:
        return false;
    }
  },

  createSecureProps: (baseProps: Record<string, unknown>, overrides?: Record<string, unknown>) => {
    const sanitizedBase = safeRenderingUtils.sanitizeProps(baseProps);
    const sanitizedOverrides = overrides ? safeRenderingUtils.sanitizeProps(overrides) : {};
    
    return {
      ...sanitizedBase,
      ...sanitizedOverrides,
      // Always include security-related props
      'data-secure': 'true',
      // Prevent common XSS vectors
      onError: undefined,
      onLoad: undefined,
    };
  }
};