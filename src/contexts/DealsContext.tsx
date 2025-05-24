import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the deal interface
interface Deal {
  id: string;
  customer: string;
  vehicle: string;
  vin: string;
  saleDate: string;
  salesperson: string;
  amount: number;
  status: string;
  products: string[];
  profit: number;
  financeDetails: {
    financeAmount: string;
    termMonths: string;
    apr: string;
    lender: string;
    monthlyPayment: string;
  };
  created_at: string;
}

// Define finance metrics interface
interface FinanceMetrics {
  mtdRevenue: number;
  dealsProcessed: number;
  productsPerDeal: number;
  pvr: number;
  productMix: {
    extendedWarranty: number;
    gapInsurance: number;
    paintProtection: number;
    tireWheel: number;
    other: number;
  };
}

// Define the context type
interface DealsContextType {
  deals: Deal[];
  addDeal: (deal: Deal) => void;
  updateMetrics: () => void;
  metrics: FinanceMetrics;
  pendingDeals: Deal[];
}

// Create the context with default values
const DealsContext = createContext<DealsContextType>({
  deals: [],
  addDeal: () => {},
  updateMetrics: () => {},
  metrics: {
    mtdRevenue: 0,
    dealsProcessed: 0,
    productsPerDeal: 0,
    pvr: 0,
    productMix: {
      extendedWarranty: 0,
      gapInsurance: 0,
      paintProtection: 0,
      tireWheel: 0,
      other: 0,
    },
  },
  pendingDeals: [],
});

// Sample initial deals data
const INITIAL_DEALS: Deal[] = [
  {
    id: 'D1001',
    customer: 'John Smith',
    vehicle: '2024 Honda Accord Sport',
    vin: 'JH4KA8270MC001140',
    saleDate: '2024-05-01',
    salesperson: 'Mike Johnson',
    amount: 32450,
    status: 'Bank Approval',
    products: ['Extended Warranty', 'GAP Insurance'],
    profit: 3680,
    financeDetails: {
      financeAmount: '29000',
      termMonths: '60',
      apr: '3.9',
      lender: 'Honda Financial',
      monthlyPayment: '532',
    },
    created_at: '2024-05-01T10:30:00Z',
  },
  {
    id: 'D1002',
    customer: 'Sarah Wilson',
    vehicle: '2023 Toyota Camry XLE',
    vin: '4T1BF28B23U295436',
    saleDate: '2024-05-03',
    salesperson: 'Lisa Chen',
    amount: 28900,
    status: 'Pending Documents',
    products: ['Extended Warranty', 'Tire & Wheel', 'Paint Protection'],
    profit: 4250,
    financeDetails: {
      financeAmount: '26000',
      termMonths: '72',
      apr: '4.2',
      lender: 'Toyota Financial',
      monthlyPayment: '412',
    },
    created_at: '2024-05-03T14:15:00Z',
  },
  {
    id: 'D1003',
    customer: 'Robert Miller',
    vehicle: '2024 Ford F-150 XLT',
    vin: '1FTFW1EF3BFB02926',
    saleDate: '2024-05-05',
    salesperson: 'David Garcia',
    amount: 48750,
    status: 'Contract Review',
    products: ['Extended Warranty', 'GAP Insurance', 'Paint Protection'],
    profit: 5300,
    financeDetails: {
      financeAmount: '45000',
      termMonths: '60',
      apr: '3.5',
      lender: 'Ford Credit',
      monthlyPayment: '815',
    },
    created_at: '2024-05-05T09:45:00Z',
  },
];

// DealsProvider component
export const DealsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load deals from localStorage or use initial data
  const [deals, setDeals] = useState<Deal[]>(() => {
    const savedDeals = localStorage.getItem('financeDeals');
    return savedDeals ? JSON.parse(savedDeals) : INITIAL_DEALS;
  });

  // Finance metrics state
  const [metrics, setMetrics] = useState<FinanceMetrics>({
    mtdRevenue: 87650,
    dealsProcessed: 42,
    productsPerDeal: 2.4,
    pvr: 1780,
    productMix: {
      extendedWarranty: 45,
      gapInsurance: 22,
      paintProtection: 15,
      tireWheel: 10,
      other: 8,
    },
  });

  // Save deals to localStorage when updated
  useEffect(() => {
    localStorage.setItem('financeDeals', JSON.stringify(deals));
  }, [deals]);

  // Add a new deal
  const addDeal = (deal: Deal) => {
    setDeals(prevDeals => [...prevDeals, deal]);
  };

  // Calculate pending deals (deals not completed)
  const pendingDeals = deals.filter(
    deal =>
      deal.status === 'Bank Approval' ||
      deal.status === 'Pending Documents' ||
      deal.status === 'Contract Review' ||
      deal.status === 'Insurance Verification'
  );

  // Update metrics based on current deals
  const updateMetrics = () => {
    // Get deals from the current month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const mtdDeals = deals.filter(deal => {
      const dealDate = new Date(deal.saleDate);
      return dealDate >= firstDayOfMonth && dealDate <= today;
    });

    // Calculate total F&I revenue for the month
    const mtdRevenue = mtdDeals.reduce((total, deal) => total + deal.profit, 0);

    // Calculate deals processed this month
    const dealsProcessed = mtdDeals.length;

    // Calculate average products per deal
    const totalProducts = mtdDeals.reduce((total, deal) => total + deal.products.length, 0);
    const productsPerDeal = dealsProcessed > 0 ? totalProducts / dealsProcessed : 0;

    // Calculate PVR (Per Vehicle Retailed)
    const pvr = dealsProcessed > 0 ? mtdRevenue / dealsProcessed : 0;

    // Calculate product mix percentages
    let extendedWarrantyCount = 0;
    let gapInsuranceCount = 0;
    let paintProtectionCount = 0;
    let tireWheelCount = 0;
    let otherCount = 0;

    mtdDeals.forEach(deal => {
      deal.products.forEach(product => {
        if (product === 'Extended Warranty') extendedWarrantyCount++;
        else if (product === 'GAP Insurance') gapInsuranceCount++;
        else if (product === 'Paint Protection') paintProtectionCount++;
        else if (product === 'Tire & Wheel') tireWheelCount++;
        else otherCount++;
      });
    });

    const totalProductCount =
      extendedWarrantyCount +
      gapInsuranceCount +
      paintProtectionCount +
      tireWheelCount +
      otherCount;

    const productMix = {
      extendedWarranty:
        totalProductCount > 0 ? Math.round((extendedWarrantyCount / totalProductCount) * 100) : 0,
      gapInsurance:
        totalProductCount > 0 ? Math.round((gapInsuranceCount / totalProductCount) * 100) : 0,
      paintProtection:
        totalProductCount > 0 ? Math.round((paintProtectionCount / totalProductCount) * 100) : 0,
      tireWheel: totalProductCount > 0 ? Math.round((tireWheelCount / totalProductCount) * 100) : 0,
      other: totalProductCount > 0 ? Math.round((otherCount / totalProductCount) * 100) : 0,
    };

    // Update metrics state
    setMetrics({
      mtdRevenue,
      dealsProcessed,
      productsPerDeal,
      pvr,
      productMix,
    });
  };

  // Initialize metrics on first load
  useEffect(() => {
    updateMetrics();
  }, []);

  return (
    <DealsContext.Provider value={{ deals, addDeal, updateMetrics, metrics, pendingDeals }}>
      {children}
    </DealsContext.Provider>
  );
};

// Custom hook to use the deals context
export const useDeals = () => useContext(DealsContext);

export default DealsContext;
