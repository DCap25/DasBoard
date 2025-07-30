import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import {
  Target,
  Calendar,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { getGoalTrackingData } from '../lib/apiService';

// Define types for goal progress data
interface GoalProgressData {
  expected: number;
  actual: number;
  progress: number;
  status: 'on-track' | 'slightly-behind' | 'behind' | 'neutral';
  progressRatio: number;
}

// Define type for a deal
interface Deal {
  id: string;
  salesperson_id: string;
  sale_date: string;
  front_end_gross?: number;
  back_end_gross?: number;
  [key: string]: any;
}

/**
 * Goal Tracking component for salesperson dashboard
 * Shows a simplified status indicator with color coding
 */
const GoalTracking: React.FC = () => {
  const { user } = useAuth();
  const [salesData, setSalesData] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [daysOff, setDaysOff] = useState<number[]>([5, 8, 15, 18, 25, 27, 29]);
  const [goalProgress, setGoalProgress] = useState<GoalProgressData>({
    expected: 0,
    actual: 0,
    progress: 0,
    status: 'neutral',
    progressRatio: 0,
  });
  const [currentDay, setCurrentDay] = useState<number>(new Date().getDate());
  const [daysInMonth, setDaysInMonth] = useState<number>(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  );

  // Monthly goal
  const MONTHLY_GOAL: number = 15;

  useEffect(() => {
    console.log('[GoalTracking] Component mounted', {
      userId: user?.id,
      currentDay,
      daysInMonth,
      timestamp: new Date().toISOString(),
    });

    fetchGoalData();

    return () => {
      console.log('[GoalTracking] Component unmounting');
    };
  }, [user]);

  // Fetch goal data using the apiService
  const fetchGoalData = async (): Promise<void> => {
    try {
      setIsLoading(true);

      if (!user?.id) {
        console.log('[GoalTracking] No user ID available');
        setIsLoading(false);
        return;
      }

      console.log('[GoalTracking] Fetching goal data for user:', user.id);

      // Use the apiService to get all goal tracking data
      const data = await getGoalTrackingData(user.id);

      // Update component state with the fetched data
      setSalesData(data.deals);
      setDaysOff(data.daysOff);
      setGoalProgress(data.progressMetrics);
      setCurrentDay(data.currentDay);
      setDaysInMonth(data.daysInMonth);

      console.log('[GoalTracking] Goal data loaded:', data);
    } catch (error) {
      console.error('[GoalTracking] Error fetching goal data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate remaining days in month
  const remainingDays: number = daysInMonth - currentDay;

  // Calculate remaining sales needed to reach goal
  const remainingSalesNeeded: number = Math.max(0, MONTHLY_GOAL - goalProgress.actual);

  // Calculate sales per day needed to reach goal
  const salesPerDayNeeded: string =
    remainingDays > 0 ? (remainingSalesNeeded / remainingDays).toFixed(1) : '0';

  // Get the status color
  const getStatusColor = (): string => {
    switch (goalProgress.status) {
      case 'on-track':
        return 'text-green-600';
      case 'slightly-behind':
        return 'text-amber-500';
      case 'behind':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Get background status color
  const getStatusBgColor = (): string => {
    switch (goalProgress.status) {
      case 'on-track':
        return 'bg-green-100';
      case 'slightly-behind':
        return 'bg-amber-100';
      case 'behind':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  // Get the status icon
  const getStatusIcon = () => {
    switch (goalProgress.status) {
      case 'on-track':
        return <CheckCircle2 className="h-12 w-12 text-green-500" />;
      case 'slightly-behind':
        return <AlertTriangle className="h-12 w-12 text-amber-500" />;
      case 'behind':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return <Target className="h-12 w-12 text-gray-400" />;
    }
  };

  // Get the status text and trend icon
  const getStatusDisplay = () => {
    switch (goalProgress.status) {
      case 'on-track':
        return (
          <span className="flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            On Track
          </span>
        );
      case 'slightly-behind':
        return (
          <span className="flex items-center">
            <TrendingDown className="h-4 w-4 mr-1" />
            Slightly Behind
          </span>
        );
      case 'behind':
        return (
          <span className="flex items-center">
            <TrendingDown className="h-4 w-4 mr-1" />
            Behind Target
          </span>
        );
      default:
        return <span className="flex items-center">Getting Started</span>;
    }
  };

  // Get progress percentage visually
  const getProgressPercentage = (): number => {
    return Math.min(100, Math.round((goalProgress.actual / MONTHLY_GOAL) * 100));
  };

  return (
    <Card className="border hover:shadow-md transition-shadow">
      <CardHeader className="pb-1 border-b bg-blue-500 rounded-t-lg">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium flex items-center text-white">
            <Target className="mr-2 h-5 w-5 text-white" />
            Goal Tracker
          </CardTitle>

          {/* Status light */}
          <div className="flex items-center space-x-2">
            <div className="text-sm">
              {currentDay}/{daysInMonth}
            </div>
            <div
              className={`w-3 h-3 rounded-full ${
                goalProgress.status === 'on-track'
                  ? 'bg-green-500'
                  : goalProgress.status === 'slightly-behind'
                  ? 'bg-amber-500'
                  : goalProgress.status === 'behind'
                  ? 'bg-red-500'
                  : 'bg-gray-400'
              } animate-pulse shadow-md`}
              title={`Status: ${goalProgress.status}`}
            ></div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="py-8 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 animate-pulse text-gray-400" />
            <p className="text-sm text-gray-500">Loading goal data...</p>
          </div>
        ) : (
          <>
            {/* Progress Status Indicator */}
            <div className="flex flex-col items-center mb-6">
              {/* Large colored circle showing status */}
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 transition-all duration-500 ${getStatusBgColor()}`}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold">{goalProgress.actual}</div>
                  <div className="text-sm">of {MONTHLY_GOAL}</div>
                </div>
              </div>

              {/* Status text */}
              <div className={`text-lg font-bold ${getStatusColor()}`}>{getStatusDisplay()}</div>

              <div className="text-sm text-gray-600 mt-1 text-center">
                You've sold {goalProgress.actual} units this month.
                {goalProgress.expected > 0 &&
                  ` Expected by day ${currentDay}: ${goalProgress.expected} units.`}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    goalProgress.status === 'on-track'
                      ? 'bg-green-500'
                      : goalProgress.status === 'slightly-behind'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>

            {/* Sales Pace Data */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-xs text-blue-600 mb-1">Days Remaining</div>
                <div className="text-xl font-bold">{remainingDays} days</div>
                <div className="text-xs text-gray-500">Until end of month</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-xs text-purple-600 mb-1">Daily Pace Needed</div>
                <div className="text-xl font-bold">{salesPerDayNeeded}</div>
                <div className="text-xs text-gray-500">Units per day to reach goal</div>
              </div>
            </div>

            {/* Achievement badges - only show if there are any sales */}
            {goalProgress.actual > 0 && (
              <div className="mt-5 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                <h4 className="text-sm font-medium text-blue-700 mb-2">Achievements</h4>
                <div className="flex flex-wrap gap-2">
                  {goalProgress.actual >= 1 && (
                    <div className="bg-white/80 px-2 py-1 rounded-full text-xs backdrop-blur-sm border border-blue-100">
                      🏆 First Sale
                    </div>
                  )}
                  {goalProgress.actual >= 5 && (
                    <div className="bg-white/80 px-2 py-1 rounded-full text-xs backdrop-blur-sm border border-blue-100">
                      ⭐ Consistent Performer
                    </div>
                  )}
                  {goalProgress.actual >= 10 && (
                    <div className="bg-white/80 px-2 py-1 rounded-full text-xs backdrop-blur-sm border border-blue-100">
                      🔥 Sales Machine
                    </div>
                  )}
                  {goalProgress.actual >= MONTHLY_GOAL && (
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-2 py-1 rounded-full text-xs font-bold border border-green-200">
                      🌟 Monthly Goal Achieved!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Data Last Updated */}
            <div className="text-xs text-gray-400 text-right mt-4">
              <Calendar className="h-3 w-3 inline mr-1" />
              Data updated: {new Date().toLocaleString()}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalTracking;
