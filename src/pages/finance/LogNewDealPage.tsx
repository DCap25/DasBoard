import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../lib/use-toast';
import {
  Car,
  Clipboard,
  DollarSign,
  FileText,
  CreditCard,
  Check,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';

// Simple local storage functions - completely self-contained
const saveToLocalStorage = (deal: any) => {
  try {
    const deals = JSON.parse(localStorage.getItem('deals') || '[]');
    deals.push(deal);
    localStorage.setItem('deals', JSON.stringify(deals));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Form step types
type StepKey = 'customer' | 'vehicle' | 'deal' | 'products' | 'payment' | 'review';

interface StepConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const LogNewDealPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast, dismissToast } = useToast();
  const [currentStep, setCurrentStep] = useState<StepKey>('customer');
  const [, setLoading] = useState(false);
  const [userSchema, setUserSchema] = useState<string | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    // Customer Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',

    // Vehicle Info
    year: '',
    make: '',
    model: '',
    trim: '',
    vin: '',
    stockNumber: '',
    mileage: '',
    color: '',

    // Deal Info
    salesperson: '',
    saleDate: '',
    sellingPrice: '',
    tradeInValue: '',
    tradeInPayoff: '',
    downPayment: '',
    taxRate: '',

    // F&I Products
    extendedWarranty: false,
    extendedWarrantyPrice: '',
    gapInsurance: false,
    gapInsurancePrice: '',
    paintProtection: false,
    paintProtectionPrice: '',
    tireWheel: false,
    tireWheelPrice: '',

    // Payment Info
    financeAmount: '',
    termMonths: '',
    apr: '',
    lender: '',
    monthlyPayment: '',
  });

  // Step configuration
  const steps: Record<StepKey, StepConfig> = {
    customer: {
      title: 'Customer Information',
      description: 'Enter customer contact details',
      icon: <User className="h-6 w-6" />,
    },
    vehicle: {
      title: 'Vehicle Information',
      description: 'Enter vehicle details',
      icon: <Car className="h-6 w-6" />,
    },
    deal: {
      title: 'Deal Information',
      description: 'Enter basic deal structure',
      icon: <Clipboard className="h-6 w-6" />,
    },
    products: {
      title: 'F&I Products',
      description: 'Add F&I products to the deal',
      icon: <FileText className="h-6 w-6" />,
    },
    payment: {
      title: 'Payment Information',
      description: 'Enter financing details',
      icon: <CreditCard className="h-6 w-6" />,
    },
    review: {
      title: 'Review & Submit',
      description: 'Review and finalize the deal',
      icon: <Check className="h-6 w-6" />,
    },
  };

  // Step order for navigation
  const stepOrder: StepKey[] = ['customer', 'vehicle', 'deal', 'products', 'payment', 'review'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const nextStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const calculateFiProfit = () => {
    let total = 0;

    if (formData.extendedWarranty && formData.extendedWarrantyPrice) {
      total += parseFloat(formData.extendedWarrantyPrice);
    }

    if (formData.gapInsurance && formData.gapInsurancePrice) {
      total += parseFloat(formData.gapInsurancePrice);
    }

    if (formData.paintProtection && formData.paintProtectionPrice) {
      total += parseFloat(formData.paintProtectionPrice);
    }

    if (formData.tireWheel && formData.tireWheelPrice) {
      total += parseFloat(formData.tireWheelPrice);
    }

    return isNaN(total) ? 0 : total;
  };

  // Fetch user's schema on component mount
  useEffect(() => {
    const fetchUserSchema = async () => {
      try {
        console.log('[LogNewDealPage] Fetching user schema...');
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          console.error('[LogNewDealPage] No authenticated user found');
          toast({
            title: 'Authentication Error',
            description: 'Please log in to continue',
            variant: 'destructive',
          });
          navigate('/login');
          return;
        }

        console.log('[LogNewDealPage] User authenticated:', user.id);

        // Fetch the user's schema from schema_user_mappings
        const { data: schemaMapping, error } = await supabase
          .from('schema_user_mappings')
          .select('schema_name')
          .eq('user_id', user.id)
          .eq('schema_type', 'finance_manager')
          .single();

        if (error) {
          console.error('[LogNewDealPage] Error fetching schema mapping:', error);
          return;
        }

        if (schemaMapping?.schema_name) {
          console.log('[LogNewDealPage] User schema found:', schemaMapping.schema_name);
          setUserSchema(schemaMapping.schema_name);
        } else {
          console.warn(
            '[LogNewDealPage] No schema found for user. Using public schema as fallback.'
          );
          setUserSchema('public');
        }
      } catch (error) {
        console.error('[LogNewDealPage] Unexpected error:', error);
      }
    };

    fetchUserSchema();
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('[LogNewDealPage] Submitting new deal...');

      // Calculate F&I profit
      const fiProfit = calculateFiProfit();

      // Get current authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error('[LogNewDealPage] No authenticated user found during submission');
        toast({
          title: 'Authentication Error',
          description: 'Please log in to continue',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      // Create a deal object
      const dealId = `D${Math.floor(1000 + Math.random() * 9000)}`;
      const products = [
        ...(formData.extendedWarranty ? ['Extended Warranty'] : []),
        ...(formData.gapInsurance ? ['GAP Insurance'] : []),
        ...(formData.paintProtection ? ['Paint Protection'] : []),
        ...(formData.tireWheel ? ['Tire & Wheel'] : []),
      ];

      const newDeal = {
        user_id: user.id,
        deal_amount: parseFloat(formData.sellingPrice) || 0,
        vsc_sold: formData.extendedWarranty,
        product_profit: fiProfit,
        deal_details: {
          dealId,
          customer: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
          },
          vehicle: {
            year: formData.year,
            make: formData.make,
            model: formData.model,
            trim: formData.trim,
            vin: formData.vin,
            stockNumber: formData.stockNumber,
            mileage: formData.mileage,
            color: formData.color,
          },
          deal: {
            salesperson: formData.salesperson,
            saleDate: formData.saleDate || new Date().toISOString().slice(0, 10),
            sellingPrice: formData.sellingPrice,
            tradeInValue: formData.tradeInValue,
            tradeInPayoff: formData.tradeInPayoff,
            downPayment: formData.downPayment,
            taxRate: formData.taxRate,
          },
          products: {
            extendedWarranty: {
              selected: formData.extendedWarranty,
              price: formData.extendedWarrantyPrice,
            },
            gapInsurance: {
              selected: formData.gapInsurance,
              price: formData.gapInsurancePrice,
            },
            paintProtection: {
              selected: formData.paintProtection,
              price: formData.paintProtectionPrice,
            },
            tireWheel: {
              selected: formData.tireWheel,
              price: formData.tireWheelPrice,
            },
          },
          payment: {
            financeAmount: formData.financeAmount,
            termMonths: formData.termMonths,
            apr: formData.apr,
            lender: formData.lender,
            monthlyPayment: formData.monthlyPayment,
          },
          status: 'Bank Approval',
        },
      };

      console.log('[LogNewDealPage] Deal data prepared:', newDeal);
      console.log('[LogNewDealPage] Using schema:', userSchema);

      // First, save to local storage as backup
      saveToLocalStorage(newDeal);

      if (!userSchema) {
        throw new Error('No schema found for user');
      }

      // Insert into the user's schema deals table
      const { error } = await supabase.from(`${userSchema}.deals`).insert([newDeal]);

      if (error) {
        console.error('[LogNewDealPage] Error saving deal to database:', error);
        throw error;
      }

      console.log('[LogNewDealPage] Deal successfully saved to database');

      toast({
        title: 'Deal Saved',
        description: 'The deal has been successfully recorded',
      });

      // Navigate back to the dashboard
      navigate('/finance');
    } catch (error) {
      console.error('[LogNewDealPage] Error during deal submission:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the deal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate where we are in the process (progress)
  const progress = ((stepOrder.indexOf(currentStep) + 1) / stepOrder.length) * 100;

  // Render the appropriate form step
  const renderStep = () => {
    switch (currentStep) {
      case 'customer':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'vehicle':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  name="make"
                  value={formData.make}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="trim">Trim</Label>
                <Input id="trim" name="trim" value={formData.trim} onChange={handleInputChange} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vin">VIN</Label>
                <Input
                  id="vin"
                  name="vin"
                  value={formData.vin}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="stockNumber">Stock Number</Label>
                <Input
                  id="stockNumber"
                  name="stockNumber"
                  value={formData.stockNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mileage">Mileage</Label>
                <Input
                  id="mileage"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'deal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="salesperson">Salesperson</Label>
                <Input
                  id="salesperson"
                  name="salesperson"
                  value={formData.salesperson}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="saleDate">Sale Date</Label>
                <Input
                  id="saleDate"
                  name="saleDate"
                  type="date"
                  value={formData.saleDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="sellingPrice">Selling Price</Label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <Input
                  id="sellingPrice"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tradeInValue">Trade-In Value</Label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={16}
                  />
                  <Input
                    id="tradeInValue"
                    name="tradeInValue"
                    value={formData.tradeInValue}
                    onChange={handleInputChange}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="tradeInPayoff">Trade-In Payoff</Label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={16}
                  />
                  <Input
                    id="tradeInPayoff"
                    name="tradeInPayoff"
                    value={formData.tradeInPayoff}
                    onChange={handleInputChange}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="downPayment">Down Payment</Label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={16}
                  />
                  <Input
                    id="downPayment"
                    name="downPayment"
                    value={formData.downPayment}
                    onChange={handleInputChange}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="extendedWarranty"
                  checked={formData.extendedWarranty}
                  onCheckedChange={checked =>
                    handleCheckboxChange('extendedWarranty', checked as boolean)
                  }
                />
                <div className="flex flex-col">
                  <Label htmlFor="extendedWarranty" className="text-base">
                    Extended Warranty
                  </Label>
                  <span className="text-sm text-gray-500">Vehicle service contract protection</span>
                </div>
                <div className="ml-auto">
                  <div className="relative">
                    <DollarSign
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={16}
                    />
                    <Input
                      id="extendedWarrantyPrice"
                      name="extendedWarrantyPrice"
                      value={formData.extendedWarrantyPrice}
                      onChange={handleInputChange}
                      className="pl-9 w-32"
                      placeholder="Price"
                      disabled={!formData.extendedWarranty}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="gapInsurance"
                  checked={formData.gapInsurance}
                  onCheckedChange={checked =>
                    handleCheckboxChange('gapInsurance', checked as boolean)
                  }
                />
                <div className="flex flex-col">
                  <Label htmlFor="gapInsurance" className="text-base">
                    GAP Insurance
                  </Label>
                  <span className="text-sm text-gray-500">
                    Covers the gap between loan and value
                  </span>
                </div>
                <div className="ml-auto">
                  <div className="relative">
                    <DollarSign
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={16}
                    />
                    <Input
                      id="gapInsurancePrice"
                      name="gapInsurancePrice"
                      value={formData.gapInsurancePrice}
                      onChange={handleInputChange}
                      className="pl-9 w-32"
                      placeholder="Price"
                      disabled={!formData.gapInsurance}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="paintProtection"
                  checked={formData.paintProtection}
                  onCheckedChange={checked =>
                    handleCheckboxChange('paintProtection', checked as boolean)
                  }
                />
                <div className="flex flex-col">
                  <Label htmlFor="paintProtection" className="text-base">
                    Paint Protection
                  </Label>
                  <span className="text-sm text-gray-500">Guards against environmental damage</span>
                </div>
                <div className="ml-auto">
                  <div className="relative">
                    <DollarSign
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={16}
                    />
                    <Input
                      id="paintProtectionPrice"
                      name="paintProtectionPrice"
                      value={formData.paintProtectionPrice}
                      onChange={handleInputChange}
                      className="pl-9 w-32"
                      placeholder="Price"
                      disabled={!formData.paintProtection}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="tireWheel"
                  checked={formData.tireWheel}
                  onCheckedChange={checked => handleCheckboxChange('tireWheel', checked as boolean)}
                />
                <div className="flex flex-col">
                  <Label htmlFor="tireWheel" className="text-base">
                    Tire & Wheel Protection
                  </Label>
                  <span className="text-sm text-gray-500">Covers tire and wheel damage</span>
                </div>
                <div className="ml-auto">
                  <div className="relative">
                    <DollarSign
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      size={16}
                    />
                    <Input
                      id="tireWheelPrice"
                      name="tireWheelPrice"
                      value={formData.tireWheelPrice}
                      onChange={handleInputChange}
                      className="pl-9 w-32"
                      placeholder="Price"
                      disabled={!formData.tireWheel}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="financeAmount">Finance Amount</Label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <Input
                  id="financeAmount"
                  name="financeAmount"
                  value={formData.financeAmount}
                  onChange={handleInputChange}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="termMonths">Term (Months)</Label>
                <Input
                  id="termMonths"
                  name="termMonths"
                  value={formData.termMonths}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="apr">APR (%)</Label>
                <Input
                  id="apr"
                  name="apr"
                  value={formData.apr}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="lender">Lender</Label>
              <Input
                id="lender"
                name="lender"
                value={formData.lender}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="monthlyPayment">Monthly Payment</Label>
              <div className="relative">
                <DollarSign
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <Input
                  id="monthlyPayment"
                  name="monthlyPayment"
                  value={formData.monthlyPayment}
                  onChange={handleInputChange}
                  className="pl-9"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Customer Information</h3>
                <div className="mt-2 text-sm">
                  <p>
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p>{formData.email}</p>
                  <p>{formData.phone}</p>
                  <p>{formData.address}</p>
                  <p>
                    {formData.city}, {formData.state} {formData.zipCode}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Vehicle Information</h3>
                <div className="mt-2 text-sm">
                  <p>
                    {formData.year} {formData.make} {formData.model} {formData.trim}
                  </p>
                  <p>VIN: {formData.vin}</p>
                  <p>Stock: {formData.stockNumber}</p>
                  <p>Mileage: {formData.mileage}</p>
                  <p>Color: {formData.color}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Deal Information</h3>
                <div className="mt-2 text-sm">
                  <p>Salesperson: {formData.salesperson}</p>
                  <p>Sale Date: {formData.saleDate}</p>
                  <p>Selling Price: ${formData.sellingPrice}</p>
                  <p>Trade-In Value: ${formData.tradeInValue || '0'}</p>
                  <p>Trade-In Payoff: ${formData.tradeInPayoff || '0'}</p>
                  <p>Down Payment: ${formData.downPayment || '0'}</p>
                  <p>Tax Rate: {formData.taxRate}%</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">F&I Products</h3>
                <div className="mt-2 text-sm">
                  {formData.extendedWarranty && (
                    <p>Extended Warranty: ${formData.extendedWarrantyPrice}</p>
                  )}
                  {formData.gapInsurance && <p>GAP Insurance: ${formData.gapInsurancePrice}</p>}
                  {formData.paintProtection && (
                    <p>Paint Protection: ${formData.paintProtectionPrice}</p>
                  )}
                  {formData.tireWheel && <p>Tire & Wheel: ${formData.tireWheelPrice}</p>}
                  {!formData.extendedWarranty &&
                    !formData.gapInsurance &&
                    !formData.paintProtection &&
                    !formData.tireWheel && <p>No F&I products added</p>}
                </div>
              </div>

              <div className="col-span-2">
                <h3 className="font-medium text-gray-900">Payment Information</h3>
                <div className="mt-2 text-sm grid grid-cols-2 gap-4">
                  <div>
                    <p>Finance Amount: ${formData.financeAmount}</p>
                    <p>Term: {formData.termMonths} months</p>
                    <p>APR: {formData.apr}%</p>
                  </div>
                  <div>
                    <p>Lender: {formData.lender}</p>
                    <p>Monthly Payment: ${formData.monthlyPayment}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 font-medium">
                  Please review all information carefully before submitting.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Log New Deal</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Progress bar */}
          <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>

          {/* Steps Indicator */}
          <div className="grid grid-cols-6 gap-4 mb-8">
            {Object.entries(steps).map(([key, step], index) => (
              <div
                key={key}
                className={`flex flex-col items-center text-center ${
                  currentStep === key ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                    stepOrder.indexOf(currentStep as StepKey) >= index
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step.icon}
                </div>
                <span className="text-xs font-medium">{step.title}</span>
              </div>
            ))}
          </div>

          {/* Current step form */}
          <div>
            <h2 className="text-xl font-semibold mb-1">{steps[currentStep].title}</h2>
            <p className="text-gray-500 mb-6">{steps[currentStep].description}</p>

            <form onSubmit={currentStep === 'review' ? handleSubmit : e => e.preventDefault()}>
              {renderStep()}
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 'customer'}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep === 'review' ? (
            <Button type="submit" onClick={handleSubmit}>
              Submit Deal
              <Check className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default LogNewDealPage;
