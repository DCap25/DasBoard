import { useState, useEffect, useCallback } from 'react';
import {
  getDashboardData,
  loadDealsFromStorage,
  aggregateDealsForDashboard,
} from '../utils/dealMapper';

interface UseDealsDataOptions {
  dashboardType?: string;
  userRole?: string;
  salespersonId?: string;
  timePeriod?: string;
  includeInactive?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseDealsDataReturn {
  dealData: any;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  setTimePeriod: (period: string) => void;
}

/**
 * Custom hook for managing deal data in dashboard components
 */
export const useDealsData = (options: UseDealsDataOptions = {}): UseDealsDataReturn => {
  const {
    dashboardType = 'sales',
    userRole = 'salesperson',
    salespersonId = null,
    timePeriod: initialTimePeriod = 'this-month',
    includeInactive = false,
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
  } = options;

  const [dealData, setDealData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState(initialTimePeriod);

  const loadDealData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log(`[useDealsData] Loading deals for ${dashboardType} dashboard`, {
        userRole,
        salespersonId,
        timePeriod,
        includeInactive,
      });

      const data = getDashboardData(dashboardType, {
        userRole,
        salespersonId,
        timePeriod,
        includeInactive,
      });

      setDealData(data);

      if (data.error) {
        console.warn('[useDealsData] Deal data warning:', data.error);
        setError(`Warning: ${data.error}`);
      }

      console.log(
        `[useDealsData] Loaded ${data.deals?.length || 0} deals with metrics:`,
        data.metrics
      );
    } catch (err) {
      console.error('[useDealsData] Error loading deal data:', err);
      setError('Failed to load deal data');

      // Provide empty fallback data
      setDealData({
        deals: [],
        metrics: {
          totalDeals: 0,
          fundedDeals: 0,
          pendingDeals: 0,
          newVehicleDeals: 0,
          usedVehicleDeals: 0,
          totalFrontGross: 0,
          totalBackGross: 0,
          totalGross: 0,
          avgFrontGross: 0,
          avgBackGross: 0,
          totalPVR: 0,
          avgPVR: 0,
        },
        error: err instanceof Error ? err.message : 'Unknown error',
        lastUpdated: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, [dashboardType, userRole, salespersonId, timePeriod, includeInactive]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadDealData();
  }, [loadDealData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('[useDealsData] Auto-refreshing deal data');
      loadDealData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadDealData]);

  // Listen for localStorage changes (when new deals are added)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'financeDeals' || e.key === 'singleFinanceDeals') {
        console.log('[useDealsData] localStorage changed, refreshing deal data');
        loadDealData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadDealData]);

  return {
    dealData,
    loading,
    error,
    refresh: loadDealData,
    setTimePeriod,
  };
};

/**
 * Hook specifically for sales dashboard data
 */
export const useSalesDealsData = (salespersonId?: string, timePeriod = 'this-month') => {
  return useDealsData({
    dashboardType: 'sales',
    userRole: 'salesperson',
    salespersonId,
    timePeriod,
    includeInactive: false,
    autoRefresh: true,
  });
};

/**
 * Hook specifically for finance dashboard data
 */
export const useFinanceDealsData = (timePeriod = 'this-month') => {
  return useDealsData({
    dashboardType: 'finance',
    userRole: 'finance_manager',
    timePeriod,
    includeInactive: false,
    autoRefresh: true,
  });
};

/**
 * Hook specifically for single finance dashboard data
 */
export const useSingleFinanceDealsData = (timePeriod = 'this-month') => {
  return useDealsData({
    dashboardType: 'single-finance',
    userRole: 'single_finance_manager',
    timePeriod,
    includeInactive: false,
    autoRefresh: true,
  });
};
