/**
 * Integration Patch for Enhanced Promotions Security
 * 
 * This file provides integration patches to update existing promotion-related code
 * to use the enhanced security features and 500 error prevention mechanisms.
 * 
 * SECURITY PATCHES INCLUDED:
 * 1. Replace direct table queries with secure RPC functions
 * 2. Add comprehensive 500 error handling
 * 3. Integrate Finance Manager schema-based access control
 * 4. Add retry logic for transient database errors
 * 5. Implement user-friendly error messaging
 * 6. Add audit trail and monitoring integration
 * 7. Use optimistic locking for concurrent updates
 * 8. Validate inputs and sanitize data
 */

import { 
  getFinanceManagerPromotions,
  checkFinanceManagerEligibility,
  recordFinanceManagerUsage,
  getFinanceManagerUsageHistory,
  validatePromotionSystemHealth,
  enhancedPromotionUtils,
  EnhancedPromotion,
  EnhancedPromotionUsage,
  Database500Error,
  RLSPermissionError,
  ValidationError
} from './securePromotions_enhanced';

// Enhanced integration wrapper for backward compatibility
export class PromotionsIntegration {
  
  /**
   * Enhanced: Get promotions with 500 error handling for Finance Managers
   */
  static async getPromotionsForUser(
    userRole: string, 
    schemaName?: string,
    dealershipId?: number
  ): Promise<{
    promotions: EnhancedPromotion[];
    hasError: boolean;
    errorMessage?: string;
    canRetry: boolean;
  }> {
    try {
      console.log('[Promotions Integration] Getting promotions with enhanced error handling', {
        userRole,
        hasSchemaName: !!schemaName,
        hasDealershipId: !!dealershipId
      });

      let promotions: EnhancedPromotion[] = [];

      // Enhanced 500 Error Handling: Role-based promotion retrieval
      if (userRole === 'single_finance_manager') {
        promotions = await getFinanceManagerPromotions(schemaName);
      } else {
        // For other roles, use the original secure promotions with enhanced error handling
        promotions = await enhancedPromotionUtils.withRetry(
          async () => {
            const { getActivePromotions } = await import('./securePromotions');
            return await getActivePromotions();
          },
          3,
          'getPromotionsForUser'
        );
      }

      return {
        promotions,
        hasError: false,
        canRetry: false
      };

    } catch (error: any) {
      console.error('[Promotions Integration] Error getting promotions:', error);
      
      const errorMessage = enhancedPromotionUtils.createUserFriendlyErrorMessage(error);
      const canRetry = error instanceof Database500Error;

      return {
        promotions: [],
        hasError: true,
        errorMessage,
        canRetry
      };
    }
  }

  /**
   * Enhanced: Check eligibility with Finance Manager schema support
   */
  static async checkEligibilityForEntity(
    entity: {
      userRole: string;
      userId?: string;
      schemaName?: string;
      dealershipId?: number;
    },
    tier?: string
  ): Promise<{
    eligiblePromotions: EnhancedPromotion[];
    hasError: boolean;
    errorMessage?: string;
    canRetry: boolean;
  }> {
    try {
      console.log('[Promotions Integration] Checking eligibility with enhanced validation', {
        userRole: entity.userRole,
        hasUserId: !!entity.userId,
        hasSchemaName: !!entity.schemaName,
        hasDealershipId: !!entity.dealershipId,
        tier
      });

      let eligiblePromotions: EnhancedPromotion[] = [];

      // Enhanced 500 Error Handling: Entity-based eligibility checking
      if (entity.userRole === 'single_finance_manager' && entity.schemaName) {
        eligiblePromotions = await checkFinanceManagerEligibility(
          entity.schemaName,
          tier as any || 'finance_manager_only'
        );
      } else {
        // For other entities, use the original secure function with enhanced error handling
        eligiblePromotions = await enhancedPromotionUtils.withRetry(
          async () => {
            const { checkPromotionEligibility } = await import('./securePromotions');
            return await checkPromotionEligibility({
              user_id: entity.userId,
              schema_name: entity.schemaName,
              dealership_id: entity.dealershipId
            }, tier as any);
          },
          3,
          'checkEligibilityForEntity'
        );
      }

      return {
        eligiblePromotions,
        hasError: false,
        canRetry: false
      };

    } catch (error: any) {
      console.error('[Promotions Integration] Error checking eligibility:', error);
      
      const errorMessage = enhancedPromotionUtils.createUserFriendlyErrorMessage(error);
      const canRetry = error instanceof Database500Error;

      return {
        eligiblePromotions: [],
        hasError: true,
        errorMessage,
        canRetry
      };
    }
  }

  /**
   * Enhanced: Record usage with Finance Manager schema support
   */
  static async recordUsageForEntity(
    promotionId: string,
    entity: {
      userRole: string;
      userId?: string;
      schemaName?: string;
      dealershipId?: number;
    },
    usageData: {
      originalAmount?: number;
      discountedAmount?: number;
      usageType?: string;
    } = {}
  ): Promise<{
    usageId?: string;
    hasError: boolean;
    errorMessage?: string;
    canRetry: boolean;
  }> {
    try {
      console.log('[Promotions Integration] Recording usage with enhanced validation', {
        promotionId: promotionId.substring(0, 8) + '...',
        userRole: entity.userRole,
        hasUserId: !!entity.userId,
        hasSchemaName: !!entity.schemaName,
        hasDealershipId: !!entity.dealershipId,
        usageType: usageData.usageType || 'signup'
      });

      let usageId: string;

      // Enhanced 500 Error Handling: Entity-based usage recording
      if (entity.userRole === 'single_finance_manager' && entity.schemaName) {
        const result = await recordFinanceManagerUsage(
          promotionId,
          entity.schemaName,
          {
            originalAmount: usageData.originalAmount,
            discountedAmount: usageData.discountedAmount,
            usageType: usageData.usageType as any || 'signup'
          }
        );
        usageId = result.usage_id;
      } else {
        // For other entities, use the original secure function with enhanced error handling
        const result = await enhancedPromotionUtils.withRetry(
          async () => {
            const { recordPromotionUsage } = await import('./securePromotions');
            return await recordPromotionUsage({
              promotion_id: promotionId,
              user_id: entity.userId,
              schema_name: entity.schemaName,
              dealership_id: entity.dealershipId,
              usage_type: usageData.usageType as any,
              original_amount: usageData.originalAmount,
              discounted_amount: usageData.discountedAmount
            });
          },
          3,
          'recordUsageForEntity'
        );
        usageId = result.usage_id;
      }

      return {
        usageId,
        hasError: false,
        canRetry: false
      };

    } catch (error: any) {
      console.error('[Promotions Integration] Error recording usage:', error);
      
      const errorMessage = enhancedPromotionUtils.createUserFriendlyErrorMessage(error);
      const canRetry = error instanceof Database500Error;

      return {
        hasError: true,
        errorMessage,
        canRetry
      };
    }
  }

  /**
   * Enhanced: Get usage history with Finance Manager schema support
   */
  static async getUsageHistoryForEntity(
    entity: {
      userRole: string;
      userId?: string;
      schemaName?: string;
      dealershipId?: number;
    }
  ): Promise<{
    usageHistory: EnhancedPromotionUsage[];
    hasError: boolean;
    errorMessage?: string;
    canRetry: boolean;
  }> {
    try {
      console.log('[Promotions Integration] Getting usage history with enhanced error handling', {
        userRole: entity.userRole,
        hasUserId: !!entity.userId,
        hasSchemaName: !!entity.schemaName,
        hasDealershipId: !!entity.dealershipId
      });

      let usageHistory: EnhancedPromotionUsage[] = [];

      // Enhanced 500 Error Handling: Entity-based usage history retrieval
      if (entity.userRole === 'single_finance_manager' && entity.schemaName) {
        usageHistory = await getFinanceManagerUsageHistory(entity.schemaName);
      } else {
        // For other entities, use the original secure function with enhanced error handling
        usageHistory = await enhancedPromotionUtils.withRetry(
          async () => {
            const { getUserPromotionUsage } = await import('./securePromotions');
            return await getUserPromotionUsage({
              user_id: entity.userId,
              schema_name: entity.schemaName,
              dealership_id: entity.dealershipId
            });
          },
          3,
          'getUsageHistoryForEntity'
        );
      }

      return {
        usageHistory,
        hasError: false,
        canRetry: false
      };

    } catch (error: any) {
      console.error('[Promotions Integration] Error getting usage history:', error);
      
      const errorMessage = enhancedPromotionUtils.createUserFriendlyErrorMessage(error);
      const canRetry = error instanceof Database500Error;

      return {
        usageHistory: [],
        hasError: true,
        errorMessage,
        canRetry
      };
    }
  }

  /**
   * Enhanced: Health check for promotion system monitoring
   */
  static async checkSystemHealth(): Promise<{
    isHealthy: boolean;
    checks: Array<{ name: string; status: string; details: string }>;
    hasError: boolean;
    errorMessage?: string;
  }> {
    try {
      console.log('[Promotions Integration] Running system health check');

      const healthResult = await validatePromotionSystemHealth();

      return {
        isHealthy: healthResult.isHealthy,
        checks: healthResult.checks,
        hasError: false
      };

    } catch (error: any) {
      console.error('[Promotions Integration] Error checking system health:', error);
      
      const errorMessage = enhancedPromotionUtils.createUserFriendlyErrorMessage(error);

      return {
        isHealthy: false,
        checks: [],
        hasError: true,
        errorMessage
      };
    }
  }

  /**
   * Enhanced: Utility function to extract schema name from user context
   */
  static extractSchemaName(user: any): string | undefined {
    try {
      // Try various sources for schema name
      if (user?.user_metadata?.schema_name) {
        return enhancedPromotionUtils.sanitizeSchemaName(user.user_metadata.schema_name);
      }
      
      if (user?.app_metadata?.schema_name) {
        return enhancedPromotionUtils.sanitizeSchemaName(user.app_metadata.schema_name);
      }
      
      // Generate schema name from email for Finance Managers
      if (user?.email && (user.email.includes('finance') || user.email.includes('testfinance'))) {
        const emailPart = user.email.split('@')[0];
        return enhancedPromotionUtils.sanitizeSchemaName(`finance_${emailPart}`);
      }
      
      return undefined;
    } catch (error) {
      console.error('[Promotions Integration] Error extracting schema name:', error);
      return undefined;
    }
  }

  /**
   * Enhanced: Retry wrapper for promotion operations with exponential backoff
   */
  static async withRetryWrapper<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxAttempts: number = 3
  ): Promise<{
    data?: T;
    hasError: boolean;
    errorMessage?: string;
    canRetry: boolean;
    attemptsUsed: number;
  }> {
    let lastError: any;
    let attemptsUsed = 0;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      attemptsUsed = attempt;
      
      try {
        const data = await operation();
        return {
          data,
          hasError: false,
          canRetry: false,
          attemptsUsed
        };
      } catch (error: any) {
        lastError = error;
        
        // Check if this is a retryable error
        const canRetry = error instanceof Database500Error || 
                        error?.message?.includes('500') ||
                        error?.message?.includes('timeout') ||
                        error?.message?.includes('connection');
        
        if (!canRetry || attempt === maxAttempts) {
          break;
        }
        
        // Exponential backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000) + Math.random() * 1000;
        console.log(`[Promotions Integration] Retrying ${operationName} in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    const errorMessage = enhancedPromotionUtils.createUserFriendlyErrorMessage(lastError);
    const canRetry = lastError instanceof Database500Error;

    return {
      hasError: true,
      errorMessage,
      canRetry,
      attemptsUsed
    };
  }
}

// Export enhanced integration for easy adoption
export default PromotionsIntegration;

// Export utility functions for direct use
export {
  enhancedPromotionUtils,
  Database500Error,
  RLSPermissionError,
  ValidationError
};