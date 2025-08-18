import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Trophy, User, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    <CardHeader className="px-4 sm:px-6">
      {' '}
      {/* Responsive padding */}
      <CardTitle className="text-lg sm:text-xl">Sales Leaderboard</CardTitle>
      <CardDescription className="text-sm">Top salespeople at your dealership</CardDescription>
    </CardHeader>
    <CardContent className="px-4 sm:px-6">
      {/* Mobile card view - visible only on mobile */}
      <div className="block sm:hidden space-y-3">
        {leaderboard.map((sp, idx) => (
          <div
            key={sp.id}
            className={`
              flex items-center justify-between p-4 rounded-lg border bg-card
              ${idx === 0 ? 'border-yellow-500 bg-yellow-50/50' : ''}
              ${idx === 1 ? 'border-gray-400 bg-gray-50/50' : ''}
              ${idx === 2 ? 'border-orange-600 bg-orange-50/50' : ''}
            `} /* Special styling for top 3 */
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {idx === 0 && <Trophy className="h-6 w-6 text-yellow-500" />}
                {idx === 1 && <Trophy className="h-5 w-5 text-gray-400" />}
                {idx === 2 && <Trophy className="h-5 w-5 text-orange-600" />}
                {idx > 2 && (
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                    {idx + 1}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {sp.first_name} {sp.last_name}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-xs text-muted-foreground">{sp.deal_count} deals</span>
                </div>
              </div>
            </div>
            {idx < 3 && (
              <Badge variant={idx === 0 ? 'default' : 'secondary'} className="ml-2">
                #{idx + 1}
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Desktop table view - hidden on mobile */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Rank</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Deals</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((sp, idx) => (
              <TableRow key={sp.id}>
                <TableCell>
                  <div className="flex items-center">
                    {idx === 0 && <Trophy className="h-4 w-4 text-yellow-500 mr-2" />}
                    {idx === 1 && <Trophy className="h-4 w-4 text-gray-400 mr-2" />}
                    {idx === 2 && <Trophy className="h-4 w-4 text-orange-600 mr-2" />}
                    <span className="font-medium">{idx + 1}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {sp.first_name} {sp.last_name}
                </TableCell>
                <TableCell className="text-right font-medium">{sp.deal_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
);
