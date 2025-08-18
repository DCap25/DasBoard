import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  ChevronLeft,
  Target,
  TrendingUp,
  DollarSign,
  Edit,
  Save,
  Car,
  Users,
  ArrowUp,
  ArrowDown,
  BarChart,
  Calendar,
  Medal,
} from 'lucide-react';

// Sample individual goals
const INDIVIDUAL_GOALS = [
  {
    id: 1,
    name: 'Sarah Johnson',
    team: 'Team A',
    currentUnits: 24,
    goalUnits: 30,
    lastMonth: 28,
    avgMonthly: 26,
    grossTarget: 45000,
    currentGross: 38500,
    frontGrossGoal: 1200,
    backEndGoal: 900,
  },
  {
    id: 2,
    name: 'Michael Chen',
    team: 'Team A',
    currentUnits: 20,
    goalUnits: 25,
    lastMonth: 22,
    avgMonthly: 21,
    grossTarget: 38000,
    currentGross: 32100,
    frontGrossGoal: 1100,
    backEndGoal: 850,
  },
  {
    id: 3,
    name: 'David Rodriguez',
    team: 'Team A',
    currentUnits: 18,
    goalUnits: 22,
    lastMonth: 16,
    avgMonthly: 18,
    grossTarget: 32000,
    currentGross: 28700,
    frontGrossGoal: 950,
    backEndGoal: 800,
  },
  {
    id: 4,
    name: 'Amanda Williams',
    team: 'Team B',
    currentUnits: 16,
    goalUnits: 20,
    lastMonth: 14,
    avgMonthly: 15,
    grossTarget: 30000,
    currentGross: 21800,
    frontGrossGoal: 900,
    backEndGoal: 750,
  },
  {
    id: 5,
    name: 'Robert Johnson',
    team: 'Team B',
    currentUnits: 15,
    goalUnits: 18,
    lastMonth: 16,
    avgMonthly: 14,
    grossTarget: 28000,
    currentGross: 19500,
    frontGrossGoal: 850,
    backEndGoal: 700,
  },
];

// Sample team goals
const TEAM_GOALS = [
  {
    id: 1,
    name: 'Team A',
    members: 3,
    currentUnits: 62,
    goalUnits: 75,
    lastMonth: 66,
    grossTarget: 115000,
    currentGross: 99300,
    closingRatioTarget: 35,
    currentClosingRatio: 32,
    frontEndTarget: 1200,
    backEndTarget: 800,
  },
  {
    id: 2,
    name: 'Team B',
    members: 2,
    currentUnits: 31,
    goalUnits: 40,
    lastMonth: 30,
    grossTarget: 60000,
    currentGross: 41300,
    closingRatioTarget: 30,
    currentClosingRatio: 28,
    frontEndTarget: 1100,
    backEndTarget: 700,
  },
];

// Monthly targets for the dealership
const MONTHLY_TARGETS = {
  newVehicles: 65,
  usedVehicles: 50,
  totalUnits: 115,
  totalGross: 175000,
  avgGrossPerUnit: 1500,
  closingRatio: 32,
};

const GoalsPage = () => {
  const [selectedTab, setSelectedTab] = useState('individual');
  const [editMode, setEditMode] = useState(false);

  // Calculate overall progress for all salespeople
  const calculateOverallProgress = () => {
    const totalCurrentUnits = INDIVIDUAL_GOALS.reduce(
      (sum, person) => sum + person.currentUnits,
      0
    );
    const totalGoalUnits = INDIVIDUAL_GOALS.reduce((sum, person) => sum + person.goalUnits, 0);
    return {
      currentUnits: totalCurrentUnits,
      goalUnits: totalGoalUnits,
      percentage: Math.round((totalCurrentUnits / totalGoalUnits) * 100),
    };
  };

  const overallProgress = calculateOverallProgress();

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link to="/dashboard">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Set Team Goals</h1>
        </div>
        <Button onClick={() => setEditMode(!editMode)}>
          {editMode ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Goals
            </>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" />
              Edit Goals
            </>
          )}
        </Button>
      </div>

      {/* Monthly Dealership Goals Summary */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5 text-blue-600" />
            Monthly Dealership Targets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">New Vehicles</div>
              <div className="text-xl font-bold flex items-center">
                <Car className="mr-2 h-4 w-4 text-green-600" />
                {MONTHLY_TARGETS.newVehicles}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Used Vehicles</div>
              <div className="text-xl font-bold flex items-center">
                <Car className="mr-2 h-4 w-4 text-amber-600" />
                {MONTHLY_TARGETS.usedVehicles}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Units</div>
              <div className="text-xl font-bold flex items-center">
                <Users className="mr-2 h-4 w-4 text-blue-600" />
                {MONTHLY_TARGETS.totalUnits}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Gross</div>
              <div className="text-xl font-bold flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-purple-600" />$
                {MONTHLY_TARGETS.totalGross.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Avg. Gross/Unit</div>
              <div className="text-xl font-bold flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 text-indigo-600" />$
                {MONTHLY_TARGETS.avgGrossPerUnit.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Closing Ratio</div>
              <div className="text-xl font-bold flex items-center">
                <BarChart className="mr-2 h-4 w-4 text-blue-600" />
                {MONTHLY_TARGETS.closingRatio}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overall Progress */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Overall Goal Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Units Sold</div>
                <div className="text-2xl font-bold">
                  {overallProgress.currentUnits} / {overallProgress.goalUnits}
                </div>
                <div className="text-sm text-gray-500">
                  {overallProgress.percentage}% of monthly goal
                </div>
              </div>
            </div>

            <div className="w-full md:w-3/5">
              <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    overallProgress.percentage >= 90
                      ? 'bg-green-500'
                      : overallProgress.percentage >= 70
                        ? 'bg-blue-500'
                        : overallProgress.percentage >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(overallProgress.percentage, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Individual vs Team Goals */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="individual">
            <Medal className="h-4 w-4 mr-2" />
            Individual Goals
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team Goals
          </TabsTrigger>
          <TabsTrigger value="history">
            <Calendar className="h-4 w-4 mr-2" />
            Historical Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Individual Salesperson Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-right">Current</TableHead>
                    <TableHead className="text-right">Goal</TableHead>
                    <TableHead className="text-right">Last Month</TableHead>
                    <TableHead className="text-right">Progress</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Avg Front Gross</TableHead>
                    <TableHead className="text-right">Avg Back End Gross</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {INDIVIDUAL_GOALS.map(person => {
                    const progress = Math.round((person.currentUnits / person.goalUnits) * 100);
                    const vsLastMonth = person.currentUnits - person.lastMonth;

                    return (
                      <TableRow key={person.id}>
                        <TableCell className="font-medium">{person.name}</TableCell>
                        <TableCell>{person.team}</TableCell>
                        <TableCell className="text-right">{person.currentUnits}</TableCell>
                        <TableCell className="text-right">
                          {editMode ? (
                            <Input
                              type="number"
                              defaultValue={person.goalUnits}
                              className="w-16 h-8 text-right inline-block"
                            />
                          ) : (
                            person.goalUnits
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            {person.lastMonth}{' '}
                            {vsLastMonth > 0 ? (
                              <ArrowUp className="ml-1 h-3 w-3 text-green-600" />
                            ) : vsLastMonth < 0 ? (
                              <ArrowDown className="ml-1 h-3 w-3 text-red-600" />
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <div className="w-20 h-2 bg-gray-100 rounded-full mr-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  progress >= 90
                                    ? 'bg-green-500'
                                    : progress >= 70
                                      ? 'bg-blue-500'
                                      : progress >= 50
                                        ? 'bg-amber-500'
                                        : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          ${person.currentGross.toLocaleString()} / $
                          {person.grossTarget.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {editMode ? (
                            <div className="flex items-center justify-end gap-2">
                              <Input
                                type="number"
                                defaultValue={person.frontGrossGoal}
                                min="0"
                                max="9999"
                                step="1"
                                className="w-20 h-8 text-right inline-block"
                              />
                              <span>$</span>
                            </div>
                          ) : (
                            '$' +
                            person.frontGrossGoal.toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editMode ? (
                            <div className="flex items-center justify-end gap-2">
                              <Input
                                type="number"
                                defaultValue={person.backEndGoal}
                                min="0"
                                max="9999"
                                step="1"
                                className="w-20 h-8 text-right inline-block"
                              />
                              <span>$</span>
                            </div>
                          ) : (
                            '$' +
                            person.backEndGoal.toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-right">Members</TableHead>
                    <TableHead className="text-right">Current / Goal</TableHead>
                    <TableHead className="text-right">Last Month</TableHead>
                    <TableHead className="text-right">Progress</TableHead>
                    <TableHead className="text-right">Gross</TableHead>
                    <TableHead className="text-right">Closing Ratio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {TEAM_GOALS.map(team => {
                    const progress = Math.round((team.currentUnits / team.goalUnits) * 100);
                    const vsLastMonth = team.currentUnits - team.lastMonth;

                    return (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.name}</TableCell>
                        <TableCell className="text-right">{team.members}</TableCell>
                        <TableCell className="text-right">
                          {team.currentUnits} /{' '}
                          {editMode ? (
                            <Input
                              type="number"
                              defaultValue={team.goalUnits}
                              className="w-16 h-8 text-right inline-block"
                            />
                          ) : (
                            team.goalUnits
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            {team.lastMonth}{' '}
                            {vsLastMonth > 0 ? (
                              <ArrowUp className="ml-1 h-3 w-3 text-green-600" />
                            ) : vsLastMonth < 0 ? (
                              <ArrowDown className="ml-1 h-3 w-3 text-red-600" />
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end">
                            <div className="w-20 h-2 bg-gray-100 rounded-full mr-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  progress >= 90
                                    ? 'bg-green-500'
                                    : progress >= 70
                                      ? 'bg-blue-500'
                                      : progress >= 50
                                        ? 'bg-amber-500'
                                        : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          ${team.currentGross.toLocaleString()} / $
                          {team.grossTarget.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {team.currentClosingRatio}% /{' '}
                          {editMode ? (
                            <Input
                              type="number"
                              defaultValue={team.closingRatioTarget}
                              className="w-12 h-8 text-right inline-block"
                            />
                          ) : (
                            `${team.closingRatioTarget}%`
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Front End / Back End Targets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Team</TableHead>
                          <TableHead className="text-right">Front End Target</TableHead>
                          <TableHead className="text-right">Back End Target</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {TEAM_GOALS.map(team => (
                          <TableRow key={`fe-${team.id}`}>
                            <TableCell>{team.name}</TableCell>
                            <TableCell className="text-right">
                              $
                              {editMode ? (
                                <Input
                                  type="number"
                                  defaultValue={team.frontEndTarget}
                                  className="w-20 h-8 text-right inline-block"
                                />
                              ) : (
                                team.frontEndTarget.toLocaleString()
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              $
                              {editMode ? (
                                <Input
                                  type="number"
                                  defaultValue={team.backEndTarget}
                                  className="w-20 h-8 text-right inline-block"
                                />
                              ) : (
                                team.backEndTarget.toLocaleString()
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Performance Bonus Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Achievement Level</TableHead>
                          <TableHead className="text-right">Team Bonus</TableHead>
                          <TableHead className="text-right">Individual Bonus</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>100% of Goal</TableCell>
                          <TableCell className="text-right">$1,000</TableCell>
                          <TableCell className="text-right">$500</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>110% of Goal</TableCell>
                          <TableCell className="text-right">$2,000</TableCell>
                          <TableCell className="text-right">$1,000</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>120% of Goal</TableCell>
                          <TableCell className="text-right">$3,500</TableCell>
                          <TableCell className="text-right">$1,500</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Historical Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Historical Data Module Coming Soon</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  The historical performance and goals tracking module is currently under
                  development. Check back soon for detailed reports on past performance and goal
                  achievement.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoalsPage;
