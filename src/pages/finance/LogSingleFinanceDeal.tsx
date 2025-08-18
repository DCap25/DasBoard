import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/TranslationContext';
import { getConsistentUserId, getUserIdSync, debugUserId } from '../../utils/userIdHelper';
import { getSecureSupabaseClient, quickHasSupabaseSessionToken } from '../../lib/supabaseClient';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Textarea } from '../../components/ui/textarea';
import { toast } from '../../components/ui/use-toast';
import { SingleFinanceStorage } from '../../lib/singleFinanceStorage';
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

const LENDERS = [
  // Top 3 most used lenders
  'Ford Motor Credit',
  'Chase',
  'Ally Bank',
  // Alphabetical order for the rest
  'American Credit Acceptance',
  'Americredit',
  'Bank of America',
  'Capital One',
  'Chrysler Capital',
  'Crescent Bank',
  'Exeter',
  'First Help Financial',
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

// Interface for form data
interface DealFormData {
  dealNumber: string;
  stockNumber: string;
  vinLast8: string;
  vehicleType: string;
  manufacturer: string;
  customerName: string;
  dealType: string;
  status: string;
  saleDate: string;
  frontEndGross: string;
  salespersonId: string;
  salesManagerId: string;
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
  theftProfit: string;
  bundledProfit: string;
  keyReplacementProfit: string;
  windshieldProfit: string;
  lojackProfit: string;
  extWarrantyProfit: string;
  otherProfit: string;
  // Calculated fields
  backEndGross: string;
  totalGross: string;
  notes: string;
}

export default function LogSingleFinanceDeal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { dealId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalDeal, setOriginalDeal] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showAddSalesperson, setShowAddSalesperson] = useState(false);
  const [newSalesperson, setNewSalesperson] = useState({ firstName: '', lastName: '' });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [localUserId, setLocalUserId] = useState<string | null>(null);

  // Helper to resolve a consistent user ID (context or token fallback)
  const getUserId = (): string | null => {
    const userId = getUserIdSync(user, localUserId);
    debugUserId('LogSingleFinanceDeal', user, localUserId);
    console.log('[LogSingleFinanceDeal] Final resolved user ID:', userId);
    return userId;
  };

  // Try to resolve user id from Supabase session if context not ready
  useEffect(() => {
    let cancelled = false;
    const tryFetch = async () => {
      if (localUserId || user?.id) return;
      if (!quickHasSupabaseSessionToken()) return;
      try {
        const supabase = await getSecureSupabaseClient();
        const { data } = await supabase.auth.getSession();
        const uid = data?.session?.user?.id || null;
        if (!cancelled && uid) setLocalUserId(uid);
      } catch (error) {
        console.error('[LogSingleFinanceDeal] Error getting session:', error);
      }
    };
    tryFetch();
    const t = setTimeout(tryFetch, 800);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [user, localUserId]);

  // Initialize form data
  const [formData, setFormData] = useState<DealFormData>({
    dealNumber: '',
    stockNumber: '',
    vinLast8: '',
    vehicleType: 'N',
    manufacturer: '',
    customerName: '',
    dealType: 'Finance',
    status: 'Pending',
    saleDate: new Date().toISOString().split('T')[0],
    frontEndGross: '',
    salespersonId: '',
    salesManagerId: '',
    isSplitDeal: false,
    secondSalespersonId: '',
    lender: '',
    reserveFlat: '',
    vscProfit: '',
    gapProfit: '',
    ppmProfit: '',
    tireWheelProfit: '',
    appearanceProfit: '',
    theftProfit: '',
    bundledProfit: '',
    keyReplacementProfit: '',
    windshieldProfit: '',
    lojackProfit: '',
    extWarrantyProfit: '',
    otherProfit: '',
    backEndGross: '',
    totalGross: '',
    notes: '',
  });

  // Calculate back end gross and total gross whenever profit fields change
  useEffect(() => {
    const calculateTotals = () => {
      // Product profits (only the ones we have in the current form)
      const vsc = parseFloat(formData.vscProfit) || 0;
      const gap = parseFloat(formData.gapProfit) || 0;
      const ppm = parseFloat(formData.ppmProfit) || 0;
      const tireWheel = parseFloat(formData.tireWheelProfit) || 0;
      const appearance = parseFloat(formData.appearanceProfit) || 0;
      const theft = parseFloat(formData.theftProfit) || 0;
      const bundled = parseFloat(formData.bundledProfit) || 0;
      const other = parseFloat(formData.otherProfit) || 0;
      const reserve = parseFloat(formData.reserveFlat) || 0;

      // Back End Gross = All product profits + Reserve/Flat
      const backEndGross =
        vsc + gap + ppm + tireWheel + appearance + theft + bundled + other + reserve;

      // Total Gross = Front End Gross + Back End Gross
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
    formData.theftProfit,
    formData.bundledProfit,
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

    // Listen for team member updates from Settings page
    const handleTeamMembersUpdated = (e: any) => {
      console.log('[LogSingleFinanceDeal] Team members updated event received:', e.detail);
      loadTeamMembers(); // Reload team members from localStorage
    };

    // Listen for storage changes (fallback for cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      const userId = getUserId();
      if (userId && e.key === `singleFinanceTeamMembers_${userId}`) {
        console.log('[LogSingleFinanceDeal] Team members storage changed, reloading');
        loadTeamMembers();
      }
    };

    window.addEventListener('teamMembersUpdated', handleTeamMembersUpdated);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('teamMembersUpdated', handleTeamMembersUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [dealId]);

  // Make user available globally for encryption layer and reload team members when user changes
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      (window as any).__authUser = user;
      console.log('[LogSingleFinanceDeal] User changed, reloading team members');
      loadTeamMembers();
    }
  }, [user]);

  // Also reload team members when localUserId changes
  useEffect(() => {
    if (localUserId) {
      console.log('[LogSingleFinanceDeal] LocalUserId changed, reloading team members');
      loadTeamMembers();
    }
  }, [localUserId]);

  // Load team members from localStorage
  const loadTeamMembers = () => {
    const userId = getUserId();
    console.log('[LogSingleFinanceDeal] loadTeamMembers called, resolved userId:', userId);
    console.log('[LogSingleFinanceDeal] user context:', user);
    console.log('[LogSingleFinanceDeal] localUserId:', localUserId);

    if (!userId) {
      console.log('[LogSingleFinanceDeal] No user ID resolved, skipping load');
      return;
    }

    try {
      console.log('[LogSingleFinanceDeal] Loading team members for userId:', userId);
      const savedTeamMembers = SingleFinanceStorage.getTeamMembers(userId);
      console.log('[LogSingleFinanceDeal] Loaded team members:', savedTeamMembers);
      setTeamMembers(savedTeamMembers);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  // Save team members to localStorage
  const saveTeamMembers = (members: TeamMember[]) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      SingleFinanceStorage.setTeamMembers(userId, members);
      setTeamMembers(members);
    } catch (error) {
      console.error('Error saving team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to save team members',
        variant: 'destructive',
      });
    }
  };

  // Add new salesperson
  const handleAddSalesperson = () => {
    if (!newSalesperson.firstName || !newSalesperson.lastName) {
      toast({
        title: 'Validation Error',
        description: 'First name and last name are required',
        variant: 'destructive',
      });
      return;
    }

    const initials =
      `${newSalesperson.firstName.charAt(0)}${newSalesperson.lastName.charAt(0)}`.toUpperCase();

    const member: TeamMember = {
      id: `member_${Date.now()}`,
      firstName: newSalesperson.firstName,
      lastName: newSalesperson.lastName,
      initials,
      role: 'salesperson',
      active: true,
    };

    const updatedMembers = [...teamMembers, member];
    saveTeamMembers(updatedMembers);

    // Reset form and close modal
    setNewSalesperson({ firstName: '', lastName: '' });
    setShowAddSalesperson(false);

    toast({
      title: 'Success',
      description: `${member.firstName} ${member.lastName} added to team`,
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
        description: 'Team member removed',
      });
    }
  };

  // Load existing deal data for editing
  const loadDealForEdit = (dealIdToEdit: string) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const existingDeals = SingleFinanceStorage.getDeals(userId);

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
          manufacturer: dealToEdit.manufacturer || '',
          customerName: dealToEdit.customer || dealToEdit.lastName || '',
          dealType: dealToEdit.dealType || 'Finance',
          status: dealToEdit.status || 'Pending',
          saleDate:
            dealToEdit.dealDate || dealToEdit.saleDate || new Date().toISOString().split('T')[0],
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
          bundledProfit: dealToEdit.bundledProfit?.toString() || '',
          windshieldProfit: dealToEdit.windshieldProfit?.toString() || '',
          lojackProfit: dealToEdit.lojackProfit?.toString() || '',
          extWarrantyProfit: dealToEdit.extWarrantyProfit?.toString() || '',
          otherProfit: dealToEdit.otherProfit?.toString() || '',
          backEndGross: dealToEdit.backEndGross?.toString() || '',
          totalGross: dealToEdit.totalGross?.toString() || '',
          notes: dealToEdit.notes || '',
        });
      } else {
        console.error('[LogSingleFinanceDeal] Deal not found for editing:', dealIdToEdit);
        toast({
          title: 'Error',
          description: 'Deal not found for editing',
          variant: 'destructive',
        });
        navigate('/dashboard/single-finance');
      }
    } catch (error) {
      console.error('[LogSingleFinanceDeal] Error loading deal for edit:', error);
      toast({
        title: 'Error',
        description: 'Failed to load deal for editing',
        variant: 'destructive',
      });
      navigate('/dashboard/single-finance');
    }
  };

  // Handle key press to prevent accidental form submission on Enter
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log(
        '[LogSingleFinanceDeal] Enter key pressed in input field - prevented form submission'
      );
      // Move focus to next field or keep focus on current field
      const form = e.currentTarget.form;
      if (form) {
        const elements = Array.from(form.elements) as HTMLElement[];
        const currentIndex = elements.indexOf(e.currentTarget as HTMLElement);
        const nextElement = elements[currentIndex + 1] as
          | HTMLInputElement
          | HTMLTextAreaElement
          | HTMLSelectElement;
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
    if (name === 'stockNumber' || name === 'vinLast8' || name === 'customerName') {
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

    if (!formData.customerName) {
      toast({
        title: 'Validation Error',
        description: 'Customer name is a required field.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log(
        `[LogSingleFinanceDeal] ${isEditMode ? 'Updating' : 'Submitting'} deal for Single Finance Dashboard`
      );

      // Use existing ID for edit mode, or generate new ID for create mode
      const dealIdToUse = isEditMode
        ? dealId
        : formData.dealNumber || `SF${Math.floor(1000 + Math.random() * 9000)}`;

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
      if (parseFloat(formData.theftProfit) > 0) productsSold.push('Theft Protection');
      if (parseFloat(formData.bundledProfit) > 0) productsSold.push('Bundled Product');
      if (parseFloat(formData.keyReplacementProfit) > 0) productsSold.push('Key Replacement');
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
        } ${formData.manufacturer}`,
        vin: formData.vinLast8,
        vinLast8: formData.vinLast8,
        stock_number: formData.stockNumber,
        stockNumber: formData.stockNumber,
        sale_date: formData.saleDate,
        saleDate: formData.saleDate, // Backward compatibility
        dealDate: formData.saleDate, // For form field mapping
        deal_type: formData.dealType,
        dealType: formData.dealType,
        status: formData.status,
        vehicleType: formData.vehicleType,
        manufacturer: formData.manufacturer,
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
        bundled_profit: parseFloat(formData.bundledProfit) || 0,
        bundledProfit: parseFloat(formData.bundledProfit) || 0,
        windshield_profit: parseFloat(formData.windshieldProfit) || 0,
        windshieldProfit: parseFloat(formData.windshieldProfit) || 0,
        lojack_profit: parseFloat(formData.lojackProfit) || 0,
        lojackProfit: parseFloat(formData.lojackProfit) || 0,
        ext_warranty_profit: parseFloat(formData.extWarrantyProfit) || 0,
        extWarrantyProfit: parseFloat(formData.extWarrantyProfit) || 0,
        other_profit: parseFloat(formData.otherProfit) || 0,
        otherProfit: parseFloat(formData.otherProfit) || 0,
        products: productsSold,
        dealStatus: formData.status,
        notes: formData.notes,
        vsc_sold: parseFloat(formData.vscProfit) > 0,
        created_by: user?.email || 'unknown',
        created_at: new Date().toISOString(),
        // Mark as Single Finance deal
        dashboard_type: 'single_finance',
      };

      // Save to user-specific localStorage key for Single Finance Dashboard
      const userId = getUserId();
      if (!userId) {
        throw new Error('User ID is required');
      }

      try {
        const existingDeals = SingleFinanceStorage.getDeals(userId);

        let updatedDeals;
        if (isEditMode) {
          // Update existing deal
          updatedDeals = existingDeals.map((deal: any) =>
            deal.id === dealIdToUse ? dealData : deal
          );
          console.log(
            '[LogSingleFinanceDeal] Deal updated in singleFinanceDeals storage:',
            dealData
          );
        } else {
          // Add new deal
          updatedDeals = [dealData, ...existingDeals];
          console.log('[LogSingleFinanceDeal] Deal saved to singleFinanceDeals storage:', dealData);
        }

        SingleFinanceStorage.setDeals(userId, updatedDeals);

        // Dispatch custom event to notify dashboard of data change
        window.dispatchEvent(
          new CustomEvent('singleFinanceDealsUpdated', {
            detail: { deals: updatedDeals, updatedDeal: dealData },
          })
        );
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
          {isEditMode ? t('dashboard.dealLog.editDeal') : t('dashboard.dealLog.title')}
        </h1>
        <Button
          onClick={() => navigate('/dashboard/single-finance')}
          className="flex items-center bg-blue-500 text-white hover:bg-blue-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('dashboard.dealLog.backToDashboard')}
        </Button>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          <strong>{t('dashboard.dealLog.note')}:</strong>{' '}
          {isEditMode ? t('dashboard.dealLog.editingNote') : t('dashboard.dealLog.dashboardNote')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Deal Information Card - Reorganized Layout */}
        <Card className="p-6 border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center border-b pb-2 mb-4">
              <FileText className="mr-2 h-5 w-5 text-blue-500" />
              {t('dashboard.dealLog.dealInformation')}
            </h2>

            {/* First Row: Deal#, Sale Date, Stock#, VIN#, Vehicle Type, Manufacturer */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dealNumber">{t('dashboard.dealLog.dealNumber')}</Label>
                <Input
                  id="dealNumber"
                  name="dealNumber"
                  value={formData.dealNumber}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t('dashboard.dealLog.enterDealNumber')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="saleDate">{t('dashboard.dealLog.saleDate')}</Label>
                <Input
                  type="date"
                  id="saleDate"
                  name="saleDate"
                  value={formData.saleDate}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockNumber">{t('dashboard.dealLog.stockNumber')}</Label>
                <Input
                  id="stockNumber"
                  name="stockNumber"
                  value={formData.stockNumber}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t('dashboard.dealLog.stockNumber')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vinLast8">{t('dashboard.dealLog.vinLast8')}</Label>
                <Input
                  id="vinLast8"
                  name="vinLast8"
                  value={formData.vinLast8}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t('dashboard.dealLog.vinPlaceholder')}
                  maxLength={8}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleType">{t('dashboard.dealLog.vehicleType')}</Label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="w-full p-2 border-2 border-gray-400 rounded-md"
                >
                  <option value="N">{t('dashboard.dealLog.vehicleTypes.new')}</option>
                  <option value="U">{t('dashboard.dealLog.vehicleTypes.used')}</option>
                  <option value="C">{t('dashboard.dealLog.vehicleTypes.cpo')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="manufacturer">{t('dashboard.dealLog.manufacturer')}</Label>
                <select
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleInputChange}
                  className="w-full p-2 border-2 border-gray-400 rounded-md"
                >
                  <option value="">{t('dashboard.dealLog.selectManufacturer')}</option>
                  {/* Top 3 most used manufacturers */}
                  <option value="Ford">Ford</option>
                  <option value="Chevrolet">Chevrolet</option>
                  <option value="Toyota">Toyota</option>
                  {/* Alphabetical order for the rest */}
                  <option value="Acura">Acura</option>
                  <option value="Audi">Audi</option>
                  <option value="BMW">BMW</option>
                  <option value="Buick">Buick</option>
                  <option value="Cadillac">Cadillac</option>
                  <option value="Chrysler">Chrysler</option>
                  <option value="Dodge">Dodge</option>
                  <option value="GMC">GMC</option>
                  <option value="Honda">Honda</option>
                  <option value="Hyundai">Hyundai</option>
                  <option value="Infiniti">Infiniti</option>
                  <option value="Jeep">Jeep</option>
                  <option value="Kia">Kia</option>
                  <option value="Lexus">Lexus</option>
                  <option value="Lincoln">Lincoln</option>
                  <option value="Mazda">Mazda</option>
                  <option value="Mercedes-Benz">Mercedes-Benz</option>
                  <option value="Nissan">Nissan</option>
                  <option value="Ram">Ram</option>
                  <option value="Subaru">Subaru</option>
                  <option value="Tesla">Tesla</option>
                  <option value="Volkswagen">Volkswagen</option>
                  <option value="Volvo">Volvo</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Second Row: Customer Name, Salesperson, Sales Manager, Lender, Deal Type, Status */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">{t('dashboard.dealLog.customerName')}</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t('dashboard.dealLog.customerPlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Label htmlFor="salespersonId">{t('dashboard.dealLog.salesperson')}</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isSplitDeal"
                      checked={formData.isSplitDeal}
                      onCheckedChange={checked =>
                        setFormData(prev => ({
                          ...prev,
                          isSplitDeal: checked as boolean,
                          secondSalespersonId: checked ? prev.secondSalespersonId : '',
                        }))
                      }
                    />
                    <Label htmlFor="isSplitDeal" className="text-xs">
                      {t('dashboard.dealLog.splitDeal')}
                    </Label>
                  </div>
                </div>
                {formData.isSplitDeal ? (
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      id="salespersonId"
                      name="salespersonId"
                      value={formData.salespersonId}
                      onChange={handleInputChange}
                      className="w-full p-2 border-2 border-gray-400 rounded-md text-sm"
                    >
                      <option value="">{t('dashboard.dealLog.selectSalesperson')}</option>
                      {teamMembers
                        .filter(member => member.role === 'salesperson' && member.active)
                        .map(person => (
                          <option key={person.id} value={person.id}>
                            {person.firstName} {person.lastName}
                          </option>
                        ))}
                    </select>
                    <select
                      id="secondSalespersonId"
                      name="secondSalespersonId"
                      value={formData.secondSalespersonId}
                      onChange={handleInputChange}
                      className="w-full p-2 border-2 border-gray-400 rounded-md text-sm"
                    >
                      <option value="">{t('dashboard.dealLog.selectSecondSalesperson')}</option>
                      {teamMembers
                        .filter(
                          member =>
                            member.role === 'salesperson' &&
                            member.active &&
                            member.id !== formData.salespersonId
                        )
                        .map(person => (
                          <option key={person.id} value={person.id}>
                            {person.firstName} {person.lastName}
                          </option>
                        ))}
                    </select>
                  </div>
                ) : (
                  <select
                    id="salespersonId"
                    name="salespersonId"
                    value={formData.salespersonId}
                    onChange={handleInputChange}
                    className="w-full p-2 border-2 border-gray-400 rounded-md"
                  >
                    <option value="">{t('dashboard.dealLog.selectSalesperson')}</option>
                    {teamMembers
                      .filter(member => member.role === 'salesperson' && member.active)
                      .map(person => (
                        <option key={person.id} value={person.id}>
                          {person.firstName} {person.lastName}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="salesManagerId">{t('dashboard.dealLog.salesManager')}</Label>
                <select
                  id="salesManagerId"
                  name="salesManagerId"
                  value={formData.salesManagerId}
                  onChange={handleInputChange}
                  className="w-full p-2 border-2 border-gray-400 rounded-md"
                >
                  <option value="">{t('dashboard.dealLog.selectManager')}</option>
                  {teamMembers
                    .filter(member => member.role === 'sales_manager' && member.active)
                    .map(manager => (
                      <option key={manager.id} value={manager.id}>
                        {manager.firstName} {manager.lastName}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lender">{t('dashboard.dealLog.lender')}</Label>
                <select
                  id="lender"
                  name="lender"
                  value={formData.lender}
                  onChange={handleInputChange}
                  className="w-full p-2 border-2 border-gray-400 rounded-md"
                  disabled={formData.dealType === 'Cash'}
                >
                  <option value="">{t('dashboard.dealLog.selectLender')}</option>
                  {LENDERS.map(lender => (
                    <option key={lender} value={lender}>
                      {lender}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dealType">{t('dashboard.dealLog.dealType')}</Label>
                <select
                  id="dealType"
                  name="dealType"
                  value={formData.dealType}
                  onChange={handleInputChange}
                  className="w-full p-2 border-2 border-gray-400 rounded-md"
                >
                  <option value="Cash">{t('dashboard.dealLog.dealTypes.cash')}</option>
                  <option value="Finance">{t('dashboard.dealLog.dealTypes.finance')}</option>
                  <option value="Lease">{t('dashboard.dealLog.dealTypes.lease')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t('dashboard.dealLog.status')}</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border-2 border-gray-400 rounded-md"
                >
                  <option value="Pending">{t('dashboard.dealLog.statusOptions.pending')}</option>
                  <option value="Funded">{t('dashboard.dealLog.statusOptions.funded')}</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Two-column layout: Products & Profit on left, Financial Summary on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Products and Profit */}
          <Card className="p-2 border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold flex items-center border-b pb-1 mb-2">
                <DollarSign className="mr-1 h-3 w-3 text-blue-500" />
                {t('dashboard.dealLog.productsAndProfit')}
              </h2>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="vscProfit">{t('dashboard.dealLog.products.vscProfit')}</Label>
                    <Input
                      id="vscProfit"
                      name="vscProfit"
                      value={formData.vscProfit}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="gapProfit">{t('dashboard.dealLog.products.gapProfit')}</Label>
                    <Input
                      id="gapProfit"
                      name="gapProfit"
                      value={formData.gapProfit}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="ppmProfit">{t('dashboard.dealLog.products.ppmProfit')}</Label>
                    <Input
                      id="ppmProfit"
                      name="ppmProfit"
                      value={formData.ppmProfit}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tireWheelProfit">
                      {t('dashboard.dealLog.products.tireWheelProfit')}
                    </Label>
                    <Input
                      id="tireWheelProfit"
                      name="tireWheelProfit"
                      value={formData.tireWheelProfit}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="appearanceProfit">
                      {t('dashboard.dealLog.products.appearanceProfit')}
                    </Label>
                    <Input
                      id="appearanceProfit"
                      name="appearanceProfit"
                      value={formData.appearanceProfit}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="theftProfit">
                      {t('dashboard.dealLog.products.theftProfit')}
                    </Label>
                    <Input
                      id="theftProfit"
                      name="theftProfit"
                      value={formData.theftProfit}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="bundledProfit">
                      {t('dashboard.dealLog.products.bundledProfit')}
                    </Label>
                    <Input
                      id="bundledProfit"
                      name="bundledProfit"
                      value={formData.bundledProfit}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="otherProfit">
                      {t('dashboard.dealLog.products.otherProfit')}
                    </Label>
                    <Input
                      id="otherProfit"
                      name="otherProfit"
                      value={formData.otherProfit}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="0.00"
                      type="number"
                      step="0.01"
                      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Right Column: Financial Summary - Very Compact */}
          <Card className="p-2 border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <div className="space-y-2">
              <h2 className="text-sm font-semibold flex items-center border-b pb-1 mb-2">
                <Calculator className="mr-1 h-3 w-3 text-blue-500" />
                {t('dashboard.dealLog.financialSummary')}
              </h2>

              <div className="space-y-2">
                {/* Front End Gross */}
                <div className="p-2 bg-gray-50 rounded">
                  <Label htmlFor="frontEndGross" className="text-xs font-medium">
                    {t('dashboard.dealLog.frontEndGross')}
                  </Label>
                  <Input
                    id="frontEndGross"
                    name="frontEndGross"
                    value={formData.frontEndGross}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="mt-1 text-xs h-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                {/* Reserve/Flat */}
                <div className="p-2 bg-gray-50 rounded">
                  <Label htmlFor="reserveFlat" className="text-xs font-medium">
                    {t('dashboard.dealLog.reserveFlat')}
                  </Label>
                  <Input
                    id="reserveFlat"
                    name="reserveFlat"
                    value={formData.reserveFlat}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    className="mt-1 text-xs h-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                {/* Back End Gross - Calculated */}
                <div className="p-2 bg-green-50 rounded border border-green-200">
                  <Label className="text-xs font-medium text-green-900">
                    {t('dashboard.dealLog.backEndGross')}{' '}
                    <span className="text-[10px] font-normal">
                      ({t('dashboard.dealLog.autoCalculated')})
                    </span>
                  </Label>
                  <div className="mt-1 text-xs font-semibold text-green-900">
                    ${formData.backEndGross || '0.00'}
                  </div>
                </div>

                {/* Total Gross - Calculated */}
                <div className="p-2 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs font-medium text-black">
                      {t('dashboard.dealLog.totalGross')}
                    </Label>
                    <span className="text-[10px] text-black">
                      ({t('dashboard.dealLog.autoCalculated')})
                    </span>
                  </div>
                  <div className="mt-1 text-lg font-bold text-blue-900">
                    ${formData.totalGross || '0.00'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 ml-10">{t('dashboard.dealLog.allFieldsRequired')}</p>
          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/single-finance')}
            >
              {t('dashboard.dealLog.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400"
            >
              {isSubmitting
                ? isEditMode
                  ? t('dashboard.dealLog.updatingDeal')
                  : t('dashboard.dealLog.savingDeal')
                : isEditMode
                  ? t('dashboard.dealLog.updateDeal')
                  : t('dashboard.dealLog.saveDeal')}
            </Button>
          </div>
        </div>
      </form>

      {/* Add Salesperson Modal */}
      {showAddSalesperson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {t('dashboard.dealLog.addNewSalesperson')}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newFirstName">{t('dashboard.dealLog.firstName')}</Label>
                <Input
                  id="newFirstName"
                  value={newSalesperson.firstName}
                  onChange={e =>
                    setNewSalesperson(prev => ({ ...prev, firstName: e.target.value }))
                  }
                  placeholder={t('dashboard.dealLog.firstName')}
                />
              </div>
              <div>
                <Label htmlFor="newLastName">{t('dashboard.dealLog.lastName')}</Label>
                <Input
                  id="newLastName"
                  value={newSalesperson.lastName}
                  onChange={e => setNewSalesperson(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder={t('dashboard.dealLog.lastName')}
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
                {t('dashboard.dealLog.cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleAddSalesperson}
                className="bg-green-500 hover:bg-green-600"
              >
                {t('dashboard.dealLog.addSalesperson')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
