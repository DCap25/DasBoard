# Deal Mapping System Guide

This guide explains how to use the new deal data mapping system implemented in The DAS Board app.

## Overview

The deal mapping system provides a consistent way to process deal data from the DealLogPage form and display it across all dashboard components. It handles vehicle type mapping, split deal calculations, deal status filtering, and provides aggregated metrics.

## Core Components

### 1. Deal Mapper Utility (`src/utils/dealMapper.js`)

The main utility file containing functions to map and aggregate deal data.

#### Key Functions:

- `mapDealData(rawDeal, options)` - Maps individual deal data
- `aggregateDealsForDashboard(deals, options)` - Aggregates deals with filtering
- `getDashboardData(dashboardType, options)` - Gets dashboard-specific data
- `loadDealsFromStorage(storageKey)` - Loads deals from localStorage

### 2. React Hook (`src/hooks/useDealsData.ts`)

Custom React hook for managing deal data in dashboard components.

#### Available Hooks:

- `useDealsData(options)` - Generic hook with full customization
- `useSalesDealsData(salespersonId, timePeriod)` - For sales dashboards
- `useFinanceDealsData(timePeriod)` - For finance dashboards
- `useSingleFinanceDealsData(timePeriod)` - For single finance dashboards

## Usage Examples

### Using the Hook in a Dashboard Component

```tsx
import { useSalesDealsData } from '../../hooks/useDealsData';

const SalesDashboard = () => {
  const { user } = useAuth();
  const [timePeriod, setTimePeriod] = useState('this-month');

  // Get salesperson deals data
  const salespersonId = user?.id;
  const {
    dealData,
    loading,
    error,
    setTimePeriod: updatePeriod,
  } = useSalesDealsData(salespersonId, timePeriod);

  // Handle time period changes
  const handleTimePeriodChange = newPeriod => {
    setTimePeriod(newPeriod);
    updatePeriod(newPeriod);
  };

  // Use the data
  const deals = dealData?.deals || [];
  const metrics = dealData?.metrics || {};

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {loading && <div>Loading...</div>}

      <div>Total Deals: {metrics.totalDeals}</div>
      <div>Total Gross: ${metrics.totalGross}</div>

      {deals.map(deal => (
        <div key={deal.id}>
          {deal.customer} - ${deal.totalGross}
        </div>
      ))}
    </div>
  );
};
```

### Using the Utility Directly

```javascript
import { getDashboardData, mapDealData } from '../utils/dealMapper';

// Get aggregated dashboard data
const dashboardData = getDashboardData('sales', {
  userRole: 'salesperson',
  salespersonId: 'user123',
  timePeriod: 'this-month',
  includeInactive: false,
});

// Map a single deal
const mappedDeal = mapDealData(rawDeal, {
  dashboardType: 'finance',
  userRole: 'finance_manager',
});
```

## Data Mapping Details

### Vehicle Types

- `'N'` → `'New'`
- `'U'` → `'Used'`
- `'C'` → `'CPO'`

### Deal Status Mapping

- `'Funded'` → Counts toward sold/booked metrics
- `'Pending'` → Counts toward tracking metrics
- `'Unwound'/'Dead Deal'` → Excluded from metrics

### Split Deal Handling

- Split deals receive 50/50 credit allocation
- Each salesperson gets 50% of profits/gross for split deals
- `splitCredit` object provides credit details

### Product Mix Calculation

Products with non-zero profit values are included:

- VSC/Extended Warranty (`vscProfit`)
- GAP Insurance (`gapProfit`)
- Paint Protection (`appearanceProfit`)
- Tire & Wheel (`tireAndWheelProfit`)
- Prepaid Maintenance (`ppmProfit`)
- Other Products (`otherProfit`)

### Metrics Calculated

- `totalDeals` - Total number of active deals
- `fundedDeals` - Deals with 'Funded' status
- `pendingDeals` - Deals with 'Pending' status
- `newVehicleDeals` - New vehicle deals (`vehicleType === 'N'`)
- `usedVehicleDeals` - Used/CPO vehicle deals
- `totalFrontGross` - Sum of front-end gross profits
- `totalBackGross` - Sum of back-end gross profits
- `totalGross` - Sum of total gross profits
- `avgFrontGross` - Average front-end gross per deal
- `avgBackGross` - Average back-end gross per deal
- `totalPVR` - Total Per Vehicle Retailed value
- `avgPVR` - Average PVR per deal

## Time Period Filtering

Supported time periods:

- `'this-month'` - Current month
- `'last-month'` - Previous month
- `'ytd'` - Year to date
- `'last-year'` - Previous year
- `'all-time'` - No filtering

## Storage Keys

Different dashboard types use different localStorage keys:

- **Sales Dashboard**: `'financeDeals'`
- **Finance Dashboard**: `'financeDeals'`
- **Single Finance Dashboard**: `'singleFinanceDeals'` (fallback to `'financeDeals'`)

## Error Handling

The system includes comprehensive error handling:

- Invalid deal data is safely handled with fallback values
- localStorage parsing errors don't crash the app
- User-friendly error messages are displayed
- Fallback to empty data when errors occur

## Dashboard Integration

### Existing Dashboards Updated:

1. **SalesDashboard** - Now uses `useSalesDealsData` hook
2. **SingleFinanceManagerDashboard** - Updated to use `getDashboardData`
3. **FinanceHomePage** - Updated to use `useFinanceDealsData` hook

### Adding to New Dashboards:

1. Import the appropriate hook
2. Handle loading and error states
3. Use the provided metrics and deals data
4. Update time period filtering as needed

## Best Practices

1. **Use the hooks** instead of directly accessing localStorage
2. **Handle loading states** to improve user experience
3. **Display error messages** when data fails to load
4. **Update time periods** through the hook's setter function
5. **Test with empty data** to ensure graceful fallbacks

## Backward Compatibility

The system maintains backward compatibility with existing data formats:

- Legacy deal objects are converted to the new format
- Missing fields are filled with safe defaults
- Existing dashboard code continues to work

## Future Enhancements

Planned improvements:

1. Real-time data synchronization across tabs
2. Advanced filtering options (by salesperson, status, etc.)
3. Data caching and performance optimization
4. Integration with Supabase for persistent storage
5. Advanced analytics and reporting features

## Troubleshooting

### Common Issues:

1. **No deals showing**: Check localStorage for `'financeDeals'` or `'singleFinanceDeals'`
2. **Metrics not updating**: Ensure time period is being passed correctly
3. **Split deals not calculated**: Verify `isSplitDeal` and salesperson IDs are set
4. **Error messages**: Check browser console for detailed error information

### Debug Mode:

Enable detailed logging by opening browser console. The system logs:

- Deal loading operations
- Data mapping processes
- Error conditions
- Time period changes

## Support

For questions or issues with the deal mapping system:

1. Check browser console for error messages
2. Verify deal data format in localStorage
3. Test with sample data
4. Review the source code in `src/utils/dealMapper.js`
