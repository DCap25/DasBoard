import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Textarea } from '../../components/ui/textarea';
import { toast } from '../../components/ui/use-toast';
import { ArrowLeft, DollarSign, User, FileText, Calculator, Plus, Trash2 } from 'lucide-react';

// Interface for team member
interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  role: 'salesperson' | 'sales_manager';
  active: boolean;
}

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
  const { dealId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalDeal, setOriginalDeal] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showAddSalesperson, setShowAddSalesperson] = useState(false);
  const [newSalesperson, setNewSalesperson] = useState({ firstName: '', lastName: '' });

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
    
    // Load team members from localStorage
    loadTeamMembers();
    
    // Check if we're in edit mode
    if (dealId) {
      setIsEditMode(true);
      loadDealForEdit(dealId);
    }
  }, [dealId]);

  // Load team members from localStorage
  const loadTeamMembers = () => {
    try {
      const savedTeamMembers = localStorage.getItem('singleFinanceTeamMembers');
      if (savedTeamMembers) {
        setTeamMembers(JSON.parse(savedTeamMembers));
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  // Save team members to localStorage
  const saveTeamMembers = (members: TeamMember[]) => {
    try {
      localStorage.setItem('singleFinanceTeamMembers', JSON.stringify(members));
      setTeamMembers(members);
    } catch (error) {
      console.error('Error saving team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to save team members',
        variant: 'destructive'
      });
    }
  };

  // Add new salesperson
  const handleAddSalesperson = () => {
    if (!newSalesperson.firstName || !newSalesperson.lastName) {
      toast({
        title: 'Validation Error',
        description: 'First name and last name are required',
        variant: 'destructive'
      });
      return;
    }

    const initials = `${newSalesperson.firstName.charAt(0)}${newSalesperson.lastName.charAt(0)}`.toUpperCase();
    
    const member: TeamMember = {
      id: `member_${Date.now()}`,
      firstName: newSalesperson.firstName,
      lastName: newSalesperson.lastName,
      initials,
      role: 'salesperson',
      active: true
    };

    const updatedMembers = [...teamMembers, member];
    saveTeamMembers(updatedMembers);
    
    // Reset form and close modal
    setNewSalesperson({ firstName: '', lastName: '' });
    setShowAddSalesperson(false);

    toast({
      title: 'Success',
      description: `${member.firstName} ${member.lastName} added to team`
    });
  };

  // Remove salesperson
  const handleRemoveSalesperson = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (confirm(`Are you sure you want to remove ${member?.firstName} ${member?.lastName}?`)) {
      const updatedMembers = teamMembers.filter(m => m.id !== memberId);
      saveTeamMembers(updatedMembers);
      
      // Clear selection if the removed member was selected
      if (formData.salespersonId === memberId) {
        setFormData(prev => ({ ...prev, salespersonId: '' }));
      }
      if (formData.secondSalespersonId === memberId) {
        setFormData(prev => ({ ...prev, secondSalespersonId: '' }));
      }
      
      toast({
        title: 'Success',
        description: 'Team member removed'
      });
    }
  };

  // Load existing deal data for editing
  const loadDealForEdit = (dealIdToEdit: string) => {
    try {
      const existingDealsJson = localStorage.getItem('singleFinanceDeals');
      const existingDeals = existingDealsJson ? JSON.parse(existingDealsJson) : [];
      
      const dealToEdit = existingDeals.find((deal: any) => deal.id === dealIdToEdit);
      
      if (dealToEdit) {
        console.log('[LogSingleFinanceDeal] Loading deal for edit:', dealToEdit);
        setOriginalDeal(dealToEdit);
        
        // Map the deal data back to form data
        setFormData({
          dealNumber: dealToEdit.dealNumber || '',
          stockNumber: dealToEdit.stockNumber || '',
          vinLast8: dealToEdit.vinLast8 || '',
          vehicleType: dealToEdit.vehicleType || 'N',
          customerName: dealToEdit.customer || dealToEdit.lastName || '',
          vehicleDescription: dealToEdit.vehicleDescription || '',
          dealType: dealToEdit.dealType || 'Finance',
          saleDate: dealToEdit.dealDate || dealToEdit.saleDate || new Date().toISOString().split('T')[0],
          frontEndGross: dealToEdit.frontEndGross?.toString() || '',
          salespersonId: dealToEdit.salesperson_id?.toString() || '',
          isSplitDeal: dealToEdit.is_split_deal || false,
          secondSalespersonId: dealToEdit.second_salesperson_id?.toString() || '',
          lender: dealToEdit.lender || '',
          reserveFlat: dealToEdit.reserve_flat?.toString() || '',
          vscProfit: dealToEdit.vscProfit?.toString() || '',
          gapProfit: dealToEdit.gapProfit?.toString() || '',
          ppmProfit: dealToEdit.ppmProfit?.toString() || '',
          tireWheelProfit: dealToEdit.tireAndWheelProfit?.toString() || '',
          appearanceProfit: dealToEdit.appearanceProfit?.toString() || '',
          keyReplacementProfit: dealToEdit.keyReplacementProfit?.toString() || '',
          theftProfit: dealToEdit.theftProfit?.toString() || '',
          windshieldProfit: dealToEdit.windshieldProfit?.toString() || '',
          lojackProfit: dealToEdit.lojackProfit?.toString() || '',
          extWarrantyProfit: dealToEdit.extWarrantyProfit?.toString() || '',
          otherProfit: dealToEdit.otherProfit?.toString() || '',
          backEndGross: dealToEdit.backEndGross?.toString() || '',
          totalGross: dealToEdit.totalGross?.toString() || '',
          status: dealToEdit.status || dealToEdit.dealStatus || 'pending',
          notes: dealToEdit.notes || ''
        });
      } else {
        console.error('[LogSingleFinanceDeal] Deal not found for editing:', dealIdToEdit);
        toast({
          title: 'Error',
          description: 'Deal not found for editing',
          variant: 'destructive'
        });
        navigate('/dashboard/single-finance');
      }
    } catch (error) {
      console.error('[LogSingleFinanceDeal] Error loading deal for edit:', error);
      toast({
        title: 'Error',
        description: 'Failed to load deal for editing',
        variant: 'destructive'
      });
      navigate('/dashboard/single-finance');
    }
  };

  // Handle key press to prevent accidental form submission on Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('[LogSingleFinanceDeal] Enter key pressed in input field - prevented form submission');
      // Move focus to next field or keep focus on current field
      const form = e.currentTarget.form;
      if (form) {
        const elements = Array.from(form.elements) as HTMLElement[];
        const currentIndex = elements.indexOf(e.currentTarget as HTMLElement);
        const nextElement = elements[currentIndex + 1] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        if (nextElement && nextElement.focus) {
          nextElement.focus();
        }
      }
    }
  };

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
      console.log(`[LogSingleFinanceDeal] ${isEditMode ? 'Updating' : 'Submitting'} deal for Single Finance Dashboard`);

      // Use existing ID for edit mode, or generate new ID for create mode
      const dealIdToUse = isEditMode ? dealId : (formData.dealNumber || `SF${Math.floor(1000 + Math.random() * 9000)}`);

      // Get salesperson information from team members
      const salesperson = teamMembers.find(s => s.id === formData.salespersonId);
      const salespersonInitials = salesperson ? salesperson.initials : '';

      let secondSalespersonInitials = '';
      if (formData.isSplitDeal && formData.secondSalespersonId) {
        const secondSalesperson = teamMembers.find(s => s.id === formData.secondSalespersonId);
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
        id: dealIdToUse,
        dealNumber: dealIdToUse,
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
        
        let updatedDeals;
        if (isEditMode) {
          // Update existing deal
          updatedDeals = existingDeals.map((deal: any) => 
            deal.id === dealIdToUse ? dealData : deal
          );
          console.log('[LogSingleFinanceDeal] Deal updated in singleFinanceDeals storage:', dealData);
        } else {
          // Add new deal
          updatedDeals = [dealData, ...existingDeals];
          console.log('[LogSingleFinanceDeal] Deal saved to singleFinanceDeals storage:', dealData);
        }
        
        localStorage.setItem('singleFinanceDeals', JSON.stringify(updatedDeals));
        
        // Dispatch custom event to notify dashboard of data change
        window.dispatchEvent(new CustomEvent('singleFinanceDealsUpdated', { 
          detail: { deals: updatedDeals, updatedDeal: dealData } 
        }));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }

      toast({
        title: 'Success',
        description: isEditMode 
          ? 'Deal updated successfully!' 
          : 'Deal logged successfully to Single Finance Dashboard!',
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
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Edit Deal - Single Finance Dashboard' : 'Log New Deal - Single Finance Dashboard'}
        </h1>
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
          <strong>Note:</strong> {isEditMode 
            ? 'You are editing an existing deal. Changes will be reflected immediately on your dashboard.'
            : 'This deal will only appear on your Single Finance Manager Dashboard and will not affect other dashboards in the system.'
          }
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
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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
                <div className="space-y-2">
                  <select
                    id="salespersonId"
                    name="salespersonId"
                    value={formData.salespersonId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Salesperson</option>
                    {teamMembers.filter(member => member.role === 'salesperson' && member.active).map(person => (
                      <option key={person.id} value={person.id}>
                        {person.initials} - {person.firstName} {person.lastName}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => setShowAddSalesperson(true)}
                      className="flex items-center text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1"
                      size="sm"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add
                    </Button>
                    {formData.salespersonId && (
                      <Button
                        type="button"
                        onClick={() => handleRemoveSalesperson(formData.salespersonId)}
                        className="flex items-center text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1"
                        size="sm"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frontEndGross">Front End Gross</Label>
                <Input
                  id="frontEndGross"
                  name="frontEndGross"
                  value={formData.frontEndGross}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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
                <div className="space-y-2">
                  <select
                    id="secondSalespersonId"
                    name="secondSalespersonId"
                    value={formData.secondSalespersonId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Second Salesperson</option>
                    {teamMembers.filter(member => member.role === 'salesperson' && member.active && member.id !== formData.salespersonId).map(person => (
                      <option key={person.id} value={person.id}>
                        {person.initials} - {person.firstName} {person.lastName}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => setShowAddSalesperson(true)}
                      className="flex items-center text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1"
                      size="sm"
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add
                    </Button>
                    {formData.secondSalespersonId && (
                      <Button
                        type="button"
                        onClick={() => handleRemoveSalesperson(formData.secondSalespersonId)}
                        className="flex items-center text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1"
                        size="sm"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
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
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
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
                onKeyDown={handleKeyDown}
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
            {isSubmitting 
              ? (isEditMode ? 'Updating Deal...' : 'Saving Deal...') 
              : (isEditMode ? 'Update Deal' : 'Save Deal')
            }
          </Button>
        </div>
      </form>

      {/* Add Salesperson Modal */}
      {showAddSalesperson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Add New Salesperson</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newFirstName">First Name</Label>
                <Input
                  id="newFirstName"
                  value={newSalesperson.firstName}
                  onChange={(e) => setNewSalesperson(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="newLastName">Last Name</Label>
                <Input
                  id="newLastName"
                  value={newSalesperson.lastName}
                  onChange={(e) => setNewSalesperson(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddSalesperson(false);
                  setNewSalesperson({ firstName: '', lastName: '' });
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddSalesperson}
                className="bg-green-500 hover:bg-green-600"
              >
                Add Salesperson
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
