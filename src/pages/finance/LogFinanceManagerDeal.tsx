import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { logFinanceManagerDeal } from '../../lib/apiService';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Textarea } from '../../components/ui/textarea';
import { toast } from '../../components/ui/use-toast';
import { ArrowLeft, DollarSign, User, FileText, Calculator } from 'lucide-react';

// Define salesperson options (this would typically come from a database)
const SALESPEOPLE = [
  { id: 1, initials: 'JD', firstName: 'John', lastName: 'Doe' },
  { id: 2, initials: 'SM', firstName: 'Sarah', lastName: 'Miller' },
  { id: 3, initials: 'MR', firstName: 'Maria', lastName: 'Rodriguez' },
  { id: 4, initials: 'AK', firstName: 'Anna', lastName: 'Kim' },
  { id: 5, initials: 'BH', firstName: 'Brandon', lastName: 'Harris' },
];

// Define lenders - matching the list from DealLogPage
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

// Define product options for finance managers with profit tracking
const PRODUCT_OPTIONS = [
  { id: 'vsc', name: 'Vehicle Service Contract (VSC)', defaultProfit: 500 },
  { id: 'gap', name: 'GAP Insurance', defaultProfit: 300 },
  { id: 'ppm', name: 'PrePaid Maintenance (PPM)', defaultProfit: 200 },
  { id: 'tirewheel', name: 'Tire & Wheel Protection', defaultProfit: 150 },
  { id: 'appearance', name: 'Appearance Protection', defaultProfit: 100 },
  { id: 'keyreplacement', name: 'Key Replacement', defaultProfit: 50 },
  { id: 'theft', name: 'Theft Protection', defaultProfit: 150 },
  { id: 'windshield', name: 'Windshield Protection', defaultProfit: 75 },
  { id: 'lojack', name: 'LoJack/Tracking System', defaultProfit: 200 },
  { id: 'extwarranty', name: 'Extended Warranty', defaultProfit: 450 },
];

// Status options
const STATUS_OPTIONS = [
  { id: 'pending', name: 'Pending' },
  { id: 'funded', name: 'Funded' },
  { id: 'unwound', name: 'Unwound' },
  { id: 'deaddeal', name: 'Dead Deal' },
];

// Interface for form data
interface DealFormData {
  dealNumber: string;
  stockNumber: string;
  vinLast8: string;
  vehicleType: string;
  customerName: string;
  vehicleDescription: string;
  dealType: string;
  saleDate: string;
  frontEndGross: string;
  salespersonId: string;
  isSplitDeal: boolean;
  secondSalespersonId: string;
  lender: string;
  reserveFlat: string;
  // Individual product profits
  vscProfit: string;
  gapProfit: string;
  ppmProfit: string;
  tireWheelProfit: string;
  appearanceProfit: string;
  keyReplacementProfit: string;
  theftProfit: string;
  windshieldProfit: string;
  lojackProfit: string;
  extWarrantyProfit: string;
  otherProfit: string;
  // Calculated fields
  backEndGross: string;
  totalGross: string;
  status: string;
  notes: string;
}

export default function LogFinanceManagerDeal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data
  const [formData, setFormData] = useState<DealFormData>({
    dealNumber: '',
    stockNumber: '',
    vinLast8: '',
    vehicleType: 'N',
    customerName: '',
    vehicleDescription: '',
    dealType: 'Finance',
    saleDate: new Date().toISOString().split('T')[0],
    frontEndGross: '',
    salespersonId: '',
    isSplitDeal: false,
    secondSalespersonId: '',
    lender: '',
    reserveFlat: '',
    vscProfit: '',
    gapProfit: '',
    ppmProfit: '',
    tireWheelProfit: '',
    appearanceProfit: '',
    keyReplacementProfit: '',
    theftProfit: '',
    windshieldProfit: '',
    lojackProfit: '',
    extWarrantyProfit: '',
    otherProfit: '',
    backEndGross: '',
    totalGross: '',
    status: 'pending',
    notes: '',
  });

  // Get schema name from user metadata
  const schemaName = user?.user_metadata?.schema_name || '';

  // Calculate back end gross and total gross whenever profit fields change
  useEffect(() => {
    const calculateTotals = () => {
      const vsc = parseFloat(formData.vscProfit) || 0;
      const gap = parseFloat(formData.gapProfit) || 0;
      const ppm = parseFloat(formData.ppmProfit) || 0;
      const tireWheel = parseFloat(formData.tireWheelProfit) || 0;
      const appearance = parseFloat(formData.appearanceProfit) || 0;
      const keyReplacement = parseFloat(formData.keyReplacementProfit) || 0;
      const theft = parseFloat(formData.theftProfit) || 0;
      const windshield = parseFloat(formData.windshieldProfit) || 0;
      const lojack = parseFloat(formData.lojackProfit) || 0;
      const extWarranty = parseFloat(formData.extWarrantyProfit) || 0;
      const other = parseFloat(formData.otherProfit) || 0;
      const reserve = parseFloat(formData.reserveFlat) || 0;

      const backEndGross =
        vsc +
        gap +
        ppm +
        tireWheel +
        appearance +
        keyReplacement +
        theft +
        windshield +
        lojack +
        extWarranty +
        other +
        reserve;
      const frontEnd = parseFloat(formData.frontEndGross) || 0;
      const totalGross = frontEnd + backEndGross;

      setFormData(prev => ({
        ...prev,
        backEndGross: backEndGross.toFixed(2),
        totalGross: totalGross.toFixed(2),
      }));
    };

    calculateTotals();
  }, [
    formData.vscProfit,
    formData.gapProfit,
    formData.ppmProfit,
    formData.tireWheelProfit,
    formData.appearanceProfit,
    formData.keyReplacementProfit,
    formData.theftProfit,
    formData.windshieldProfit,
    formData.lojackProfit,
    formData.extWarrantyProfit,
    formData.otherProfit,
    formData.reserveFlat,
    formData.frontEndGross,
  ]);

  useEffect(() => {
    console.log('[LogFinanceManagerDeal] Component mounted');

    // Check if we have a schema to work with
    if (!schemaName) {
      console.error('[LogFinanceManagerDeal] No schema name found in user metadata');
      toast({
        title: 'Error',
        description: 'Missing configuration for deal logging. Please contact support.',
        variant: 'destructive',
      });
    } else {
      console.log(`[LogFinanceManagerDeal] Using schema: ${schemaName}`);
    }
  }, [schemaName]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Handle checkbox
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
      return;
    }

    // Convert certain fields to uppercase
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!schemaName) {
      toast({
        title: 'Error',
        description: 'Missing schema information. Please contact support.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.customerName || !formData.vehicleDescription) {
      toast({
        title: 'Validation Error',
        description: 'Customer name and vehicle description are required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log(`[LogFinanceManagerDeal] Submitting deal to schema: ${schemaName}`);

      // Generate deal ID if not provided
      const dealId = formData.dealNumber || `D${Math.floor(1000 + Math.random() * 9000)}`;

      // Get salesperson information
      const salesperson = SALESPEOPLE.find(s => s.id.toString() === formData.salespersonId);
      const salespersonInitials = salesperson ? salesperson.initials : '';

      let secondSalespersonInitials = '';
      if (formData.isSplitDeal && formData.secondSalespersonId) {
        const secondSalesperson = SALESPEOPLE.find(
          s => s.id.toString() === formData.secondSalespersonId
        );
        secondSalespersonInitials = secondSalesperson ? secondSalesperson.initials : '';
      }

      const salespersonDisplay =
        formData.isSplitDeal && secondSalespersonInitials
          ? `${salespersonInitials}/${secondSalespersonInitials} (Split)`
          : salespersonInitials;

      // Determine which products were sold
      const productsSold = [];
      if (parseFloat(formData.vscProfit) > 0) productsSold.push('Vehicle Service Contract (VSC)');
      if (parseFloat(formData.gapProfit) > 0) productsSold.push('GAP Insurance');
      if (parseFloat(formData.ppmProfit) > 0) productsSold.push('PrePaid Maintenance (PPM)');
      if (parseFloat(formData.tireWheelProfit) > 0) productsSold.push('Tire & Wheel Protection');
      if (parseFloat(formData.appearanceProfit) > 0) productsSold.push('Appearance Protection');
      if (parseFloat(formData.keyReplacementProfit) > 0) productsSold.push('Key Replacement');
      if (parseFloat(formData.theftProfit) > 0) productsSold.push('Theft Protection');
      if (parseFloat(formData.windshieldProfit) > 0) productsSold.push('Windshield Protection');
      if (parseFloat(formData.lojackProfit) > 0) productsSold.push('LoJack/Tracking System');
      if (parseFloat(formData.extWarrantyProfit) > 0) productsSold.push('Extended Warranty');
      if (parseFloat(formData.otherProfit) > 0) productsSold.push('Other');

      // Prepare deal data for metrics calculation - FINANCE MANAGER SPECIFIC
      const dealData = {
        id: dealId,
        customer_name: formData.customerName,
        customer: formData.customerName, // Backward compatibility
        vehicle: `${
          formData.vehicleType === 'N' ? 'New' : formData.vehicleType === 'U' ? 'Used' : 'CPO'
        } - ${formData.vehicleDescription}`,
        vin: formData.vinLast8,
        stock_number: formData.stockNumber,
        sale_date: formData.saleDate,
        saleDate: formData.saleDate, // Backward compatibility
        deal_type: formData.dealType,
        salesperson: salespersonDisplay,
        salesperson_id: formData.salespersonId,
        is_split_deal: formData.isSplitDeal,
        second_salesperson_id: formData.isSplitDeal ? formData.secondSalespersonId : null,
        lender: formData.lender,
        front_end_gross: parseFloat(formData.frontEndGross) || 0,
        back_end_gross: parseFloat(formData.backEndGross) || 0,
        total_gross: parseFloat(formData.totalGross) || 0,
        amount: parseFloat(formData.totalGross) || 0, // Backward compatibility
        profit: parseFloat(formData.backEndGross) || 0, // Backward compatibility
        reserve_flat: parseFloat(formData.reserveFlat) || 0,
        vsc_profit: parseFloat(formData.vscProfit) || 0,
        gap_profit: parseFloat(formData.gapProfit) || 0,
        ppm_profit: parseFloat(formData.ppmProfit) || 0,
        tire_wheel_profit: parseFloat(formData.tireWheelProfit) || 0,
        appearance_profit: parseFloat(formData.appearanceProfit) || 0,
        key_replacement_profit: parseFloat(formData.keyReplacementProfit) || 0,
        theft_profit: parseFloat(formData.theftProfit) || 0,
        windshield_profit: parseFloat(formData.windshieldProfit) || 0,
        lojack_profit: parseFloat(formData.lojackProfit) || 0,
        ext_warranty_profit: parseFloat(formData.extWarrantyProfit) || 0,
        other_profit: parseFloat(formData.otherProfit) || 0,
        products: productsSold,
        status: formData.status,
        notes: formData.notes,
        vsc_sold: parseFloat(formData.vscProfit) > 0,
        created_by: user?.email || 'unknown',
        created_at: new Date().toISOString(),
        // Mark as Finance Manager deal
        dashboard_type: 'finance_manager',
        schema_name: schemaName,
      };

      // Save to localStorage for backward compatibility
      try {
        const existingDealsJson = localStorage.getItem('financeDeals');
        const existingDeals = existingDealsJson ? JSON.parse(existingDealsJson) : [];
        const updatedDeals = [dealData, ...existingDeals];
        localStorage.setItem('financeDeals', JSON.stringify(updatedDeals));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }

      // Call API to log the deal
      const result = await logFinanceManagerDeal(schemaName, dealData);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Deal logged successfully!',
        });

        navigate('/dashboard/finance');
      } else {
        console.error('[LogFinanceManagerDeal] Error logging deal:', result.error);
        toast({
          title: 'Error',
          description: result.message || 'Failed to log deal. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('[LogFinanceManagerDeal] Exception logging deal:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Log New Deal</h1>
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard/finance')}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Deal Information Card */}
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center border-b pb-2 mb-4">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              Deal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dealNumber">Deal Number</Label>
                <Input
                  id="dealNumber"
                  name="dealNumber"
                  value={formData.dealNumber}
                  onChange={handleInputChange}
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockNumber">Stock Number *</Label>
                <Input
                  id="stockNumber"
                  name="stockNumber"
                  value={formData.stockNumber}
                  onChange={handleInputChange}
                  placeholder="Stock Number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vinLast8">VIN (Last 8) *</Label>
                <Input
                  id="vinLast8"
                  name="vinLast8"
                  value={formData.vinLast8}
                  onChange={handleInputChange}
                  placeholder="Last 8 of VIN"
                  maxLength={8}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <div className="text-xs text-blue-600 mb-1">
                  → Feeds: Dashboard New/Used/CPO breakdowns, DAS Board rankings
                </div>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="N">New</option>
                  <option value="U">Used</option>
                  <option value="C">CPO</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dealType">Deal Type</Label>
                <select
                  id="dealType"
                  name="dealType"
                  value={formData.dealType}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="Cash">Cash</option>
                  <option value="Finance">Finance</option>
                  <option value="Lease">Lease</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="saleDate">Sale Date</Label>
                <Input
                  type="date"
                  id="saleDate"
                  name="saleDate"
                  value={formData.saleDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Customer & Vehicle Information */}
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center border-b pb-2 mb-4">
              <User className="mr-2 h-5 w-5 text-green-500" />
              Customer & Vehicle
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Customer last name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleDescription">Vehicle Description *</Label>
                <Input
                  id="vehicleDescription"
                  name="vehicleDescription"
                  value={formData.vehicleDescription}
                  onChange={handleInputChange}
                  placeholder="e.g., 2023 Toyota Camry XLE"
                  required
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Sales Information */}
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center border-b pb-2 mb-4">
              <User className="mr-2 h-5 w-5 text-purple-500" />
              Sales Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salespersonId">Salesperson</Label>
                <select
                  id="salespersonId"
                  name="salespersonId"
                  value={formData.salespersonId}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Salesperson</option>
                  {SALESPEOPLE.map(person => (
                    <option key={person.id} value={person.id.toString()}>
                      {person.initials} - {person.firstName} {person.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frontEndGross">Front End Gross</Label>
                <div className="text-xs text-blue-600 mb-1">
                  → Feeds: Sales Dashboard Total Gross, AVP Front PVR, GM Front Gross
                </div>
                <Input
                  id="frontEndGross"
                  name="frontEndGross"
                  value={formData.frontEndGross}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lender">Lender</Label>
                <select
                  id="lender"
                  name="lender"
                  value={formData.lender}
                  onChange={handleInputChange}
                  disabled={formData.dealType === 'Cash'}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Lender</option>
                  {LENDERS.map(lender => (
                    <option key={lender} value={lender}>
                      {lender}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isSplitDeal"
                name="isSplitDeal"
                checked={formData.isSplitDeal}
                onCheckedChange={checked =>
                  setFormData(prev => ({ ...prev, isSplitDeal: checked as boolean }))
                }
              />
              <Label htmlFor="isSplitDeal">Split Deal</Label>
            </div>

            {formData.isSplitDeal && (
              <div className="space-y-2">
                <Label htmlFor="secondSalespersonId">Second Salesperson</Label>
                <select
                  id="secondSalespersonId"
                  name="secondSalespersonId"
                  value={formData.secondSalespersonId}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Second Salesperson</option>
                  {SALESPEOPLE.map(person => (
                    <option key={person.id} value={person.id.toString()}>
                      {person.initials} - {person.firstName} {person.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Card>

        {/* F&I Products */}
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center border-b pb-2 mb-4">
              <DollarSign className="mr-2 h-5 w-5 text-green-500" />
              F&I Products & Profits
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reserveFlat">Reserve/Flat</Label>
                <div className="text-xs text-blue-600 mb-1">
                  → Feeds: Finance Dashboard Back End Gross, All PVR Calculations
                </div>
                <Input
                  id="reserveFlat"
                  name="reserveFlat"
                  value={formData.reserveFlat}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vscProfit">VSC Profit</Label>
                <div className="text-xs text-blue-600 mb-1">
                  → Feeds: Finance Dashboard VSC %, Product Mix Charts
                </div>
                <Input
                  id="vscProfit"
                  name="vscProfit"
                  value={formData.vscProfit}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gapProfit">GAP Profit</Label>
                <div className="text-xs text-blue-600 mb-1">
                  → Feeds: Finance Dashboard GAP %, Product Mix Charts
                </div>
                <Input
                  id="gapProfit"
                  name="gapProfit"
                  value={formData.gapProfit}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ppmProfit">PPM Profit</Label>
                <div className="text-xs text-blue-600 mb-1">
                  → Feeds: Finance Dashboard PPM %, Product Mix Charts
                </div>
                <Input
                  id="ppmProfit"
                  name="ppmProfit"
                  value={formData.ppmProfit}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tireWheelProfit">Tire & Wheel Profit</Label>
                <Input
                  id="tireWheelProfit"
                  name="tireWheelProfit"
                  value={formData.tireWheelProfit}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appearanceProfit">Appearance Profit</Label>
                <Input
                  id="appearanceProfit"
                  name="appearanceProfit"
                  value={formData.appearanceProfit}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="extWarrantyProfit">Extended Warranty Profit</Label>
                <Input
                  id="extWarrantyProfit"
                  name="extWarrantyProfit"
                  value={formData.extWarrantyProfit}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherProfit">Other Profit</Label>
                <Input
                  id="otherProfit"
                  name="otherProfit"
                  value={formData.otherProfit}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Totals & Status */}
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center border-b pb-2 mb-4">
              <Calculator className="mr-2 h-5 w-5 text-amber-500" />
              Totals & Status
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Back End Gross</Label>
                <div className="text-xs text-green-600 mb-1">
                  → AUTO-CALCULATED: Sum of all F&I products + Reserve
                </div>
                <div className="text-xs text-blue-600 mb-1">
                  → Feeds: All Dashboard Back End Gross, Finance PVR
                </div>
                <div className="p-2 bg-gray-100 border rounded-md">
                  ${parseFloat(formData.backEndGross || '0').toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Total Gross</Label>
                <div className="text-xs text-green-600 mb-1">
                  → AUTO-CALCULATED: Front End + Back End
                </div>
                <div className="text-xs text-blue-600 mb-1">
                  → Feeds: ALL Dashboard Total Gross, PVR Calculations, Profit Metrics
                </div>
                <div className="p-2 bg-gray-100 border rounded-md font-bold">
                  ${parseFloat(formData.totalGross || '0').toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Deal Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  {STATUS_OPTIONS.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional notes about this deal..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/single-finance')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="px-8">
            {isSubmitting ? 'Saving Deal...' : 'Save Deal'}
          </Button>
        </div>
      </form>
    </div>
  );
}
