import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { DealLogEditor } from '../manager/DealLogEditor';
import GoalTracking from '../GoalTracking';
import {
  ShoppingBag,
  Target,
  Calculator,
  Clock,
  TrendingUp,
  DollarSign,
  Car,
  AlertTriangle,
  CheckCircle2,
  CalendarClock,
  FileText,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Home,
  Calendar,
  Users,
  Plus,
  ChevronRight,
  ChevronLeft,
  Trophy,
  User,
  Lightbulb,
  ArrowUpDown,
} from 'lucide-react';

// Mock data for salesperson deals
const MOCK_DEALS = [
  {
    id: 'D5421',
    stockNumber: 'A7831',
    lastName: 'Johnson',
    frontGross: 1200,
    backEndGross: 700,
    date: '2023-06-10',
    isNew: true,
  },
  {
    id: 'D5398',
    stockNumber: 'B2241',
    lastName: 'Martinez',
    frontGross: 800,
    backEndGross: 900,
    date: '2023-06-08',
    isNew: false,
  },
  {
    id: 'D5376',
    stockNumber: 'C5532',
    lastName: 'Williams',
    frontGross: 0,
    backEndGross: 500,
    date: '2023-06-05',
    isNew: false,
  },
  {
    id: 'D5342',
    stockNumber: 'A1277',
    lastName: 'Garcia',
    frontGross: 1500,
    backEndGross: 800,
    date: '2023-06-01',
    isNew: false,
  },
  {
    id: 'D5321',
    stockNumber: 'B8773',
    lastName: 'Miller',
    frontGross: 950,
    backEndGross: 600,
    date: '2023-05-29',
    isNew: false,
  },
  {
    id: 'D5310',
    stockNumber: 'C9912',
    lastName: 'Davis',
    frontGross: 0,
    backEndGross: 450,
    date: '2023-05-27',
    isNew: false,
  },
  {
    id: 'D5298',
    stockNumber: 'A5523',
    lastName: 'Rodriguez',
    frontGross: 1300,
    backEndGross: 750,
    date: '2023-05-25',
    isNew: false,
  },
];

// Car emojis for goal progression
const CAR_PROGRESSION = [
  { emoji: '🚗', name: 'Compact', threshold: 0 },
  { emoji: '🚙', name: 'Sedan', threshold: 20 },
  { emoji: '🚐', name: 'SUV', threshold: 40 },
  { emoji: '🏎️', name: 'Sports Car', threshold: 60 },
  { emoji: '🚓', name: 'Premium', threshold: 80 },
  { emoji: '🏁', name: 'Supercar', threshold: 95 },
];

// Mock schedule data
const SCHEDULE_DATA = [
  { day: 'Monday', date: '12', shift: 'Off', team: '' },
  { day: 'Tuesday', date: '13', shift: '10am - 7pm', team: 'Team A' },
  { day: 'Wednesday', date: '14', shift: '9am - 6pm', team: 'Team A' },
  { day: 'Thursday', date: '15', shift: '12pm - 9pm', team: 'Team A' },
  { day: 'Friday', date: '16', shift: '9am - 6pm', team: 'Team B' },
  { day: 'Saturday', date: '17', shift: '9am - 8pm', team: 'Team B' },
  { day: 'Sunday', date: '18', shift: 'Off', team: '' },
];

// Mock pay calculator data
const PAY_CALCULATOR = {
  frontEndGrossPercent: 25,
  backEndGrossPercent: 5,
  spiffs: 350,
  bonusThreshold: 12,
  bonusAmount: 500,
};

const SalesDashboard = () => {
  const { user, role, dealershipId } = useAuth();
  const [displayFrontEnd, setDisplayFrontEnd] = useState(true);
  const [displayBackEnd, setDisplayBackEnd] = useState(true);
  const [goalProgress, setGoalProgress] = useState(60);
  const [timePeriod, setTimePeriod] = useState<string>('this-month');

  // Get the current car based on goal progress
  const getCurrentCar = progress => {
    for (let i = CAR_PROGRESSION.length - 1; i >= 0; i--) {
      if (progress >= CAR_PROGRESSION[i].threshold) {
        return CAR_PROGRESSION[i];
      }
    }
    return CAR_PROGRESSION[0];
  };

  // Get deals performance indicator
  const getDealsPerformanceIndicator = () => {
    // Assuming goal is 15 deals in a 30 day month
    const currentDay = new Date().getDate();
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const expectedDeals = Math.round((currentDay / daysInMonth) * 15);
    const actualDeals = MOCK_DEALS.length;

    if (actualDeals < expectedDeals - 2) return 'red';
    if (actualDeals < expectedDeals) return 'yellow';
    return 'green';
  };

  // Calculate front end gross
  const totalFrontEndGross = MOCK_DEALS.reduce((sum, deal) => sum + deal.frontGross, 0);

  // Calculate back end gross
  const totalBackEndGross = MOCK_DEALS.reduce((sum, deal) => sum + deal.backEndGross, 0);

  // Calculate total gross
  const totalGross = totalFrontEndGross + totalBackEndGross;

  // Calculate mini deals (deals with $0 front end gross)
  const miniDeals = MOCK_DEALS.filter(deal => deal.frontGross === 0).length;

  // Current car in progression
  const currentCar = getCurrentCar(goalProgress);

  // Performance indicator color
  const performanceColor = getDealsPerformanceIndicator();

  // Calculate current earnings
  const currentEarnings =
    totalFrontEndGross * (PAY_CALCULATOR.frontEndGrossPercent / 100) +
    totalBackEndGross * (PAY_CALCULATOR.backEndGrossPercent / 100) +
    PAY_CALCULATOR.spiffs;

  // Calculate potential earnings (assuming similar performance for rest of month)
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const remainingDaysFactor = daysInMonth / currentDay;
  const potentialEarnings = currentEarnings * remainingDaysFactor;

  // Add bonus if deals threshold is met
  const projectedDeals = MOCK_DEALS.length * remainingDaysFactor;
  const projectedEarningsWithBonus =
    potentialEarnings +
    (projectedDeals >= PAY_CALCULATOR.bonusThreshold ? PAY_CALCULATOR.bonusAmount : 0);

  // Get period label for display
  const getPeriodLabel = (period: string): string => {
    const today = new Date();
    const month = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();

    switch (period) {
      case 'this-month':
        return `${month} ${year}`;
      case 'last-month':
        const lastMonth =
          today.getMonth() === 0
            ? 'December'
            : new Date(today.getFullYear(), today.getMonth() - 1, 1).toLocaleString('default', {
                month: 'long',
              });
        const lastMonthYear =
          today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
        return `${lastMonth} ${lastMonthYear}`;
      case 'last-quarter':
        const currentQuarter = Math.floor(today.getMonth() / 3);
        return `Q${currentQuarter === 0 ? 4 : currentQuarter} ${
          currentQuarter === 0 ? year - 1 : year
        }`;
      case 'ytd':
        return `Year to Date ${year}`;
      case 'last-year':
        return `${year - 1}`;
      default:
        return `${month} ${year}`;
    }
  };

  // Handle time period change
  const handleTimePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimePeriod(e.target.value);
  };

  useEffect(() => {
    console.log('[SalesDashboard] Rendering sales dashboard', {
      userId: user?.id,
      role,
      dealershipId,
      timestamp: new Date().toISOString(),
    });

    // Cleanup function
    return () => {
      console.log('[SalesDashboard] Unmounting sales dashboard');
    };
  }, [user, role, dealershipId]);

  // Helper to highlight today in the schedule
  const isToday = day => {
    const today = new Date().getDay();
    // Convert day name to day number (0 = Sunday, 1 = Monday, etc.)
    const dayMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };
    return dayMap[day] === today;
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sales Dashboard</h1>

        {/* Daily Sales Tip - Centered */}
        <div className="bg-blue-50 px-3 py-1 rounded-md text-center flex-1 mx-8 border border-blue-100">
          <p className="text-xs italic text-blue-800 truncate">
            <Lightbulb className="h-3 w-3 inline-block mr-1" />
            <strong>Daily Tip:</strong>{' '}
            {
              [
                'Listen twice as much as you talk. You have two ears and one mouth for a reason.',
                'The first 5 minutes with a customer sets the tone for the entire deal.',
                'Be the expert they can trust, not just the salesperson they deal with.',
                "Follow up with past customers - they're your best source of referrals.",
                'Know your inventory better than anyone else on the floor.',
                'Sell the experience and lifestyle, not just the vehicle.',
                "Always ask for referrals - it's the easiest way to grow your business.",
              ][new Date().getDay()]
            }
          </p>
        </div>
      </div>

      {/* Dashboard Header with Month/Year and Time Period Filter */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-row items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">{getPeriodLabel(timePeriod)}</h2>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-1" />
              <select
                value={timePeriod}
                onChange={handleTimePeriodChange}
                className="p-2 border rounded-md shadow-sm"
              >
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="last-quarter">Last Quarter</option>
                <option value="ytd">Year to Date</option>
                <option value="last-year">Last Year</option>
              </select>
            </div>
            <p className="text-gray-500">Sales Performance</p>
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold">{user?.email?.split('@')[0] || 'Sales Associate'}</div>
              <div className="text-xs text-gray-500">{role || 'Salesperson'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <ShoppingBag className="mr-2 h-4 w-4 text-blue-500" />
              Total Deals This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_DEALS.length}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <ChevronUp className="h-3 w-3 mr-1" />
              8% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="mr-2 h-4 w-4 text-green-500" />
              Gross
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalGross.toLocaleString()}</div>
            <div className="flex flex-col text-xs mt-1">
              {displayFrontEnd && (
                <span className="text-green-600">
                  Front: ${totalFrontEndGross.toLocaleString()}
                </span>
              )}
              {displayBackEnd && (
                <span className="text-blue-600">Back: ${totalBackEndGross.toLocaleString()}</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
              Minis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{miniDeals}</div>
            <p className="text-xs text-amber-600 flex items-center mt-1">
              {miniDeals > 2 ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Focus on higher gross deals
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Good job keeping minis low
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Target className="mr-2 h-4 w-4 text-purple-500" />
              Monthly Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goalProgress}%</div>
            <div className="w-full h-2 bg-gray-200 mt-2 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${goalProgress}%`,
                  background: `linear-gradient(90deg, #4338ca, #3b82f6 ${goalProgress}%)`,
                }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compact Weekly Schedule with left/right navigation */}
      <div className="mb-6">
        <Card className="border hover:shadow-md transition-shadow">
          <CardHeader className="py-2 px-4 border-b">
            <CardTitle className="text-sm font-medium flex items-center">
              <CalendarClock className="mr-2 h-4 w-4 text-indigo-500" />
              Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 px-0 relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="grid grid-cols-7 text-center px-6">
              {SCHEDULE_DATA.map((day, index) => (
                <div
                  key={index}
                  className={`p-1 ${
                    isToday(day.day) ? 'bg-blue-50 border-b-2 border-blue-500' : ''
                  }`}
                >
                  <div className="font-medium text-xs text-gray-800">
                    {day.day.substring(0, 3)} <span className="text-gray-500">{day.date}</span>
                  </div>
                  <div
                    className={`mt-1 text-xs ${
                      day.shift === 'Off' ? 'text-gray-400' : 'text-gray-800 font-medium'
                    }`}
                  >
                    {day.shift === 'Off'
                      ? 'Off'
                      : day.shift.replace('am - ', '-').replace('pm', '').replace('am', '')}
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Leader Board - The Das Board */}
      <div className="mb-6">
        <Card className="border hover:shadow-md transition-shadow">
          <CardHeader className="py-2 px-4 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-medium flex items-center">
                <Trophy className="mr-2 h-4 w-4 text-yellow-500" />
                The Das Board
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="py-1">
            {/* Sortable Header - Performance View */}
            <div className="flex items-center text-xs font-medium text-white border-b py-2 px-1">
              <div className="w-10 text-center bg-gray-600 py-2 rounded-l-md">#</div>
              <div className="w-40 flex-shrink-0 bg-gray-600 py-2 px-2">Salesperson</div>
              <div className="w-28 text-center bg-purple-600 py-2 flex items-center justify-center cursor-pointer hover:bg-purple-700">
                PVR <ChevronDown className="ml-1 h-3 w-3" />
              </div>
              <div className="w-36 text-center bg-green-600 py-2 flex items-center justify-center cursor-pointer hover:bg-green-700">
                Total Gross <ChevronDown className="ml-1 h-3 w-3" />
              </div>
              <div className="w-28 text-center bg-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                Avg/Mo <ChevronDown className="ml-1 h-3 w-3" />
              </div>
              <div className="w-28 text-center bg-blue-500 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-600">
                Last Mo <ChevronDown className="ml-1 h-3 w-3" />
              </div>
              <div className="w-28 text-center bg-blue-600 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                YTD <ChevronDown className="ml-1 h-3 w-3" />
              </div>
              <div className="w-28 text-center bg-blue-500 py-2 flex items-center justify-center cursor-pointer hover:bg-blue-600">
                Annual <ChevronDown className="ml-1 h-3 w-3" />
              </div>
              <div className="w-24 text-center bg-green-600 py-2 flex items-center justify-center cursor-pointer hover:bg-green-700">
                New <ChevronDown className="ml-1 h-3 w-3" />
              </div>
              <div className="w-24 text-center bg-amber-600 py-2 flex items-center justify-center cursor-pointer hover:bg-amber-700">
                Used <ChevronDown className="ml-1 h-3 w-3" />
              </div>
              <div className="w-36 text-right bg-indigo-600 py-2 pr-3 flex items-center justify-end cursor-pointer hover:bg-indigo-700 font-semibold rounded-r-md">
                Current Month <ChevronDown className="ml-1 h-3 w-3" />
              </div>
            </div>

            {/* Leaderboard Entries */}
            <div>
              {[
                {
                  name: 'Michael Scott',
                  units: 14,
                  frontGross: 18200,
                  backGross: 14300,
                  totalGross: 32500,
                  avgMonth: 12,
                  lastMonth: 15,
                  ytd: 82,
                  annualPace: 144,
                  newUnits: 9,
                  usedUnits: 5,
                  pvr: 2321,
                },
                {
                  name: 'Jim Halpert',
                  units: 12,
                  frontGross: 16400,
                  backGross: 12500,
                  totalGross: 28900,
                  avgMonth: 10,
                  lastMonth: 11,
                  ytd: 65,
                  annualPace: 120,
                  newUnits: 7,
                  usedUnits: 5,
                  pvr: 2408,
                },
                {
                  name: 'Dwight Schrute',
                  units: 11,
                  frontGross: 14800,
                  backGross: 11600,
                  totalGross: 26400,
                  avgMonth: 9,
                  lastMonth: 10,
                  ytd: 58,
                  annualPace: 108,
                  newUnits: 4,
                  usedUnits: 7,
                  pvr: 2400,
                },
                {
                  name: 'Pam Beesly',
                  units: 9,
                  frontGross: 11900,
                  backGross: 9800,
                  totalGross: 21700,
                  avgMonth: 8,
                  lastMonth: 7,
                  ytd: 48,
                  annualPace: 96,
                  newUnits: 5,
                  usedUnits: 4,
                  pvr: 2411,
                },
                {
                  name: 'Stanley Hudson',
                  units: 8,
                  frontGross: 10500,
                  backGross: 8700,
                  totalGross: 19200,
                  avgMonth: 7,
                  lastMonth: 9,
                  ytd: 42,
                  annualPace: 84,
                  newUnits: 3,
                  usedUnits: 5,
                  pvr: 2400,
                },
              ].map((person, index) => (
                <div
                  key={index}
                  className={`flex items-center py-2 px-1 ${
                    index !== 4 ? 'border-b' : ''
                  } border-gray-100 text-sm hover:bg-gray-50`}
                >
                  <div className="w-10 flex justify-center">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center
                      ${
                        index === 0
                          ? 'bg-yellow-100 text-yellow-600'
                          : index === 1
                          ? 'bg-gray-100 text-gray-600'
                          : index === 2
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-blue-50 text-blue-500'
                      }`}
                    >
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                  </div>
                  <div className="w-40 flex-shrink-0 font-medium truncate px-2">{person.name}</div>
                  <div className="w-28 text-center bg-purple-50">${person.pvr}</div>
                  <div className="w-36 text-center bg-green-50">
                    ${person.totalGross.toLocaleString()}
                  </div>
                  <div className="w-28 text-center bg-blue-50">{person.avgMonth}</div>
                  <div className="w-28 text-center">{person.lastMonth}</div>
                  <div className="w-28 text-center bg-blue-50">{person.ytd}</div>
                  <div className="w-28 text-center">{person.annualPace}</div>
                  <div className="w-24 text-center bg-green-50">{person.newUnits}</div>
                  <div className="w-24 text-center bg-amber-50">{person.usedUnits}</div>
                  <div className="w-36 text-right pr-3">
                    <span className="text-lg font-bold text-indigo-700">{person.units}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 pt-2 text-center">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600">
                View All Salespeople
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="flex-grow border hover:shadow-md transition-shadow">
          <CardHeader className="pb-2 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-500" />
                My Deals
              </CardTitle>
              <div
                className={`h-3 w-3 rounded-full ${
                  performanceColor === 'green'
                    ? 'bg-green-500'
                    : performanceColor === 'yellow'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
              ></div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="pb-2 font-medium text-xs text-gray-500">STOCK #</th>
                      <th className="pb-2 font-medium text-xs text-gray-500">CUSTOMER</th>
                      <th className="pb-2 font-medium text-xs text-gray-500 text-right">FRONT</th>
                      <th className="pb-2 font-medium text-xs text-gray-500 text-right">BACK</th>
                      <th className="pb-2 font-medium text-xs text-gray-500 text-right">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_DEALS.map((deal, index) => (
                      <tr
                        key={deal.id}
                        className={`${index !== MOCK_DEALS.length - 1 ? 'border-b' : ''} ${
                          deal.isNew ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="py-3 text-sm">{deal.stockNumber}</td>
                        <td className="py-3 text-sm">{deal.lastName}</td>
                        <td
                          className={`py-3 text-sm text-right ${
                            deal.frontGross === 0 ? 'text-red-500 font-medium' : ''
                          }`}
                        >
                          ${deal.frontGross.toLocaleString()}
                        </td>
                        <td className="py-3 text-sm text-right">
                          ${deal.backEndGross.toLocaleString()}
                        </td>
                        <td className="py-3 text-sm font-medium text-right">
                          ${(deal.frontGross + deal.backEndGross).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8">
              <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
                <h3 className="font-semibold text-blue-700 mb-2">Deal Performance</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xs text-gray-500">Avg Front</div>
                    <div className="font-bold text-blue-700">
                      ${Math.round(totalFrontEndGross / MOCK_DEALS.length).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Avg Back</div>
                    <div className="font-bold text-blue-700">
                      ${Math.round(totalBackEndGross / MOCK_DEALS.length).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Avg Total</div>
                    <div className="font-bold text-blue-700">
                      ${Math.round(totalGross / MOCK_DEALS.length).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto flex items-center text-blue-600 text-sm"
            >
              View All Deals
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Right column with Goal Tracker and Pay Calculator */}
        <div className="flex flex-col gap-6 h-full">
          {/* Taller Monthly Goal Tracker */}
          <GoalTracking />

          {/* Pay Calculator with Disclaimer */}
          <Card className="border hover:shadow-md transition-shadow overflow-hidden bg-white z-10 relative">
            <CardHeader className="pb-2 border-b bg-gradient-to-r from-green-400 to-teal-500">
              <CardTitle className="text-lg font-medium flex items-center text-white">
                <Calculator className="mr-2 h-5 w-5 text-white" />
                Pay Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 bg-white">
              <div className="flex items-center justify-center mb-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    ${Math.round(currentEarnings).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Month-to-Date Earnings</div>
                </div>
              </div>

              <div className="space-y-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">
                    Front End ({PAY_CALCULATOR.frontEndGrossPercent}%)
                  </span>
                  <span className="text-xs font-medium">
                    $
                    {Math.round(
                      totalFrontEndGross * (PAY_CALCULATOR.frontEndGrossPercent / 100)
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">
                    Back End ({PAY_CALCULATOR.backEndGrossPercent}%)
                  </span>
                  <span className="text-xs font-medium">
                    $
                    {Math.round(
                      totalBackEndGross * (PAY_CALCULATOR.backEndGrossPercent / 100)
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">Spiffs & Bonuses</span>
                  <span className="text-xs font-medium">
                    ${PAY_CALCULATOR.spiffs.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-xs font-semibold text-gray-700">
                      Potential Monthly Total
                    </span>
                    <span className="text-xs font-bold text-green-600">
                      ${Math.round(projectedEarningsWithBonus).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {projectedDeals >= PAY_CALCULATOR.bonusThreshold && (
                      <div className="text-green-600 mt-1 font-medium text-xs">
                        Includes ${PAY_CALCULATOR.bonusAmount} volume bonus!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t">
                <p className="text-[10px] text-gray-400 italic">
                  <strong>Disclaimer:</strong> These figures are estimates only and not actual
                  earnings. Final compensation may vary based on dealership policies and deal
                  structures.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Placeholder components for the routes
function PayCalculator() {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Pay Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <p>The pay calculator feature is coming soon.</p>
      </CardContent>
    </Card>
  );
}

function GoalTracker() {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Goal Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <p>The goal tracker feature is coming soon.</p>
      </CardContent>
    </Card>
  );
}

function PerformanceMetrics() {
  return (
    <Card className="p-6">
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Performance metrics are coming soon.</p>
      </CardContent>
    </Card>
  );
}

export default SalesDashboard;
