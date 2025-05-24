import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

type PayCalculatorProps = {
  pendingEarnings: number;
  fundedEarnings: number;
};

export const PayCalculator: React.FC<PayCalculatorProps> = ({ pendingEarnings, fundedEarnings }) => (
  <Card>
    <CardHeader>
      <CardTitle>Pay Calculator</CardTitle>
      <CardDescription>
        Estimated earnings based on your pay plan. For reference only. Actual pay may vary.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col md:flex-row gap-8">
        <div>
          <div className="font-semibold">Pending Earnings</div>
          <div className="text-xl">${pendingEarnings.toFixed(2)}</div>
        </div>
        <div>
          <div className="font-semibold">Funded Earnings</div>
          <div className="text-xl">${fundedEarnings.toFixed(2)}</div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        Disclaimer: This calculator is for informational purposes only. Actual pay may differ based on final accounting and management review.
      </div>
    </CardContent>
  </Card>
); 