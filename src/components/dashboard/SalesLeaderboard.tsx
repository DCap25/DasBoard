import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export type LeaderboardEntry = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  deal_count: number;
};

type SalesLeaderboardProps = {
  leaderboard: LeaderboardEntry[];
};

export const SalesLeaderboard: React.FC<SalesLeaderboardProps> = ({ leaderboard }) => (
  <Card>
    <CardHeader>
      <CardTitle>Sales Leaderboard</CardTitle>
      <CardDescription>Top salespeople at your dealership</CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Deals</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboard.map((sp, idx) => (
            <TableRow key={sp.id}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>{sp.first_name} {sp.last_name}</TableCell>
              <TableCell>{sp.deal_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
); 