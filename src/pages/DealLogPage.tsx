import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Hash,
  User,
  DollarSign,
  Shield,
  Calendar,
  Activity,
  Zap,
  Package,
  Briefcase,
  CreditCard,
  PieChart,
  TrendingUp,
  Users,
  Percent,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';

const LENDERS = [
  'Ally Bank',
  'American Credit Acceptance',
  'Americredit',
  'Bank of America',
  'Capital One',
  'Chase',
  'Chrysler Capital',
  'Crescent Bank',
  'Exeter',
  'First Help Financial',
  'Ford Motor Credit',
  'Global Lending Services',
  'Huntington National Bank',
  'Hyundai Financial',
  'Navy Federal',
  'Other',
  'PNC Bank',
  'Prestige Financial Services',
  'Regional Acceptance',
  'Santander',
  'Stellantis',
  'TD Auto',
  'Tesla',
  'Toyota Credit',
  'Truist',
  'US Bank',
  'USAA',
  'Wells Fargo',
  'Westlake Financial Services',
];

const DEAL_TYPES = ['Finance', 'Lease', 'Cash'];

const DEAL_STATUSES = ['Pending', 'Funded', 'Unwound', 'Dead Deal'];

// Add vehicle types constant
const VEHICLE_TYPES = [
  { value: 'N', label: 'New' },
  { value: 'U', label: 'Used' },
  { value: 'C', label: 'CPO' },
];

// Example salesperson data - would be populated from admin
const SALESPEOPLE = [
  { id: 1, initials: 'JD', firstName: 'John', lastName: 'Doe' },
  { id: 2, initials: 'TS', firstName: 'Thomas', lastName: 'Smith' },
  { id: 3, initials: 'MR', firstName: 'Maria', lastName: 'Rodriguez' },
  { id: 4, initials: 'AK', firstName: 'Anna', lastName: 'Kim' },
  { id: 5, initials: 'BH', firstName: 'Brandon', lastName: 'Harris' },
];

interface DealLogFormData {
  dealNumber: string;
  stockNumber: string;
  vinLast8: string;
  vehicleType: string;
  lastName: string;
  dealType: string;
  frontEndGross: string;
  vscProfit: string;
  ppmProfit: string;
  gapProfit: string;
  tireAndWheelProfit: string;
  appearanceProfit: string;
  otherProfit: string;
  reserveFlat: string;
  backEndGross: string;
  totalGross: string;
  lender: string;
  salespersonId: string;
  salesManagerId: string;
  isSplitDeal: boolean;
  secondSalespersonId: string;
  dealStatus: string;
  outsideFunding: boolean;
  dealDate: string;
}

interface DealLogPageProps {
  dashboardType?: 'finance' | 'single-finance';
}

const DealLogPage: React.FC<DealLogPageProps> = ({ dashboardType = 'finance' }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<DealLogFormData>({
    dealNumber: '',
    stockNumber: '',
    vinLast8: '',
    vehicleType: 'N',
    lastName: '',
    dealType: '',
    frontEndGross: '',
    vscProfit: '',
    ppmProfit: '',
    gapProfit: '',
    tireAndWheelProfit: '',
    appearanceProfit: '',
    otherProfit: '',
    reserveFlat: '',
    backEndGross: '',
    totalGross: '',
    lender: '',
    salespersonId: '',
    salesManagerId: '',
    isSplitDeal: false,
    secondSalespersonId: '',
    dealStatus: 'Pending',
    outsideFunding: false,
    dealDate: new Date().toISOString().split('T')[0],
  });

  const handleBackToDashboard = () => {
    if (dashboardType === 'single-finance') {
      navigate('/dashboard/single-finance');
    } else {
      navigate('/dashboard/finance');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    // Handle checkbox for outsideFunding
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
      return;
    }

    // Convert Stock Number and VIN to uppercase
    if (name === 'stockNumber' || name === 'vinLast8') {
      setFormData(prev => ({
        ...prev,
        [name]: value.toUpperCase(),
      }));
      return;
    }

    // Clear lender when Cash is selected
    if (name === 'dealType' && value === 'Cash') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        lender: '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Calculate back end gross (sum of all product profits + reserve/flat)
  useEffect(() => {
    const calculateBackEndGross = () => {
      const vsc = parseFloat(formData.vscProfit) || 0;
      const ppm = parseFloat(formData.ppmProfit) || 0;
      const gap = parseFloat(formData.gapProfit) || 0;
      const tireAndWheel = parseFloat(formData.tireAndWheelProfit) || 0;
      const appearance = parseFloat(formData.appearanceProfit) || 0;
      const other = parseFloat(formData.otherProfit) || 0;
      const reserveFlat = parseFloat(formData.reserveFlat) || 0;

      const backEndGross = vsc + ppm + gap + tireAndWheel + appearance + other + reserveFlat;
      return backEndGross.toFixed(2);
    };

    // Calculate total gross (front + back)
    const calculateTotalGross = () => {
      const frontEnd = parseFloat(formData.frontEndGross) || 0;
      const backEnd = parseFloat(calculateBackEndGross()) || 0;

      const totalGross = frontEnd + backEnd;
      return totalGross.toFixed(2);
    };

    setFormData(prev => ({
      ...prev,
      backEndGross: calculateBackEndGross(),
      totalGross: calculateTotalGross(),
    }));
  }, [
    formData.vscProfit,
    formData.ppmProfit,
    formData.gapProfit,
    formData.tireAndWheelProfit,
    formData.appearanceProfit,
    formData.otherProfit,
    formData.reserveFlat,
    formData.frontEndGross,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);

    // Generate a random deal ID with format D1234
    const dealId = `D${Math.floor(1000 + Math.random() * 9000)}`;

    // Get current date for sale date if not provided
    const currentDate = formData.dealDate || new Date().toISOString().split('T')[0]; // Use the form's deal date

    // Get salesperson initials
    const salesperson = SALESPEOPLE.find(s => s.id.toString() === formData.salespersonId);
    const salespersonInitials = salesperson ? salesperson.initials : '';

    // Get second salesperson initials if it's a split deal
    let secondSalespersonInitials = '';
    if (formData.isSplitDeal && formData.secondSalespersonId) {
      const secondSalesperson = SALESPEOPLE.find(
        s => s.id.toString() === formData.secondSalespersonId
      );
      secondSalespersonInitials = secondSalesperson ? secondSalesperson.initials : '';
    }

    // Format the salesperson display for the deal log
    const salespersonDisplay =
      formData.isSplitDeal && secondSalespersonInitials
        ? `${salespersonInitials}/${secondSalespersonInitials} (Split)`
        : salespersonInitials;

    // Calculate profit values
    const backEndGross = parseFloat(formData.backEndGross) || 0;
    const frontEndGross = parseFloat(formData.frontEndGross) || 0;
    const totalGross = parseFloat(formData.totalGross) || 0;

    // Determine which products were sold based on non-zero profit values
    const products = [];
    if (parseFloat(formData.vscProfit) > 0) products.push('Extended Warranty');
    if (parseFloat(formData.gapProfit) > 0) products.push('GAP Insurance');
    if (parseFloat(formData.appearanceProfit) > 0) products.push('Paint and Fabric Protection');
    if (parseFloat(formData.tireAndWheelProfit) > 0) products.push('Tire & Wheel');
    if (parseFloat(formData.ppmProfit) > 0) products.push('PPM');
    if (parseFloat(formData.otherProfit) > 0) products.push('Other');

    // Create a new deal object in the format expected by the deal mapper
    const newDeal = {
      // Use dealId as the primary identifier
      id: dealId,

      // Original form data (what the deal mapper expects)
      dealNumber: formData.dealNumber || dealId,
      stockNumber: formData.stockNumber,
      vinLast8: formData.vinLast8,
      vehicleType: formData.vehicleType,
      lastName: formData.lastName,
      dealType: formData.dealType,
      frontEndGross: parseFloat(formData.frontEndGross) || 0,
      vscProfit: parseFloat(formData.vscProfit) || 0,
      ppmProfit: parseFloat(formData.ppmProfit) || 0,
      gapProfit: parseFloat(formData.gapProfit) || 0,
      tireAndWheelProfit: parseFloat(formData.tireAndWheelProfit) || 0,
      appearanceProfit: parseFloat(formData.appearanceProfit) || 0,
      otherProfit: parseFloat(formData.otherProfit) || 0,
      reserveFlat: parseFloat(formData.reserveFlat) || 0,
      backEndGross: parseFloat(formData.backEndGross) || 0,
      totalGross: parseFloat(formData.totalGross) || 0,
      lender: formData.lender,
      salespersonId: formData.salespersonId,
      salesManagerId: formData.salesManagerId,
      isSplitDeal: formData.isSplitDeal,
      secondSalespersonId: formData.isSplitDeal ? formData.secondSalespersonId : null,
      dealStatus: formData.dealStatus,
      outsideFunding: formData.outsideFunding,
      dealDate: currentDate,

      // Calculated/derived fields
      salesperson: salespersonDisplay,
      products: products,

      // Metadata
      created_at: new Date().toISOString(),

      // Legacy compatibility fields (for backward compatibility with existing dashboards)
      customer: formData.lastName,
      vehicle: `${
        formData.vehicleType === 'N' ? 'New' : formData.vehicleType === 'U' ? 'Used' : 'CPO'
      } - Stock #${formData.stockNumber}`,
      vin: formData.vinLast8,
      saleDate: currentDate,
      amount: totalGross,
      status: formData.dealStatus,
      profit: backEndGross,
    };

    // Save to localStorage - first get existing deals
    // Use the correct storage key based on dashboard type
    const storageKey = dashboardType === 'single-finance' ? 'singleFinanceDeals' : 'financeDeals';

    try {
      const existingDealsJson = localStorage.getItem(storageKey);
      const existingDeals = existingDealsJson ? JSON.parse(existingDealsJson) : [];

      // Add new deal to the beginning of the array
      const updatedDeals = [newDeal, ...existingDeals];

      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedDeals));

      // Show success message
      alert(`Deal ${dealId} successfully logged!`);

      // Navigate back to the appropriate dashboard after submission
      if (dashboardType === 'single-finance') {
        navigate('/dashboard/single-finance');
      } else {
        navigate('/dashboard/finance');
      }
    } catch (error) {
      console.error('Error saving deal to localStorage:', error);
      alert('Failed to save deal. Please try again.');
    }
  };

  // Get selected salesperson initials
  const getSelectedSalespersonInitials = () => {
    if (!formData.salespersonId) return '';
    const salesperson = SALESPEOPLE.find(s => s.id.toString() === formData.salespersonId);
    const initials = salesperson ? salesperson.initials : '';

    if (formData.isSplitDeal && formData.secondSalespersonId) {
      const secondSalesperson = SALESPEOPLE.find(
        s => s.id.toString() === formData.secondSalespersonId
      );
      const secondInitials = secondSalesperson ? secondSalesperson.initials : '';
      return secondInitials ? `${initials}/${secondInitials} (Split)` : initials;
    }

    return initials;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleBackToDashboard}
            className="mr-4 flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 border border-blue-500 rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Log New Deal</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Deal Information Card */}
        <div className="bg-white rounded-lg shadow mb-6 border-l-4 border-l-blue-500">
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center">
              <Car className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold text-blue-700">Deal Information</h2>
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-6 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Log Deal
            </button>
          </div>

          <div className="p-6">
            {/* First row: Deal #, Deal Date, Stock #, VIN, Deal Type */}
            <div className="grid grid-cols-12 gap-4 mb-6">
              <div className="col-span-2">
                <label
                  htmlFor="dealNumber"
                  className="flex items-center text-base font-bold text-gray-700 mb-2"
                >
                  <Hash className="h-4 w-4 mr-2 text-gray-500" />
                  Deal #
                </label>
                <input
                  type="text"
                  id="dealNumber"
                  name="dealNumber"
                  value={formData.dealNumber}
                  onChange={handleChange}
                  maxLength={8}
                  className="w-full h-10 px-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="dealDate"
                  className="flex items-center text-base font-bold text-gray-700 mb-2"
                >
                  <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                  Deal Date
                </label>
                <input
                  type="date"
                  id="dealDate"
                  name="dealDate"
                  value={formData.dealDate || new Date().toISOString().split('T')[0]}
                  onChange={handleChange}
                  className="w-full h-10 px-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="stockNumber"
                  className="flex items-center text-base font-bold text-gray-700 mb-2"
                >
                  <Hash className="h-4 w-4 mr-2 text-gray-500" />
                  Stock #
                </label>
                <input
                  type="text"
                  id="stockNumber"
                  name="stockNumber"
                  value={formData.stockNumber}
                  onChange={handleChange}
                  required
                  maxLength={8}
                  className="w-full h-10 px-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="vinLast8"
                  className="flex items-center text-base font-bold text-gray-700 mb-2"
                >
                  <Car className="h-4 w-4 mr-2 text-gray-500" />
                  Last 8 of VIN
                </label>
                <input
                  type="text"
                  id="vinLast8"
                  name="vinLast8"
                  value={formData.vinLast8}
                  onChange={handleChange}
                  required
                  maxLength={8}
                  className="w-full h-10 px-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="vehicleType"
                  className="flex items-center text-base font-bold text-gray-700 mb-2"
                >
                  <Car className="h-4 w-4 mr-2 text-gray-500" />
                  Vehicle Type
                </label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                >
                  {VEHICLE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="dealType"
                  className="flex items-center text-base font-bold text-gray-700 mb-2"
                >
                  <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                  Deal Type
                </label>
                <select
                  id="dealType"
                  name="dealType"
                  value={formData.dealType}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                >
                  <option value="">Select</option>
                  {DEAL_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Second row: Customer Name, Salesperson, Lender and Deal Status */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-3">
                <label
                  htmlFor="lastName"
                  className="flex items-center text-base font-bold text-gray-700 mb-2"
                >
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="salespersonId"
                    className="flex items-center text-base font-bold text-gray-700"
                  >
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    Salesperson
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isSplitDeal"
                      name="isSplitDeal"
                      checked={formData.isSplitDeal}
                      onChange={handleChange}
                      className="h-3 w-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="isSplitDeal" className="ml-1 text-xs text-gray-500">
                      Split Deal
                    </label>
                  </div>
                </div>

                {!formData.isSplitDeal ? (
                  <>
                    <select
                      id="salespersonId"
                      name="salespersonId"
                      value={formData.salespersonId}
                      onChange={handleChange}
                      required
                      className="w-full h-10 px-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                    >
                      <option value="">Select</option>
                      {SALESPEOPLE.map(person => (
                        <option key={person.id} value={person.id}>
                          {person.firstName} {person.lastName}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      id="salespersonId"
                      name="salespersonId"
                      value={formData.salespersonId}
                      onChange={handleChange}
                      required
                      className="w-full h-10 px-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select Primary</option>
                      {SALESPEOPLE.map(person => (
                        <option key={person.id} value={person.id}>
                          {person.firstName} {person.lastName}
                        </option>
                      ))}
                    </select>
                    <select
                      id="secondSalespersonId"
                      name="secondSalespersonId"
                      value={formData.secondSalespersonId}
                      onChange={handleChange}
                      required={formData.isSplitDeal}
                      className="w-full h-10 px-2 text-sm rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select Secondary</option>
                      {SALESPEOPLE.filter(p => p.id.toString() !== formData.salespersonId).map(
                        person => (
                          <option key={person.id} value={person.id}>
                            {person.firstName} {person.lastName}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}

                {(formData.salespersonId ||
                  (formData.isSplitDeal && formData.secondSalespersonId)) && (
                  <div className="mt-1 text-xs text-gray-500">
                    Will display as: {getSelectedSalespersonInitials()}
                  </div>
                )}
              </div>
              <div className="col-span-3">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="lender"
                    className="flex items-center text-base font-bold text-gray-700"
                  >
                    <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                    Lender
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="outsideFunding"
                      name="outsideFunding"
                      checked={formData.outsideFunding}
                      onChange={handleChange}
                      className="h-3 w-3 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor="outsideFunding" className="ml-1 text-xs text-gray-500">
                      Outside Funding
                    </label>
                  </div>
                </div>
                <select
                  id="lender"
                  name="lender"
                  value={formData.lender}
                  onChange={handleChange}
                  required={formData.dealType === 'Finance' || formData.dealType === 'Lease'}
                  disabled={formData.dealType === 'Cash'}
                  className={`w-full h-10 px-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base ${
                    formData.dealType === 'Cash' ? 'bg-gray-100' : ''
                  }`}
                >
                  <option value="">Select Lender</option>
                  {LENDERS.map(lender => (
                    <option key={lender} value={lender}>
                      {lender}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="dealStatus"
                  className="flex items-center text-base font-bold text-gray-700 mb-2"
                >
                  <AlertTriangle className="h-4 w-4 mr-2 text-gray-500" />
                  Deal Status
                </label>
                <select
                  id="dealStatus"
                  name="dealStatus"
                  value={formData.dealStatus}
                  onChange={handleChange}
                  required
                  className="w-full h-10 px-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                >
                  {DEAL_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="salesManagerId"
                  className="flex items-center text-base font-bold text-gray-700 mb-2"
                >
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  Sales Manager
                </label>
                <select
                  id="salesManagerId"
                  name="salesManagerId"
                  onChange={handleChange}
                  className="w-full h-10 px-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                >
                  <option value="">Select</option>
                  {SALESPEOPLE.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.firstName} {person.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Products */}
          <div>
            {/* Products */}
            <div className="bg-white rounded-lg shadow h-full border-l-4 border-l-blue-500">
              <div className="bg-purple-50 border-b border-purple-100 px-6 py-4 rounded-t-lg flex items-center">
                <Package className="h-5 w-5 text-purple-500 mr-2" />
                <h2 className="text-lg font-semibold text-purple-700">Product Profits</h2>
              </div>

              <div className="p-6 grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="vscProfit"
                    className="flex items-center text-base font-bold text-gray-700 mb-2"
                  >
                    <Shield className="h-4 w-4 mr-2 text-red-500" />
                    VSC Profit
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-lg">$</span>
                    </div>
                    <input
                      type="text"
                      id="vscProfit"
                      name="vscProfit"
                      value={formData.vscProfit}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full h-10 pl-8 pr-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="ppmProfit"
                    className="flex items-center text-base font-bold text-gray-700 mb-2"
                  >
                    <Calendar className="h-4 w-4 mr-2 text-amber-500" />
                    PPM Profit
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-lg">$</span>
                    </div>
                    <input
                      type="text"
                      id="ppmProfit"
                      name="ppmProfit"
                      value={formData.ppmProfit}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full h-10 pl-8 pr-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="gapProfit"
                    className="flex items-center text-base font-bold text-gray-700 mb-2"
                  >
                    <Activity className="h-4 w-4 mr-2 text-cyan-500" />
                    GAP Profit
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-lg">$</span>
                    </div>
                    <input
                      type="text"
                      id="gapProfit"
                      name="gapProfit"
                      value={formData.gapProfit}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full h-10 pl-8 pr-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="tireAndWheelProfit"
                    className="flex items-center text-base font-bold text-gray-700 mb-2"
                  >
                    <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                    T&W/Bundle Profit
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-lg">$</span>
                    </div>
                    <input
                      type="text"
                      id="tireAndWheelProfit"
                      name="tireAndWheelProfit"
                      value={formData.tireAndWheelProfit}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full h-10 pl-8 pr-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="appearanceProfit"
                    className="flex items-center text-base font-bold text-gray-700 mb-2"
                  >
                    <Package className="h-4 w-4 mr-2 text-emerald-500" />
                    Paint and Fabric Profit
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-lg">$</span>
                    </div>
                    <input
                      type="text"
                      id="appearanceProfit"
                      name="appearanceProfit"
                      value={formData.appearanceProfit}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full h-10 pl-8 pr-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="otherProfit"
                    className="flex items-center text-base font-bold text-gray-700 mb-2"
                  >
                    <Package className="h-4 w-4 mr-2 text-gray-500" />
                    Other Profit
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-lg">$</span>
                    </div>
                    <input
                      type="text"
                      id="otherProfit"
                      name="otherProfit"
                      value={formData.otherProfit}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full h-10 pl-8 pr-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Deal Profit & Summary combined */}
            <div className="bg-white rounded-lg shadow h-full border-l-4 border-l-blue-500">
              <div className="bg-green-50 border-b border-green-100 px-6 py-4 rounded-t-lg flex items-center">
                <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                <h2 className="text-lg font-semibold text-green-700">Deal Profit</h2>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label
                    htmlFor="frontEndGross"
                    className="flex items-center text-base font-bold text-gray-700 mb-2"
                  >
                    <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />
                    Front End Profit
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-lg">$</span>
                    </div>
                    <input
                      type="text"
                      id="frontEndGross"
                      name="frontEndGross"
                      value={formData.frontEndGross}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full h-10 pl-8 pr-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reserveFlat"
                    className="flex items-center text-base font-bold text-gray-700 mb-2"
                  >
                    <Percent className="h-4 w-4 mr-2 text-orange-500" />
                    Reserve/Flat Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-lg">$</span>
                    </div>
                    <input
                      type="text"
                      id="reserveFlat"
                      name="reserveFlat"
                      value={formData.reserveFlat}
                      onChange={handleChange}
                      placeholder="0.00"
                      className="w-full h-10 pl-8 pr-4 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <label
                    htmlFor="backEndGross"
                    className="flex items-center text-base font-bold text-gray-700 mb-2"
                  >
                    <PieChart className="h-4 w-4 mr-2 text-indigo-500" />
                    Back End Gross (Auto-calculated)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-lg">$</span>
                    </div>
                    <input
                      type="text"
                      id="backEndGross"
                      name="backEndGross"
                      value={formData.backEndGross}
                      readOnly
                      className="w-full h-10 pl-8 pr-4 rounded-md border border-gray-200 bg-gray-50 shadow-sm text-base font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="totalGross"
                    className="flex items-center text-base font-bold text-gray-700 mb-2"
                  >
                    <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                    Total Gross (Auto-calculated)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-lg">$</span>
                    </div>
                    <input
                      type="text"
                      id="totalGross"
                      name="totalGross"
                      value={formData.totalGross}
                      readOnly
                      className="w-full h-10 pl-8 pr-4 rounded-md border border-gray-200 bg-gray-50 shadow-sm text-base font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DealLogPage;
