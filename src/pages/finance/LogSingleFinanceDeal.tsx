import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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

export default function LogSingleFinanceDeal() {
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
    console.log('[LogSingleFinanceDeal] Component mounted');
  }, []);

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
      console.log(`[LogSingleFinanceDeal] Submitting deal for Single Finance Dashboard`);

      // Generate deal ID if not provided
      const dealId = formData.dealNumber || `SF${Math.floor(1000 + Math.random() * 9000)}`;

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

      // Prepare deal data for metrics calculation - SINGLE FINANCE SPECIFIC
      const dealData = {
        id: dealId,
        dealNumber: dealId,
        customer_name: formData.customerName,
        customer: formData.customerName, // Backward compatibility
        lastName: formData.customerName, // For table display
        vehicle: `${
          formData.vehicleType === 'N' ? 'New' : formData.vehicleType === 'U' ? 'Used' : 'CPO'
        } - ${formData.vehicleDescription}`,
        vin: formData.vinLast8,
        vinLast8: formData.vinLast8,
        stock_number: formData.stockNumber,
        stockNumber: formData.stockNumber,
        sale_date: formData.saleDate,
        saleDate: formData.saleDate, // Backward compatibility
        dealDate: formData.saleDate, // For form field mapping
        deal_type: formData.dealType,
        dealType: formData.dealType,
        vehicleType: formData.vehicleType,
        salesperson: salespersonDisplay,
        salesperson_id: formData.salespersonId,
        is_split_deal: formData.isSplitDeal,
        second_salesperson_id: formData.isSplitDeal ? formData.secondSalespersonId : null,
        lender: formData.lender,
        front_end_gross: parseFloat(formData.frontEndGross) || 0,
        frontEndGross: parseFloat(formData.frontEndGross) || 0,
        back_end_gross: parseFloat(formData.backEndGross) || 0,
        backEndGross: parseFloat(formData.backEndGross) || 0,
        total_gross: parseFloat(formData.totalGross) || 0,
        totalGross: parseFloat(formData.totalGross) || 0,
        amount: parseFloat(formData.totalGross) || 0, // Backward compatibility
        profit: parseFloat(formData.backEndGross) || 0, // Backward compatibility
        reserve_flat: parseFloat(formData.reserveFlat) || 0,
        vsc_profit: parseFloat(formData.vscProfit) || 0,
        vscProfit: parseFloat(formData.vscProfit) || 0,
        gap_profit: parseFloat(formData.gapProfit) || 0,
        gapProfit: parseFloat(formData.gapProfit) || 0,
        ppm_profit: parseFloat(formData.ppmProfit) || 0,
        ppmProfit: parseFloat(formData.ppmProfit) || 0,
        tire_wheel_profit: parseFloat(formData.tireWheelProfit) || 0,
        tireAndWheelProfit: parseFloat(formData.tireWheelProfit) || 0,
        appearance_profit: parseFloat(formData.appearanceProfit) || 0,
        appearanceProfit: parseFloat(formData.appearanceProfit) || 0,
        key_replacement_profit: parseFloat(formData.keyReplacementProfit) || 0,
        keyReplacementProfit: parseFloat(formData.keyReplacementProfit) || 0,
        theft_profit: parseFloat(formData.theftProfit) || 0,
        theftProfit: parseFloat(formData.theftProfit) || 0,
        windshield_profit: parseFloat(formData.windshieldProfit) || 0,
        windshieldProfit: parseFloat(formData.windshieldProfit) || 0,
        lojack_profit: parseFloat(formData.lojackProfit) || 0,
        lojackProfit: parseFloat(formData.lojackProfit) || 0,
        ext_warranty_profit: parseFloat(formData.extWarrantyProfit) || 0,
        extWarrantyProfit: parseFloat(formData.extWarrantyProfit) || 0,
        other_profit: parseFloat(formData.otherProfit) || 0,
        otherProfit: parseFloat(formData.otherProfit) || 0,
        products: productsSold,
        status: formData.status,
        dealStatus: formData.status,
        notes: formData.notes,
        vsc_sold: parseFloat(formData.vscProfit) > 0,
        created_by: user?.email || 'unknown',
        created_at: new Date().toISOString(),
        // Mark as Single Finance deal
        dashboard_type: 'single_finance',
      };

      // Save to SEPARATE localStorage key for Single Finance Dashboard
      try {
        const existingDealsJson = localStorage.getItem('singleFinanceDeals');
        const existingDeals = existingDealsJson ? JSON.parse(existingDealsJson) : [];
        const updatedDeals = [dealData, ...existingDeals];
        localStorage.setItem('singleFinanceDeals', JSON.stringify(updatedDeals));

        console.log('[LogSingleFinanceDeal] Deal saved to singleFinanceDeals storage:', dealData);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }

      toast({
        title: 'Success',
        description: 'Deal logged successfully to Single Finance Dashboard!',
      });

      navigate('/dashboard/single-finance');
    } catch (error) {
      console.error('[LogSingleFinanceDeal] Exception logging deal:', error);
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
        <h1 className="text-2xl font-bold">Log New Deal - Single Finance Dashboard</h1>
        <Button
          onClick={() => navigate('/dashboard/single-finance')}
          className="flex items-center bg-blue-500 text-white hover:bg-blue-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> This deal will only appear on your Single Finance Manager Dashboard
          and will not affect other dashboards in the system.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Deal Information Card */}
        <Card className="p-6 border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
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
        <Card className="p-6 border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
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
        <Card className="p-6 border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
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
                <Input
                  id="lender"
                  name="lender"
                  value={formData.lender}
                  onChange={handleInputChange}
                  placeholder="Lender name"
                  disabled={formData.dealType === 'Cash'}
                />
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
        <Card className="p-6 border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center border-b pb-2 mb-4">
              <DollarSign className="mr-2 h-5 w-5 text-green-500" />
              F&I Products & Profits
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reserveFlat">Reserve/Flat</Label>
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
        <Card className="p-6 border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center border-b pb-2 mb-4">
              <Calculator className="mr-2 h-5 w-5 text-amber-500" />
              Totals & Status
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Back End Gross</Label>
                <div className="p-2 bg-gray-100 border rounded-md">
                  ${parseFloat(formData.backEndGross || '0').toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Total Gross</Label>
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
          <Button type="submit" disabled={isSubmitting} className="px-8 bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400">
            {isSubmitting ? 'Saving Deal...' : 'Save Deal'}
          </Button>
        </div>
      </form>
    </div>
  );
}
