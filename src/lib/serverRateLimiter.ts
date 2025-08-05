/**
 * Server-side Rate Limiter Integration
 * Communicates with Supabase Edge Function for rate limiting
 */

import { supabase } from './supabaseClient';

interface RateLimitResponse {
  limited: boolean;
  retryAfterMs?: number;
  remainingAttempts?: number;
}

class ServerRateLimiter {
  private static readonly EDGE_FUNCTION_URL = '/functions/v1/rate-limiter';
  
  /**
   * Check rate limit with server
   */
  static async checkRateLimit(
    action: string,
    identifier: string
  ): Promise<RateLimitResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('rate-limiter', {
        body: {
          action,
          identifier,
        },
      });

      if (error) {
        console.error('Rate limit check error:', error);
        // Fallback to allow request if rate limiter is unavailable
        return { limited: false };
      }

      return data as RateLimitResponse;
    } catch (error) {
      console.error('Rate limiter communication error:', error);
      // Fallback to allow request if rate limiter is unavailable
      return { limited: false };
    }
  }

  /**
   * Check and enforce rate limit
   */
  static async enforceRateLimit(
    action: string,
    identifier: string
  ): Promise<{ allowed: boolean; message?: string }> {
    const result = await this.checkRateLimit(action, identifier);

    if (result.limited) {
      const waitTimeMinutes = Math.ceil((result.retryAfterMs || 0) / 60000);
      return {
        allowed: false,
        message: `Too many attempts. Please try again in ${waitTimeMinutes} minute${
          waitTimeMinutes !== 1 ? 's' : ''
        }.`,
      };
    }

    return {
      allowed: true,
    };
  }

  /**
   * Get identifier for rate limiting
   */
  static getIdentifier(userId?: string): string {
    if (userId) return userId;

    // Use a combination of IP (if available) and session ID
    const sessionId = sessionStorage.getItem('client_id') || 
      'anon_' + Math.random().toString(36).substr(2, 9);
    
    if (!sessionStorage.getItem('client_id')) {
      sessionStorage.setItem('client_id', sessionId);
    }

    return sessionId;
  }
}

export default ServerRateLimiter;