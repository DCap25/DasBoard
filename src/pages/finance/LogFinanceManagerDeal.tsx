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
import { ArrowLeft, Car, DollarSign, User, FileText, Check, CalendarDays } from 'lucide-react';

// Define product options for finance managers
const PRODUCT_OPTIONS = [
  { id: 'vsc', name: 'Vehicle Service Contract (VSC)', profit: 500 },
  { id: 'gap', name: 'GAP Insurance', profit: 300 },
  { id: 'ppm', name: 'PrePaid Maintenance (PPM)', profit: 200 },
  { id: 'tirewheel', name: 'Tire & Wheel Protection', profit: 150 },
  { id: 'appearance', name: 'Appearance Protection', profit: 100 },
  { id: 'keyreplacement', name: 'Key Replacement', profit: 50 },
  { id: 'theft', name: 'Theft Protection', profit: 150 },
  { id: 'windshield', name: 'Windshield Protection', profit: 75 },
  { id: 'lojack', name: 'LoJack/Tracking System', profit: 200 },
  { id: 'extwarranty', name: 'Extended Warranty', profit: 450 },
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
  customerName: string;
  vehicle: string;
  vin: string;
  stockNumber: string;
  saleDate: string;
  amount: string;
  products: string[];
  status: string;
  notes: string;
}

export default function LogFinanceManagerDeal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedProfit, setCalculatedProfit] = useState(0);

  // Initialize form data
  const [formData, setFormData] = useState<DealFormData>({
    customerName: '',
    vehicle: '',
    vin: '',
    stockNumber: '',
    saleDate: new Date().toISOString().split('T')[0],
    amount: '',
    products: [],
    status: 'pending',
    notes: '',
  });

  // Get schema name from user metadata
  const schemaName = user?.user_metadata?.schema_name || '';

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

    // Calculate profit whenever products change
    const calculateProfit = () => {
      let total = 0;
      formData.products.forEach(productId => {
        const product = PRODUCT_OPTIONS.find(p => p.id === productId);
        if (product) {
          total += product.profit;
        }
      });
      setCalculatedProfit(total);
    };

    calculateProfit();
  }, [schemaName, formData.products]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle product selection
  const handleProductToggle = (productId: string) => {
    setFormData(prev => {
      const updatedProducts = prev.products.includes(productId)
        ? prev.products.filter(id => id !== productId)
        : [...prev.products, productId];

      return {
        ...prev,
        products: updatedProducts,
      };
    });
  };

  // Handle status change
  const handleStatusChange = (statusId: string) => {
    setFormData(prev => ({
      ...prev,
      status: statusId,
    }));
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

    if (!formData.customerName || !formData.vehicle) {
      toast({
        title: 'Validation Error',
        description: 'Customer name and vehicle are required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log(`[LogFinanceManagerDeal] Submitting deal to schema: ${schemaName}`);

      // Map form products to names for storage
      const productNames = formData.products.map(
        productId => PRODUCT_OPTIONS.find(p => p.id === productId)?.name || productId
      );

      // Prepare deal data
      const dealData = {
        customer_name: formData.customerName,
        vehicle: formData.vehicle,
        vin: formData.vin,
        stock_number: formData.stockNumber,
        sale_date: formData.saleDate,
        amount: parseFloat(formData.amount) || 0,
        products: productNames,
        profit: calculatedProfit,
        status: formData.status,
        deal_details: {
          notes: formData.notes,
          products: formData.products.map(id => ({
            id,
            name: PRODUCT_OPTIONS.find(p => p.id === id)?.name || id,
            profit: PRODUCT_OPTIONS.find(p => p.id === id)?.profit || 0,
          })),
          created_by: user?.email || 'unknown',
        },
      };

      // Call API to log the deal
      const result = await logFinanceManagerDeal(schemaName, dealData);

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Deal logged successfully!',
        });

        // Clear form or navigate back
        navigate('/dashboard/single-finance');
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
          onClick={() => navigate('/dashboard/single-finance')}
          className="flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="bg-card-dark p-6 rounded-lg glow-card max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center border-b pb-2 mb-4">
              <User className="mr-2 h-5 w-5 text-blue-400" />
              Customer Information
            </h2>

            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                placeholder="Enter customer name"
                className="text-gray-300"
                required
              />
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center border-b pb-2 mb-4">
              <Car className="mr-2 h-5 w-5 text-green-400" />
              Vehicle Information
            </h2>

            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle Description *</Label>
              <Input
                id="vehicle"
                name="vehicle"
                value={formData.vehicle}
                onChange={handleInputChange}
                placeholder="e.g., 2023 Toyota Camry XLE"
                className="text-gray-300"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vin">VIN (Last 8)</Label>
                <Input
                  id="vin"
                  name="vin"
                  value={formData.vin}
                  onChange={e => {
                    const value = e.target.value.toUpperCase();
                    setFormData(prev => ({
                      ...prev,
                      vin: value,
                    }));
                  }}
                  placeholder="Last 8 of VIN"
                  className="text-gray-300"
                  maxLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockNumber">Stock #</Label>
                <Input
                  id="stockNumber"
                  name="stockNumber"
                  value={formData.stockNumber}
                  onChange={e => {
                    const value = e.target.value.toUpperCase();
                    setFormData(prev => ({
                      ...prev,
                      stockNumber: value,
                    }));
                  }}
                  placeholder="Stock Number"
                  className="text-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="saleDate">Sale Date</Label>
                <Input
                  type="date"
                  id="saleDate"
                  name="saleDate"
                  value={formData.saleDate}
                  onChange={handleInputChange}
                  className="text-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Deal Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={e => {
                    // Only allow numbers and decimal point
                    const value = e.target.value.replace(/[^0-9.]/g, '');
                    setFormData(prev => ({
                      ...prev,
                      amount: value,
                    }));
                  }}
                  placeholder="0.00"
                  className="text-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Products Sold */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center border-b pb-2 mb-4">
              <FileText className="mr-2 h-5 w-5 text-purple-400" />
              Products Sold
            </h2>

            <div className="grid grid-cols-1 gap-2">
              {PRODUCT_OPTIONS.map(product => (
                <div
                  key={product.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded"
                >
                  <Checkbox
                    id={`product-${product.id}`}
                    checked={formData.products.includes(product.id)}
                    onCheckedChange={() => handleProductToggle(product.id)}
                  />
                  <div className="flex justify-between items-center w-full">
                    <Label htmlFor={`product-${product.id}`} className="text-sm cursor-pointer">
                      {product.name}
                    </Label>
                    <span className="text-green-400 text-sm">${product.profit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 font-bold border-t">
              <span>Total Profit:</span>
              <span className="text-green-400">${calculatedProfit.toLocaleString()}</span>
            </div>
          </div>

          {/* Deal Status */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center border-b pb-2 mb-4">
              <CalendarDays className="mr-2 h-5 w-5 text-amber-400" />
              Deal Status
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map(status => (
                <div
                  key={status.id}
                  className={`p-2 border rounded cursor-pointer flex items-center justify-center ${
                    formData.status === status.id
                      ? 'bg-blue-900 border-blue-500'
                      : 'border-gray-700 hover:bg-gray-800'
                  }`}
                  onClick={() => handleStatusChange(status.id)}
                >
                  {formData.status === status.id && <Check className="mr-1 h-4 w-4" />}
                  {status.name}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional notes about this deal..."
              className="text-gray-300 min-h-[100px]"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-6 bg-gradient-to-r from-light-orange to-dark-orange text-white hover:scale-105 transition-all duration-300"
          >
            {isSubmitting ? 'Saving...' : 'Save Deal'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
