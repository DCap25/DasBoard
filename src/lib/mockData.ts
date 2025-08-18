import { Sale, FniDetail, Metric } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export const mockDealerships = [
  {
    id: 'd1',
    name: 'City Motors',
    location: 'New York, NY',
  },
  {
    id: 'd2',
    name: 'Riverside Auto',
    location: 'Chicago, IL',
  },
  {
    id: 'd3',
    name: 'Mountain View Cars',
    location: 'Denver, CO',
  },
];

export const mockUsers = [
  {
    id: 'u1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'salesperson',
    dealership_id: 'd1',
  },
  {
    id: 'u2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'sales_manager',
    dealership_id: 'd1',
  },
  {
    id: 'u3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'finance_manager',
    dealership_id: 'd2',
  },
  {
    id: 'u4',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    role: 'general_manager',
    dealership_id: 'd3',
  },
  {
    id: 'u5',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    dealership_id: null,
  },
];

export const mockSales: Sale[] = [
  {
    id: 's1',
    customer_name: 'Alex Rodriguez',
    vehicle_type: 'SUV',
    sale_date: '2023-01-15',
    sale_amount: 45000,
    salesperson_id: 'u1',
    dealership_id: 'd1',
    status: 'completed',
  },
  {
    id: 's2',
    customer_name: 'Maria Garcia',
    vehicle_type: 'Sedan',
    sale_date: '2023-02-03',
    sale_amount: 32000,
    salesperson_id: 'u1',
    dealership_id: 'd1',
    status: 'completed',
  },
  {
    id: 's3',
    customer_name: 'Robert Chen',
    vehicle_type: 'Truck',
    sale_date: '2023-02-12',
    sale_amount: 52000,
    salesperson_id: 'u3',
    dealership_id: 'd2',
    status: 'pending',
  },
  {
    id: 's4',
    customer_name: 'Lisa Wilson',
    vehicle_type: 'Luxury',
    sale_date: '2023-03-05',
    sale_amount: 68000,
    salesperson_id: 'u3',
    dealership_id: 'd2',
    status: 'completed',
  },
  {
    id: 's5',
    customer_name: 'James Brown',
    vehicle_type: 'Hybrid',
    sale_date: '2023-03-15',
    sale_amount: 42000,
    salesperson_id: 'u1',
    dealership_id: 'd1',
    status: 'completed',
  },
];

export const mockFniDetails: FniDetail[] = [
  {
    id: 'f1',
    sale_id: 's1',
    product_type: 'Extended Warranty',
    amount: 3500,
    commission_amount: 700,
  },
  {
    id: 'f2',
    sale_id: 's1',
    product_type: 'Gap Insurance',
    amount: 1200,
    commission_amount: 240,
  },
  {
    id: 'f3',
    sale_id: 's2',
    product_type: 'Maintenance Plan',
    amount: 2500,
    commission_amount: 500,
  },
  {
    id: 'f4',
    sale_id: 's4',
    product_type: 'Extended Warranty',
    amount: 4500,
    commission_amount: 900,
  },
  {
    id: 'f5',
    sale_id: 's5',
    product_type: 'Paint Protection',
    amount: 1800,
    commission_amount: 360,
  },
];

export const mockMetrics: Metric[] = [
  {
    id: 'm1',
    dealership_id: 'd1',
    period: 'January 2023',
    sales_count: 12,
    total_revenue: 432000,
    avg_vehicle_price: 36000,
  },
  {
    id: 'm2',
    dealership_id: 'd1',
    period: 'February 2023',
    sales_count: 15,
    total_revenue: 525000,
    avg_vehicle_price: 35000,
  },
  {
    id: 'm3',
    dealership_id: 'd2',
    period: 'January 2023',
    sales_count: 8,
    total_revenue: 320000,
    avg_vehicle_price: 40000,
  },
  {
    id: 'm4',
    dealership_id: 'd2',
    period: 'February 2023',
    sales_count: 10,
    total_revenue: 410000,
    avg_vehicle_price: 41000,
  },
  {
    id: 'm5',
    dealership_id: 'd3',
    period: 'January 2023',
    sales_count: 5,
    total_revenue: 210000,
    avg_vehicle_price: 42000,
  },
];

// Utility function to generate a new sale object
export function generateNewSale(
  salespersonId: string,
  dealershipId: string,
  customerName: string,
  vehicleType: string,
  saleAmount: number
): Omit<Sale, 'id'> {
  return {
    customer_name: customerName,
    vehicle_type: vehicleType,
    sale_date: new Date().toISOString().split('T')[0],
    sale_amount: saleAmount,
    salesperson_id: salespersonId,
    dealership_id: dealershipId,
    status: 'pending',
  };
}

// Utility function to generate a new F&I detail
export function generateNewFniDetail(
  saleId: string,
  productType: string,
  amount: number,
  commissionRate: number = 0.2
): Omit<FniDetail, 'id'> {
  return {
    sale_id: saleId,
    product_type: productType,
    amount: amount,
    commission_amount: amount * commissionRate,
  };
}

// Utility function to calculate metrics for a time period
export function calculateMetrics(
  dealershipId: string,
  period: string,
  sales: Sale[]
): Omit<Metric, 'id'> {
  const filteredSales = sales.filter(
    sale =>
      sale.dealership_id === dealershipId &&
      sale.sale_date.startsWith(period.split(' ')[0]) &&
      sale.status === 'completed'
  );

  const salesCount = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.sale_amount, 0);
  const avgVehiclePrice = salesCount > 0 ? totalRevenue / salesCount : 0;

  return {
    dealership_id: dealershipId,
    period,
    sales_count: salesCount,
    total_revenue: totalRevenue,
    avg_vehicle_price: avgVehiclePrice,
  };
}
