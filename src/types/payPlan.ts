// Enhanced Pay Plan Types and Interfaces

export interface PayPlanBase {
  id: string;
  name: string;
  description: string;
  role: string; // Restricted to specific roles
  dealership_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  plan_type: 'simple' | 'advanced'; // New field to determine complexity level
}

// Draw/Salary Structure
export interface DrawStructure {
  enabled: boolean;
  amount: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  deducted_from_commissions: boolean;
}

// Tiered Commission Structure
export interface CommissionTier {
  min_value: number;
  max_value?: number;
  percentage: number;
  label: string;
}

// PVR (Per Vehicle Retail) Based Commissions
export interface PVRCommissionStructure {
  enabled: boolean;
  base_percentage: number;
  tiers: CommissionTier[];
  applies_to: 'front_end' | 'back_end' | 'total_fi_income';
}

// CIT (Credit/Interest/Term) Bonus Structure
export interface CITBonusStructure {
  enabled: boolean;
  cit_30_bonus: {
    enabled: boolean;
    tiers: {
      min_deals: number;
      max_deals?: number;
      bonus_percentage: number;
    }[];
  };
  cit_10_bonus: {
    enabled: boolean;
    tiers: {
      min_deals: number;
      max_deals?: number;
      bonus_percentage: number;
    }[];
  };
}

// Penetration Bonus Structure
export interface PenetrationBonus {
  enabled: boolean;
  name: string;
  tiers: {
    min_percentage: number;
    max_percentage?: number;
    bonus_percentage: number;
  }[];
}

// CSI and Review Bonuses
export interface CSIBonusStructure {
  enabled: boolean;
  preferred_lender_bonus: {
    enabled: boolean;
    tiers: {
      min_percentage: number;
      max_percentage?: number;
      bonus_percentage: number;
    }[];
  };
  google_reviews_bonus: {
    enabled: boolean;
    tiers: {
      min_reviews: number;
      max_reviews?: number;
      bonus_percentage: number;
    }[];
  };
}

// Profit-based bonuses
export interface ProfitBonusStructure {
  enabled: boolean;
  deals_under_threshold: {
    profit_threshold: number;
    tiers: {
      min_percentage: number;
      max_percentage?: number;
      bonus_percentage: number;
    }[];
  };
}

// EasyCare and Provider Bonuses
export interface ProviderBonusStructure {
  enabled: boolean;
  provider_name: string;
  commission_percentage: number;
  payment_frequency: 'monthly' | 'quarterly' | 'annually';
  description: string;
}

// Vehicle Allowance Options
export interface VehicleAllowance {
  enabled: boolean;
  allowance_amount: number;
  demo_privileges_available: boolean;
  description: string;
}

// PTO Structure
export interface PTOStructure {
  enabled: boolean;
  annual_days: number;
  prorated: boolean;
  cash_value_per_day?: number;
}

// Unit-based flat rate structure
export interface UnitFlatStructure {
  enabled: boolean;
  tiers: {
    min_units: number;
    max_units?: number;
    flat_amount: number;
    label: string;
    retroactive: boolean; // If true, applies to all units when tier is reached
  }[];
}

// Used vehicle pack structure
export interface UsedVehiclePack {
  enabled: boolean;
  high_value_pack: {
    threshold: number; // e.g., $10,000
    pack_amount: number; // e.g., $10,000
  };
  low_value_pack: {
    min_threshold: number; // e.g., $2,000
    max_threshold: number; // e.g., $10,000
    pack_amount: number; // e.g., $450
  };
}

// Minimum unit guarantee structure
export interface MinimumUnitGuarantee {
  enabled: boolean;
  tiers: {
    min_units: number;
    max_units?: number;
    guarantee_amount: number;
    label: string;
  }[];
}

// Enhanced CSI bonus for salespeople
export interface SalespersonCSIBonus {
  enabled: boolean;
  benchmark_bonus: {
    enabled: boolean;
    bonus_percentage: number; // e.g., 5% additional on back-end
    description: string;
  };
}

// Volume-based back-end percentage structure
export interface VolumeBasedBackEndStructure {
  enabled: boolean;
  base_percentage: number;
  tiers: {
    min_units: number;
    max_units?: number;
    percentage: number;
    label: string;
    retroactive: boolean; // If true, applies to all deals when tier is reached
  }[];
}

// Enhanced Finance Manager Pay Plan
export interface AdvancedFinanceManagerPayPlan extends PayPlanBase {
  role: 'finance_manager' | 'finance_director';
  plan_type: 'advanced';

  // Core commission structure
  base_commission: PVRCommissionStructure;

  // Draw/Salary
  draw_structure: DrawStructure;

  // Advanced bonuses
  cit_bonuses?: CITBonusStructure;
  penetration_bonuses: PenetrationBonus[];
  profit_bonuses?: ProfitBonusStructure;
  csi_bonuses?: CSIBonusStructure;

  // Provider incentives
  provider_bonuses: ProviderBonusStructure[];

  // Benefits
  vehicle_allowance: VehicleAllowance;
  pto_structure: PTOStructure;

  // Chargeback protection
  chargeback_protection: {
    enabled: boolean;
    protection_period_days: number;
  };

  minimum_monthly_pay?: number;
}

// Simple Finance Manager Pay Plan (like Example 2)
export interface SimpleFinanceManagerPayPlan extends PayPlanBase {
  role: 'finance_manager' | 'finance_director';
  plan_type: 'simple';

  // Simple PVR-based commission
  commission_structure: {
    base_fi_percentage: number;
    pvr_tiers: CommissionTier[];
  };

  // Monthly draw
  monthly_draw: number;

  // Provider bonuses
  provider_bonuses: ProviderBonusStructure[];

  // Benefits
  vehicle_allowance: VehicleAllowance;
  pto_structure: PTOStructure;
}

// Enhanced Salesperson Pay Plan
export interface AdvancedSalespersonPayPlan extends PayPlanBase {
  role: 'salesperson';
  plan_type: 'advanced';

  // Front-end commission structure
  front_end_commission: {
    gross_percentage: number; // e.g., 15%
    unit_flat_structure: UnitFlatStructure;
    take_higher: boolean; // Take higher of percentage or flat
  };

  // Back-end commission structure
  back_end_commission: VolumeBasedBackEndStructure;

  // Used vehicle pack deductions
  used_vehicle_pack: UsedVehiclePack;

  // CSI bonus structure
  csi_bonus: SalespersonCSIBonus;

  // Minimum unit guarantee
  minimum_guarantee: MinimumUnitGuarantee;

  // Additional conditions
  conditions: {
    no_prepaid_commission: boolean;
    complete_paperwork_required: boolean;
    trade_payoff_discrepancy_flat: boolean;
    weekly_verification_required: boolean;
  };

  // Benefits
  vehicle_allowance: VehicleAllowance;
  pto_structure: PTOStructure;
  draw_structure?: DrawStructure;
}

// Simple Salesperson Pay Plan
export interface SimpleSalespersonPayPlan extends PayPlanBase {
  role: 'salesperson';
  plan_type: 'simple';
  front_end_gross_percentage: number;
  back_end_gross_percentage: number;
  minimum_monthly_pay: number;
}

export interface SalesManagerPayPlan extends PayPlanBase {
  role: 'sales_manager';
  base_salary: number;

  // Team performance bonuses
  team_bonuses: {
    unit_bonus_per_sale: number;
    gross_percentage: number;
  };

  // Personal sales (if applicable)
  personal_sales: {
    enabled: boolean;
    front_end_gross_percentage: number;
    back_end_gross_percentage: number;
  };

  // CSI for team
  team_csi_bonus: CSIBonusStructure;
  vehicle_allowance: VehicleAllowance;
  pto_structure: PTOStructure;
}

export interface GeneralManagerPayPlan extends PayPlanBase {
  role: 'general_manager';
  base_salary: number;

  // Dealership performance bonuses
  dealership_bonuses: {
    monthly_unit_threshold: number;
    unit_bonus: number;
    gross_profit_percentage: number;
    csi_bonus_threshold: number;
    csi_bonus_amount: number;
  };

  vehicle_allowance: VehicleAllowance;
  pto_structure: PTOStructure;
}

// Union type for all pay plans
export type PayPlan =
  | AdvancedFinanceManagerPayPlan
  | SimpleFinanceManagerPayPlan
  | AdvancedSalespersonPayPlan
  | SimpleSalespersonPayPlan
  | SalesManagerPayPlan
  | GeneralManagerPayPlan;

// Assignment interface
export interface PayPlanAssignment {
  id: string;
  user_id: string;
  pay_plan_id: string;
  assigned_by: string;
  assigned_at: string;
  effective_date: string;
  end_date?: string;
  is_active: boolean;
}

// Configuration options for dropdowns
export const PAY_PLAN_CONFIG = {
  ROLES: [
    { id: 'salesperson', name: 'Salesperson', category: 'sales' },
    { id: 'finance_manager', name: 'Finance Manager', category: 'finance' },
    { id: 'finance_director', name: 'Finance Director', category: 'finance' },
    { id: 'sales_manager', name: 'Sales Manager', category: 'management' },
    { id: 'general_manager', name: 'General Manager', category: 'management' },
  ],

  PLAN_TYPES: [
    { id: 'simple', name: 'Simple Plan', description: 'Basic commission structure' },
    {
      id: 'advanced',
      name: 'Advanced Plan',
      description: 'Complex bonus structure with multiple tiers',
    },
  ],

  PERCENTAGE_OPTIONS: [
    { value: 8, label: '8%' },
    { value: 10, label: '10%' },
    { value: 12, label: '12%' },
    { value: 13, label: '13%' },
    { value: 13.5, label: '13.5%' },
    { value: 14, label: '14%' },
    { value: 14.5, label: '14.5%' },
    { value: 15, label: '15%' },
    { value: 20, label: '20%' },
    { value: 25, label: '25%' },
    { value: 30, label: '30%' },
    { value: 35, label: '35%' },
    { value: 40, label: '40%' },
    { value: 45, label: '45%' },
    { value: 50, label: '50%' },
  ],

  DRAW_AMOUNTS: [
    { value: 1000, label: '$1,000' },
    { value: 1500, label: '$1,500' },
    { value: 2000, label: '$2,000' },
    { value: 2500, label: '$2,500' },
    { value: 3000, label: '$3,000' },
    { value: 3500, label: '$3,500' },
    { value: 4000, label: '$4,000' },
    { value: 5000, label: '$5,000' },
  ],

  DRAW_FREQUENCIES: [
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ],

  PVR_THRESHOLDS: [
    { value: 999, label: '$999' },
    { value: 1000, label: '$1,000' },
    { value: 1100, label: '$1,100' },
    { value: 1200, label: '$1,200' },
    { value: 1300, label: '$1,300' },
    { value: 1500, label: '$1,500' },
    { value: 1800, label: '$1,800' },
    { value: 2000, label: '$2,000' },
    { value: 2200, label: '$2,200' },
    { value: 2500, label: '$2,500' },
  ],

  PENETRATION_TYPES: [
    { id: 'service_contract', name: 'Service Contract Penetration' },
    { id: 'product_penetration', name: 'Product Penetration' },
    { id: 'package_penetration', name: 'Package Penetration' },
    { id: 'gap_penetration', name: 'GAP Penetration' },
    { id: 'warranty_penetration', name: 'Warranty Penetration' },
  ],

  PROVIDER_OPTIONS: [
    { id: 'easycare', name: 'EasyCare', commission: 10.99 },
    { id: 'jm_family', name: 'JM Family', commission: 8.5 },
    { id: 'protective', name: 'Protective', commission: 12.0 },
    { id: 'cna', name: 'CNA', commission: 9.5 },
  ],

  CSI_THRESHOLDS: [
    { value: 80, label: '80%' },
    { value: 85, label: '85%' },
    { value: 87, label: '87%' },
    { value: 90, label: '90%' },
    { value: 92, label: '92%' },
    { value: 95, label: '95%' },
  ],

  UNIT_THRESHOLDS: [
    { value: 8, label: '8 units' },
    { value: 10, label: '10 units' },
    { value: 12, label: '12 units' },
    { value: 15, label: '15 units' },
    { value: 18, label: '18 units' },
    { value: 20, label: '20 units' },
    { value: 25, label: '25 units' },
  ],

  UNIT_FLAT_AMOUNTS: [
    { value: 14.5, label: '$14.50' },
    { value: 19.5, label: '$19.50' },
    { value: 25.0, label: '$25.00' },
    { value: 50.0, label: '$50.00' },
    { value: 75.0, label: '$75.00' },
    { value: 100.0, label: '$100.00' },
    { value: 125.0, label: '$125.00' },
    { value: 150.0, label: '$150.00' },
  ],

  PACK_AMOUNTS: [
    { value: 450, label: '$450' },
    { value: 500, label: '$500' },
    { value: 750, label: '$750' },
    { value: 1000, label: '$1,000' },
    { value: 5000, label: '$5,000' },
    { value: 10000, label: '$10,000' },
  ],

  PACK_THRESHOLDS: [
    { value: 2000, label: '$2,000' },
    { value: 5000, label: '$5,000' },
    { value: 10000, label: '$10,000' },
    { value: 15000, label: '$15,000' },
    { value: 20000, label: '$20,000' },
  ],

  MINIMUM_GUARANTEES: [
    { value: 3000, label: '$3,000' },
    { value: 4000, label: '$4,000' },
    { value: 5000, label: '$5,000' },
    { value: 6000, label: '$6,000' },
    { value: 7500, label: '$7,500' },
    { value: 10000, label: '$10,000' },
    { value: 12500, label: '$12,500' },
    { value: 15000, label: '$15,000' },
  ],
};

// Validation functions
export const validatePayPlan = (payPlan: Partial<PayPlan>): string[] => {
  const errors: string[] = [];

  if (!payPlan.name?.trim()) {
    errors.push('Pay plan name is required');
  }

  if (!payPlan.role) {
    errors.push('Role selection is required');
  }

  if (!payPlan.plan_type) {
    errors.push('Plan type selection is required');
  }

  return errors;
};

// Helper function to get role-specific fields
export const getRoleFields = (role: string, planType: string) => {
  const baseFields = ['name', 'description', 'role', 'plan_type'];

  switch (role) {
    case 'salesperson':
      if (planType === 'advanced') {
        return [
          ...baseFields,
          'front_end_gross_percentage',
          'back_end_gross_percentage',
          'monthly_unit_bonuses',
          'csi_bonus',
          'draw_structure',
          'vehicle_allowance',
          'pto_structure',
          'minimum_monthly_pay',
        ];
      } else {
        return [
          ...baseFields,
          'front_end_gross_percentage',
          'back_end_gross_percentage',
          'minimum_monthly_pay',
        ];
      }
    case 'finance_manager':
    case 'finance_director':
      if (planType === 'advanced') {
        return [
          ...baseFields,
          'base_commission',
          'draw_structure',
          'cit_bonuses',
          'penetration_bonuses',
          'profit_bonuses',
          'csi_bonuses',
          'provider_bonuses',
          'vehicle_allowance',
          'pto_structure',
          'chargeback_protection',
        ];
      } else {
        return [
          ...baseFields,
          'commission_structure',
          'monthly_draw',
          'provider_bonuses',
          'vehicle_allowance',
          'pto_structure',
        ];
      }
    case 'sales_manager':
      return [
        ...baseFields,
        'base_salary',
        'team_bonuses',
        'personal_sales',
        'team_csi_bonus',
        'vehicle_allowance',
        'pto_structure',
      ];
    case 'general_manager':
      return [
        ...baseFields,
        'base_salary',
        'dealership_bonuses',
        'vehicle_allowance',
        'pto_structure',
      ];
    default:
      return baseFields;
  }
};

// Helper function to create default structures
export const createDefaultStructures = () => ({
  drawStructure: {
    enabled: false,
    amount: 2500,
    frequency: 'monthly' as const,
    deducted_from_commissions: true,
  },

  vehicleAllowance: {
    enabled: false,
    allowance_amount: 300,
    demo_privileges_available: true,
    description: 'Monthly vehicle allowance or demo privileges',
  },

  ptoStructure: {
    enabled: true,
    annual_days: 12,
    prorated: true,
    cash_value_per_day: 150,
  },

  chargebackProtection: {
    enabled: true,
    protection_period_days: 90,
  },
});
