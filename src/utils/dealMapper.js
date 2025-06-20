/**
 * Deal Data Mapper Utility
 * Maps deal data from DealLogPage form to dashboard-compatible format
 */

/**
 * Maps vehicle type codes to readable names
 * @param {string} vehicleType - Vehicle type code ('N', 'U', 'C')
 * @returns {string} Readable vehicle type name
 */
export const mapVehicleType = vehicleType => {
  switch (vehicleType) {
    case 'N':
      return 'New';
    case 'U':
      return 'Used';
    case 'C':
      return 'CPO';
    default:
      return 'Unknown';
  }
};

/**
 * Calculates F&I product mix from deal data
 * @param {Object} deal - Deal object
 * @returns {Array} Array of products with non-zero values
 */
export const calculateProductMix = deal => {
  const products = [];

  // Product mappings with profits
  const productMap = [
    { name: 'VSC/Extended Warranty', profit: deal.vscProfit || 0 },
    { name: 'GAP Insurance', profit: deal.gapProfit || 0 },
    { name: 'Paint Protection', profit: deal.appearanceProfit || 0 },
    { name: 'Tire & Wheel', profit: deal.tireAndWheelProfit || 0 },
    { name: 'Prepaid Maintenance', profit: deal.ppmProfit || 0 },
    { name: 'Other Products', profit: deal.otherProfit || 0 },
  ];

  productMap.forEach(product => {
    const profit = parseFloat(product.profit) || 0;
    if (profit > 0) {
      products.push({
        name: product.name,
        profit: profit,
      });
    }
  });

  return products;
};

/**
 * Handles split deal credit allocation
 * @param {Object} deal - Deal object
 * @param {string} targetSalespersonId - ID of salesperson to calculate credit for
 * @returns {Object} Credit allocation details
 */
export const calculateSplitDealCredit = (deal, targetSalespersonId) => {
  if (!deal.isSplitDeal) {
    return {
      hasCredit: deal.primarySalespersonId === targetSalespersonId,
      creditPercentage: deal.primarySalespersonId === targetSalespersonId ? 100 : 0,
      splitWith: null,
    };
  }

  // For split deals, 50/50 credit allocation
  const hasCredit =
    deal.primarySalespersonId === targetSalespersonId ||
    deal.secondarySalespersonId === targetSalespersonId;

  return {
    hasCredit,
    creditPercentage: hasCredit ? 50 : 0,
    splitWith:
      deal.primarySalespersonId === targetSalespersonId
        ? deal.secondarySalespersonId
        : deal.primarySalespersonId,
  };
};

/**
 * Determines if deal should count toward various metrics
 * @param {Object} deal - Deal object
 * @returns {Object} Boolean flags for different metrics
 */
export const getDealMetricFlags = deal => {
  const status = deal.status || deal.dealStatus;

  return {
    countsForSold: status === 'Funded',
    countsForBooked: status === 'Funded',
    countsForTracking: status === 'Pending',
    countsForPVR: status === 'Funded' || status === 'Pending',
    excludeFromMetrics: status === 'Unwound' || status === 'Dead Deal',
  };
};

/**
 * Main mapping function - transforms deal data for dashboard consumption
 * @param {Object} rawDeal - Raw deal from localStorage or API
 * @param {Object} options - Options for mapping
 * @returns {Object} Mapped deal data
 */
export const mapDealData = (rawDeal, options = {}) => {
  const { dashboardType = 'sales', userRole = 'salesperson', salespersonId = null } = options;

  try {
    // Handle different deal data formats (from DealLogPage vs legacy format)
    const deal = {
      // Basic deal info
      id: rawDeal.id || rawDeal.dealNumber || `D${Date.now()}`,
      dealNumber: rawDeal.dealNumber || rawDeal.id,
      stockNumber: rawDeal.stockNumber || '',
      vinLast8: rawDeal.vinLast8 || rawDeal.vin || '',
      vehicleType: rawDeal.vehicleType || 'U',
      lastName: rawDeal.lastName || rawDeal.customer || '',
      dealDate: rawDeal.dealDate || rawDeal.saleDate || new Date().toISOString().split('T')[0],

      // Financial data
      frontEndGross: parseFloat(rawDeal.frontEndGross) || 0,
      backEndGross: parseFloat(rawDeal.backEndGross) || parseFloat(rawDeal.profit) || 0,
      totalGross: parseFloat(rawDeal.totalGross) || parseFloat(rawDeal.amount) || 0,

      // Product profits
      vscProfit: parseFloat(rawDeal.vscProfit) || 0,
      ppmProfit: parseFloat(rawDeal.ppmProfit) || 0,
      gapProfit: parseFloat(rawDeal.gapProfit) || 0,
      tireAndWheelProfit: parseFloat(rawDeal.tireAndWheelProfit) || 0,
      appearanceProfit: parseFloat(rawDeal.appearanceProfit) || 0,
      otherProfit: parseFloat(rawDeal.otherProfit) || 0,
      reserveFlat: parseFloat(rawDeal.reserveFlat) || 0,

      // Deal details
      dealType: rawDeal.dealType || 'Finance',
      dealStatus: rawDeal.dealStatus || rawDeal.status || 'Pending',
      lender: rawDeal.lender || '',
      outsideFunding: rawDeal.outsideFunding || false,

      // Salesperson info
      primarySalespersonId: rawDeal.salespersonId || rawDeal.primarySalespersonId || '',
      secondarySalespersonId: rawDeal.secondSalespersonId || rawDeal.secondarySalespersonId || '',
      isSplitDeal: rawDeal.isSplitDeal || false,
      salesManagerId: rawDeal.salesManagerId || '',

      // Legacy fields for compatibility
      products: rawDeal.products || [],
      salesperson: rawDeal.salesperson || '',
    };

    // Calculate derived values
    const vehicleTypeDisplay = mapVehicleType(deal.vehicleType);
    const productMix = calculateProductMix(deal);
    const metricFlags = getDealMetricFlags(deal);

    // Calculate split deal credit if salespersonId is provided
    const splitCredit = salespersonId
      ? calculateSplitDealCredit(deal, salespersonId)
      : { hasCredit: true, creditPercentage: 100, splitWith: null };

    // Adjust profits based on split deal percentage
    const adjustedFrontGross = deal.frontEndGross * (splitCredit.creditPercentage / 100);
    const adjustedBackGross = deal.backEndGross * (splitCredit.creditPercentage / 100);
    const adjustedTotalGross = deal.totalGross * (splitCredit.creditPercentage / 100);

    // Return mapped deal object
    return {
      // Original data
      raw: rawDeal,

      // Basic info
      id: deal.id,
      dealNumber: deal.dealNumber,
      stockNumber: deal.stockNumber,
      vinLast8: deal.vinLast8,
      vehicleType: deal.vehicleType,
      vehicleTypeDisplay,
      lastName: deal.lastName,
      dealDate: deal.dealDate,

      // Financial data (original)
      frontEndGross: deal.frontEndGross,
      backEndGross: deal.backEndGross,
      totalGross: deal.totalGross,

      // Financial data (adjusted for split deals)
      adjustedFrontGross,
      adjustedBackGross,
      adjustedTotalGross,

      // Product details
      productMix,
      productsPerDeal: productMix.length,

      // Individual product profits
      vscProfit: deal.vscProfit,
      ppmProfit: deal.ppmProfit,
      gapProfit: deal.gapProfit,
      tireAndWheelProfit: deal.tireAndWheelProfit,
      appearanceProfit: deal.appearanceProfit,
      otherProfit: deal.otherProfit,
      reserveFlat: deal.reserveFlat,

      // Deal metadata
      dealType: deal.dealType,
      dealStatus: deal.dealStatus,
      lender: deal.lender,
      outsideFunding: deal.outsideFunding,

      // Salesperson info
      primarySalespersonId: deal.primarySalespersonId,
      secondarySalespersonId: deal.secondarySalespersonId,
      isSplitDeal: deal.isSplitDeal,
      salesManagerId: deal.salesManagerId,
      splitCredit,

      // Metric flags
      metricFlags,

      // Convenience fields for dashboards
      isNew: deal.vehicleType === 'N',
      isUsed: deal.vehicleType === 'U' || deal.vehicleType === 'C',
      isFunded: metricFlags.countsForSold,
      isPending: metricFlags.countsForTracking,
      isActive: !metricFlags.excludeFromMetrics,

      // PVR calculation (Per Vehicle Retailed)
      pvr: productMix.length > 0 ? Math.round(deal.backEndGross / productMix.length) : 0,

      // Legacy compatibility
      customer: deal.lastName,
      vehicle: `${vehicleTypeDisplay} - Stock #${deal.stockNumber}`,
      vin: deal.vinLast8,
      saleDate: deal.dealDate,
      salesperson: deal.salesperson,
      amount: deal.totalGross,
      status: deal.dealStatus,
      products: deal.products || productMix.map(p => p.name),
      profit: deal.backEndGross,
      created_at: rawDeal.created_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error mapping deal data:', error);
    // Return a safe fallback object
    return {
      id: rawDeal.id || 'unknown',
      dealNumber: rawDeal.id || 'unknown',
      error: 'Failed to map deal data',
      raw: rawDeal,
      isActive: false,
      metricFlags: {
        countsForSold: false,
        countsForBooked: false,
        countsForTracking: false,
        countsForPVR: false,
        excludeFromMetrics: true,
      },
    };
  }
};

/**
 * Filters and aggregates deals for dashboard display
 * @param {Array} deals - Array of raw deals
 * @param {Object} options - Filter and aggregation options
 * @returns {Object} Filtered and aggregated deal data
 */
export const aggregateDealsForDashboard = (deals, options = {}) => {
  const {
    dashboardType = 'sales',
    userRole = 'salesperson',
    salespersonId = null,
    timePeriod = 'this-month',
    includeInactive = false,
  } = options;

  try {
    // Map all deals
    const mappedDeals = deals.map(deal =>
      mapDealData(deal, { dashboardType, userRole, salespersonId })
    );

    // Filter deals based on options
    let filteredDeals = mappedDeals.filter(deal => {
      // Filter out inactive deals unless specified
      if (!includeInactive && !deal.isActive) return false;

      // Filter by salesperson if specified
      if (salespersonId && !deal.splitCredit.hasCredit) return false;

      return true;
    });

    // Time period filtering
    if (timePeriod !== 'all-time') {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      filteredDeals = filteredDeals.filter(deal => {
        const dealDate = new Date(deal.dealDate);

        switch (timePeriod) {
          case 'this-month':
            return dealDate.getFullYear() === currentYear && dealDate.getMonth() === currentMonth;
          case 'last-month':
            const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            return dealDate.getFullYear() === lastMonthYear && dealDate.getMonth() === lastMonth;
          case 'ytd':
            return dealDate.getFullYear() === currentYear;
          case 'last-year':
            return dealDate.getFullYear() === currentYear - 1;
          default:
            return true;
        }
      });
    }

    // Calculate aggregations
    const totalDeals = filteredDeals.length;
    const fundedDeals = filteredDeals.filter(d => d.isFunded).length;
    const pendingDeals = filteredDeals.filter(d => d.isPending).length;
    const newVehicleDeals = filteredDeals.filter(d => d.isNew).length;
    const usedVehicleDeals = filteredDeals.filter(d => d.isUsed).length;

    const totalFrontGross = filteredDeals.reduce((sum, d) => sum + d.adjustedFrontGross, 0);
    const totalBackGross = filteredDeals.reduce((sum, d) => sum + d.adjustedBackGross, 0);
    const totalGross = filteredDeals.reduce((sum, d) => sum + d.adjustedTotalGross, 0);

    const avgFrontGross = totalDeals > 0 ? totalFrontGross / totalDeals : 0;
    const avgBackGross = totalDeals > 0 ? totalBackGross / totalDeals : 0;
    const totalPVR = filteredDeals.reduce((sum, d) => sum + d.pvr, 0);

    return {
      deals: filteredDeals,
      metrics: {
        totalDeals,
        fundedDeals,
        pendingDeals,
        newVehicleDeals,
        usedVehicleDeals,
        totalFrontGross,
        totalBackGross,
        totalGross,
        avgFrontGross,
        avgBackGross,
        totalPVR,
        avgPVR: totalDeals > 0 ? totalPVR / totalDeals : 0,
      },
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error aggregating deals for dashboard:', error);
    return {
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
      error: error.message,
      lastUpdated: new Date().toISOString(),
    };
  }
};

/**
 * Loads deals from localStorage with error handling
 * @param {string} storageKey - localStorage key to read from
 * @returns {Array} Array of deals or empty array on error
 */
export const loadDealsFromStorage = (storageKey = 'financeDeals') => {
  try {
    const dealsJson = localStorage.getItem(storageKey);
    if (!dealsJson) return [];

    const deals = JSON.parse(dealsJson);
    return Array.isArray(deals) ? deals : [];
  } catch (error) {
    console.error('Error loading deals from localStorage:', error);
    return [];
  }
};

/**
 * Gets deal data formatted for specific dashboard types
 * @param {string} dashboardType - Type of dashboard ('sales', 'finance', 'single-finance', etc.)
 * @param {Object} options - Additional options
 * @returns {Object} Dashboard-specific deal data
 */
export const getDashboardData = (dashboardType, options = {}) => {
  // Determine storage key based on dashboard type
  let rawDeals = [];

  switch (dashboardType) {
    case 'single-finance':
      // Try both possible keys for single finance deals
      const singleFinanceDeals = loadDealsFromStorage('singleFinanceDeals');
      const fallbackDeals = loadDealsFromStorage('financeDeals');
      rawDeals = singleFinanceDeals.length > 0 ? singleFinanceDeals : fallbackDeals;
      break;
    case 'sales':
      rawDeals = loadDealsFromStorage('financeDeals'); // Sales people see deals from financeDeals
      break;
    case 'finance':
    default:
      rawDeals = loadDealsFromStorage('financeDeals');
      break;
  }

  return aggregateDealsForDashboard(rawDeals, {
    dashboardType,
    ...options,
  });
};
