# Finance Manager Dashboard - Log New Deal Setup

## Overview

The Finance Manager Dashboard now has **TWO SEPARATE** Log New Deal functionalities:

### 1. Single Finance Manager Dashboard

- **Route**: `/dashboard/single-finance/log-deal`
- **Component**: `LogSingleFinanceDeal.tsx`
- **Storage**: `singleFinanceDeals` (localStorage)
- **Purpose**: Only affects the Single Finance Manager Dashboard
- **Usage**: For individual finance managers working independently
- **Button Style**: Orange theme (`bg-orange-600 hover:bg-orange-700`)

### 2. Main Finance Manager Dashboard

- **Route**: `/finance-manager/log-deal`
- **Component**: `LogFinanceManagerDeal.tsx`
- **Storage**: `financeDeals` (localStorage) + API calls
- **Purpose**: Affects ALL dashboards in the system
- **Usage**: For comprehensive deal logging that feeds into all metrics
- **Button Style**: Orange theme (`bg-orange-600 hover:bg-orange-700`)

## Data Flow Separation

### Single Finance Dashboard Flow

```
LogSingleFinanceDeal → singleFinanceDeals (localStorage) → SingleFinanceHomePage
```

### Main Finance Dashboard Flow

```
LogFinanceManagerDeal → financeDeals (localStorage) + API → All Dashboards
```

## Key Features

### LogSingleFinanceDeal.tsx

- ✅ Comprehensive F&I product tracking
- ✅ Real-time calculation of back-end gross
- ✅ Individual product profit fields (VSC, GAP, PPM, etc.)
- ✅ Auto-generated deal IDs with "SF" prefix
- ✅ Separate storage to avoid affecting other dashboards
- ✅ Clear visual indication it's single finance specific

### LogFinanceManagerDeal.tsx

- ✅ Full schema integration
- ✅ API calls to backend
- ✅ Comprehensive metrics for all dashboards
- ✅ Standard deal ID format
- ✅ Integration with all dashboard types

## Navigation

### From Single Finance Dashboard

```
SingleFinanceHomePage → "Log New Deal" button → /dashboard/single-finance/log-deal
```

### From Main Finance Dashboard

```
FinanceHomePage → "Log New Deal" button → /finance-manager/log-deal
```

## Data Structure

Both components save deals with the same structure but to different storage:

```typescript
interface Deal {
  id: string;
  customer_name: string;
  vehicle: string;
  vin: string;
  sale_date: string;
  deal_type: string;
  salesperson: string;
  front_end_gross: number;
  back_end_gross: number;
  total_gross: number;
  vsc_profit: number;
  gap_profit: number;
  ppm_profit: number;
  // ... other product profits
  products: string[];
  status: string;
  notes: string;
  dashboard_type?: string; // 'single_finance' for single finance deals
}
```

## Storage Keys

- **Single Finance**: `singleFinanceDeals`
- **Main Finance**: `financeDeals`

## Testing

1. Navigate to Single Finance Dashboard
2. Click "Log New Deal"
3. Fill out the form and save
4. Verify the deal appears only on Single Finance Dashboard
5. Check that it doesn't appear on other dashboards

## Metrics Calculation

Each dashboard calculates metrics independently:

- **SingleFinanceHomePage**: Only uses deals from `singleFinanceDeals`
- **FinanceHomePage**: Only uses deals from `financeDeals`
- **Other Dashboards**: Use their respective data sources

This ensures complete separation between the two systems while maintaining functionality.
