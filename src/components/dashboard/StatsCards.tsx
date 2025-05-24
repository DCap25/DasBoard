import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

type StatsCardsProps = {
  dealsCount: number;
  frontEndGross: number;
  backEndGross: number;
};

export const StatsCards: React.FC<StatsCardsProps> = ({ dealsCount, frontEndGross, backEndGross }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card>
      <CardHeader>
        <CardTitle>My Deals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{dealsCount}</div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Front End Gross</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${frontEndGross.toFixed(2)}</div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Back End Gross</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">${backEndGross.toFixed(2)}</div>
      </CardContent>
    </Card>
  </div>
); 