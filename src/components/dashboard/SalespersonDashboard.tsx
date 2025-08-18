import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesLeaderboard, LeaderboardEntry } from './SalesLeaderboard';
import { StatsCards } from './StatsCards';
import { ScheduleTabs } from './ScheduleTabs';
import { PayCalculator } from './PayCalculator';
import {
  getCurrentUserProfile,
  getSalesLeaderboard,
  getUserDeals,
  getPayPlan,
  getUserSchedule,
} from '@/lib/supabaseDashboard';
import { Button } from '@/components/ui/button';

export const SalespersonDashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userDeals, setUserDeals] = useState<any[]>([]);
  const [payPlan, setPayPlan] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // 1. Get current user profile
      const { data: userProfile } = await getCurrentUserProfile();
      if (!userProfile) return setLoading(false);
      setUser(userProfile);

      // 2. Leaderboard
      const { data: leaderboardData } = await getSalesLeaderboard(userProfile.dealership_id);
      setLeaderboard(leaderboardData || []);

      // 3. User's deals
      const { data: dealsData } = await getUserDeals(userProfile.id);
      setUserDeals(dealsData || []);

      // 4. Pay plan
      const { data: payPlanData } = await getPayPlan(
        userProfile.role_id,
        userProfile.dealership_id
      );
      setPayPlan(payPlanData);

      // 5. Schedule
      const { data: scheduleData } = await getUserSchedule(userProfile.id);
      setSchedule(scheduleData || []);

      setLoading(false);
    };
    fetchData();
  }, []);

  // Calculate stats
  const dealsCount = userDeals.length;
  const frontEndGross = userDeals.reduce((sum, d) => sum + (d.front_end_gross || 0), 0);
  const backEndGross = userDeals.reduce(
    (sum, d) =>
      sum +
      ((d.vsc_profit || 0) +
        (d.ppm_profit || 0) +
        (d.tire_wheel_profit || 0) +
        (d.paint_fabric_profit || 0) +
        (d.other_profit || 0)),
    0
  );

  // Pay calculator
  const pendingDeals = userDeals.filter(d => d.status === 'Pending');
  const fundedDeals = userDeals.filter(d => d.status === 'Funded');
  const pendingEarnings = payPlan
    ? pendingDeals.reduce(
        (sum, d) => sum + (d.front_end_gross || 0) * (payPlan.front_end_percent / 100),
        0
      )
    : 0;
  const fundedEarnings = payPlan
    ? fundedDeals.reduce(
        (sum, d) => sum + (d.front_end_gross || 0) * (payPlan.front_end_percent / 100),
        0
      )
    : 0;

  if (loading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-app-light dark:bg-app-dark border-r p-4 flex flex-col gap-4">
        <Button variant="secondary" onClick={() => navigate('/stats')}>
          Stats
        </Button>
        <Button variant="secondary" onClick={() => navigate('/pay')}>
          Pay
        </Button>
        <Button variant="secondary" onClick={() => navigate('/goals')}>
          Goals
        </Button>
        <Button variant="secondary" onClick={() => navigate('/schedule')}>
          Schedule
        </Button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8 space-y-8">
        <h1 className="text-3xl font-bold mb-4">Welcome, {user?.first_name}!</h1>
        <SalesLeaderboard leaderboard={leaderboard} />
        <StatsCards
          dealsCount={dealsCount}
          frontEndGross={frontEndGross}
          backEndGross={backEndGross}
        />
        <ScheduleTabs schedule={schedule} />
        <PayCalculator pendingEarnings={pendingEarnings} fundedEarnings={fundedEarnings} />
      </main>
    </div>
  );
};
