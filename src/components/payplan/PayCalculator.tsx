import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react';
import { PayPlan, AdvancedSalespersonPayPlan } from '../../types/payPlan';

interface PayCalculatorProps {
  payPlans: PayPlan[];
}

interface CalculationInputs {
  selectedPayPlanId: string;
  unitsSold: number;
  frontEndGrossProfit: number;
  backEndGrossProfit: number;
  vehicleType: 'new' | 'used';
  vehicleValue: number;
  csiAboveBenchmark: boolean;
}

interface CalculationResults {
  frontEndCommission: number;
  backEndCommission: number;
  csiBonus: number;
  totalCommission: number;
  minimumGuarantee: number;
  finalPayout: number;
  packDeduction: number;
  unitFlatAmount: number;
  percentageAmount: number;
  usedHigherAmount: boolean;
}

export function PayCalculator({ payPlans }: PayCalculatorProps) {
  const [inputs, setInputs] = useState<CalculationInputs>({
    selectedPayPlanId: '',
    unitsSold: 0,
    frontEndGrossProfit: 0,
    backEndGrossProfit: 0,
    vehicleType: 'new',
    vehicleValue: 0,
    csiAboveBenchmark: false,
  });

  const [results, setResults] = useState<CalculationResults | null>(null);

  const selectedPlan = payPlans.find(plan => plan.id === inputs.selectedPayPlanId);

  const calculatePay = () => {
    if (!selectedPlan || selectedPlan.role !== 'salesperson') {
      return;
    }

    if (selectedPlan.plan_type === 'simple') {
      // Simple calculation
      const simplePlan = selectedPlan as any;
      const frontEndCommission =
        inputs.frontEndGrossProfit * (simplePlan.front_end_gross_percentage / 100);
      const backEndCommission =
        inputs.backEndGrossProfit * (simplePlan.back_end_gross_percentage / 100);
      const totalCommission = frontEndCommission + backEndCommission;
      const finalPayout = Math.max(totalCommission, simplePlan.minimum_monthly_pay || 0);

      setResults({
        frontEndCommission,
        backEndCommission,
        csiBonus: 0,
        totalCommission,
        minimumGuarantee: simplePlan.minimum_monthly_pay || 0,
        finalPayout,
        packDeduction: 0,
        unitFlatAmount: 0,
        percentageAmount: frontEndCommission,
        usedHigherAmount: false,
      });
    } else {
      // Advanced calculation
      const advancedPlan = selectedPlan as AdvancedSalespersonPayPlan;

      // Calculate pack deduction for used vehicles
      let packDeduction = 0;
      if (inputs.vehicleType === 'used' && advancedPlan.used_vehicle_pack.enabled) {
        if (inputs.vehicleValue >= advancedPlan.used_vehicle_pack.high_value_pack.threshold) {
          packDeduction = advancedPlan.used_vehicle_pack.high_value_pack.pack_amount;
        } else if (
          inputs.vehicleValue >= advancedPlan.used_vehicle_pack.low_value_pack.min_threshold &&
          inputs.vehicleValue < advancedPlan.used_vehicle_pack.low_value_pack.max_threshold
        ) {
          packDeduction = advancedPlan.used_vehicle_pack.low_value_pack.pack_amount;
        }
      }

      // Calculate front-end commission
      const adjustedFrontEndProfit = inputs.frontEndGrossProfit - packDeduction;
      const percentageAmount =
        adjustedFrontEndProfit * (advancedPlan.front_end_commission.gross_percentage / 100);

      // Find unit flat amount based on units sold
      let unitFlatAmount = 0;
      if (advancedPlan.front_end_commission.unit_flat_structure.enabled) {
        const flatTier = advancedPlan.front_end_commission.unit_flat_structure.tiers
          .reverse()
          .find(tier => inputs.unitsSold >= tier.min_units);
        if (flatTier) {
          unitFlatAmount = flatTier.retroactive
            ? flatTier.flat_amount * inputs.unitsSold
            : flatTier.flat_amount;
        }
      }

      const usedHigherAmount = unitFlatAmount > percentageAmount;
      const frontEndCommission = advancedPlan.front_end_commission.take_higher
        ? Math.max(percentageAmount, unitFlatAmount)
        : percentageAmount;

      // Calculate back-end commission
      let backEndPercentage = advancedPlan.back_end_commission.base_percentage;
      if (advancedPlan.back_end_commission.enabled) {
        const backEndTier = advancedPlan.back_end_commission.tiers
          .reverse()
          .find(tier => inputs.unitsSold >= tier.min_units);
        if (backEndTier) {
          backEndPercentage = backEndTier.percentage;
        }
      }

      let backEndCommission = inputs.backEndGrossProfit * (backEndPercentage / 100);

      // Calculate CSI bonus
      let csiBonus = 0;
      if (
        inputs.csiAboveBenchmark &&
        advancedPlan.csi_bonus.enabled &&
        advancedPlan.csi_bonus.benchmark_bonus.enabled
      ) {
        csiBonus =
          inputs.backEndGrossProfit *
          (advancedPlan.csi_bonus.benchmark_bonus.bonus_percentage / 100);
        backEndCommission += csiBonus;
      }

      const totalCommission = frontEndCommission + backEndCommission;

      // Check minimum guarantee
      let minimumGuarantee = 0;
      if (advancedPlan.minimum_guarantee.enabled) {
        const guaranteeTier = advancedPlan.minimum_guarantee.tiers
          .reverse()
          .find(tier => inputs.unitsSold >= tier.min_units);
        if (guaranteeTier) {
          minimumGuarantee = guaranteeTier.guarantee_amount;
        }
      }

      const finalPayout = Math.max(totalCommission, minimumGuarantee);

      setResults({
        frontEndCommission,
        backEndCommission: backEndCommission - csiBonus,
        csiBonus,
        totalCommission,
        minimumGuarantee,
        finalPayout,
        packDeduction,
        unitFlatAmount,
        percentageAmount,
        usedHigherAmount,
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          Pay Calculator
        </CardTitle>
        <CardDescription>
          Calculate commission based on selected pay plan and deal details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pay Plan Selection */}
        <div className="space-y-2">
          <Label htmlFor="payPlan">Select Pay Plan</Label>
          <Select
            value={inputs.selectedPayPlanId}
            onValueChange={value => setInputs({ ...inputs, selectedPayPlanId: value })}
          >
            <SelectTrigger id="payPlan">
              <SelectValue placeholder="Choose a pay plan" />
            </SelectTrigger>
            <SelectContent>
              {payPlans
                .filter(plan => plan.role === 'salesperson' && plan.is_active)
                .map(plan => (
                  <SelectItem key={plan.id} value={plan.id}>
                    <div className="flex flex-col">
                      <span>{plan.name}</span>
                      <span className="text-xs text-muted-foreground">{plan.description}</span>
                    </div>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPlan && (
          <>
            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="units">Units Sold</Label>
                <Input
                  id="units"
                  type="number"
                  min="0"
                  value={inputs.unitsSold}
                  onChange={e => setInputs({ ...inputs, unitsSold: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="frontEnd">Front-End Gross Profit</Label>
                <Input
                  id="frontEnd"
                  type="number"
                  min="0"
                  step="0.01"
                  value={inputs.frontEndGrossProfit}
                  onChange={e =>
                    setInputs({ ...inputs, frontEndGrossProfit: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backEnd">Back-End Gross Profit</Label>
                <Input
                  id="backEnd"
                  type="number"
                  min="0"
                  step="0.01"
                  value={inputs.backEndGrossProfit}
                  onChange={e =>
                    setInputs({ ...inputs, backEndGrossProfit: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select
                  value={inputs.vehicleType}
                  onValueChange={value =>
                    setInputs({ ...inputs, vehicleType: value as 'new' | 'used' })
                  }
                >
                  <SelectTrigger id="vehicleType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New Vehicle</SelectItem>
                    <SelectItem value="used">Used Vehicle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {inputs.vehicleType === 'used' && (
                <div className="space-y-2">
                  <Label htmlFor="vehicleValue">Vehicle Value</Label>
                  <Input
                    id="vehicleValue"
                    type="number"
                    min="0"
                    step="0.01"
                    value={inputs.vehicleValue}
                    onChange={e =>
                      setInputs({ ...inputs, vehicleValue: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="csi"
                  checked={inputs.csiAboveBenchmark}
                  onCheckedChange={checked =>
                    setInputs({ ...inputs, csiAboveBenchmark: !!checked })
                  }
                />
                <Label htmlFor="csi">CSI Above Benchmark</Label>
              </div>
            </div>

            {/* Calculate Button */}
            <Button onClick={calculatePay} className="w-full">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Commission
            </Button>

            {/* Results */}
            {results && (
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Calculation Results
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPlan.plan_type === 'advanced' && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Pack Deduction:</span>
                          <span className="text-red-600">
                            -{formatCurrency(results.packDeduction)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Percentage Amount:</span>
                          <span>{formatCurrency(results.percentageAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Unit Flat Amount:</span>
                          <span>{formatCurrency(results.unitFlatAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Used Higher Amount:</span>
                          <Badge variant={results.usedHigherAmount ? 'default' : 'secondary'}>
                            {results.usedHigherAmount ? 'Unit Flat' : 'Percentage'}
                          </Badge>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Front-End Commission:</span>
                      <span className="font-medium">
                        {formatCurrency(results.frontEndCommission)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Back-End Commission:</span>
                      <span className="font-medium">
                        {formatCurrency(results.backEndCommission)}
                      </span>
                    </div>
                    {results.csiBonus > 0 && (
                      <div className="flex justify-between">
                        <span>CSI Bonus:</span>
                        <span className="font-medium text-green-600">
                          +{formatCurrency(results.csiBonus)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Total Commission:</span>
                      <span className="font-medium">{formatCurrency(results.totalCommission)}</span>
                    </div>
                    {results.minimumGuarantee > 0 && (
                      <div className="flex justify-between">
                        <span>Minimum Guarantee:</span>
                        <span className="font-medium">
                          {formatCurrency(results.minimumGuarantee)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Final Payout:</span>
                    <span className="flex items-center text-green-600">
                      <DollarSign className="w-5 h-5 mr-1" />
                      {formatCurrency(results.finalPayout)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
