import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
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
  Users,
  UserPlus,
  Trash2,
  Edit,
  ChevronLeft,
  Search,
  Mail,
  Phone,
  Award,
  Activity,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  User,
  Clock,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

// Sample team members data
const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@dealership.com',
    phone: '(555) 123-4567',
    role: 'Sales Associate',
    team: 'Team A',
    status: 'active',
    performance: 'top',
    joinDate: '2021-03-12',
    deals: 24,
    lastActivity: '2 hours ago',
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'michael.chen@dealership.com',
    phone: '(555) 234-5678',
    role: 'Sales Associate',
    team: 'Team A',
    status: 'active',
    performance: 'high',
    joinDate: '2021-06-15',
    deals: 20,
    lastActivity: '4 hours ago',
  },
  {
    id: 3,
    name: 'David Rodriguez',
    email: 'david.rodriguez@dealership.com',
    phone: '(555) 345-6789',
    role: 'Sales Associate',
    team: 'Team A',
    status: 'active',
    performance: 'high',
    joinDate: '2022-01-07',
    deals: 18,
    lastActivity: '35 minutes ago',
  },
  {
    id: 4,
    name: 'Amanda Williams',
    email: 'amanda.williams@dealership.com',
    phone: '(555) 456-7890',
    role: 'Sales Associate',
    team: 'Team B',
    status: 'active',
    performance: 'medium',
    joinDate: '2022-03-28',
    deals: 16,
    lastActivity: '1 day ago',
  },
  {
    id: 5,
    name: 'Robert Johnson',
    email: 'robert.johnson@dealership.com',
    phone: '(555) 567-8901',
    role: 'Sales Associate',
    team: 'Team B',
    status: 'active',
    performance: 'medium',
    joinDate: '2022-05-10',
    deals: 15,
    lastActivity: '3 hours ago',
  },
  {
    id: 6,
    name: 'Lisa Thompson',
    email: 'lisa.thompson@dealership.com',
    phone: '(555) 678-9012',
    role: 'Sales Associate',
    team: 'Team B',
    status: 'inactive',
    performance: 'low',
    joinDate: '2022-08-22',
    deals: 8,
    lastActivity: '2 weeks ago',
  },
];

// Performance metrics by team
const TEAM_PERFORMANCE = [
  {
    team: 'Team A',
    members: 3,
    dealsTotal: 62,
    avgDealsPerMember: 20.7,
    grossTotal: 87800,
    avgGross: 1415.5,
    closingRatio: 32,
  },
  {
    team: 'Team B',
    members: 3,
    dealsTotal: 39,
    avgDealsPerMember: 13,
    grossTotal: 52600,
    avgGross: 1348.7,
    closingRatio: 28,
  },
];

const TeamManagementPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedTab, setSelectedTab] = useState('members');
  const [editingMember, setEditingMember] = useState(null);
  const [memberTeam, setMemberTeam] = useState('');
  const [isAddTeamDialogOpen, setIsAddTeamDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [teamColor, setTeamColor] = useState('#4f46e5'); // Default team color

  // Filter team members based on search and selected team
  const filteredMembers = TEAM_MEMBERS.filter(member => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTeam = selectedTeam === 'all' || member.team === selectedTeam;
    return matchesSearch && matchesTeam;
  });

  // Handle opening the edit dialog
  const handleEditMember = member => {
    setEditingMember(member);
    setMemberTeam(member.team);
  };

  // Handle saving team changes
  const handleSaveTeamChange = () => {
    // In production, this would be an API call
    console.log(`Changed ${editingMember.name}'s team to ${memberTeam}`);
    // Close the dialog
    setEditingMember(null);
  };

  // Handle team creation
  const handleCreateTeam = () => {
    if (!newTeamName.trim()) {
      alert('Please enter a team name');
      return;
    }

    // In production, this would be an API call
    console.log(`Created new team: ${newTeamName} with color ${teamColor}`);

    // Reset and close dialog
    setNewTeamName('');
    setTeamColor('#4f46e5');
    setIsAddTeamDialogOpen(false);
  };

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
          <h1 className="text-3xl font-bold">Team Management</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAddTeamDialogOpen(true)}>
            <Users className="mr-2 h-4 w-4" />
            Add Team
          </Button>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Team Member
          </Button>
        </div>
      </div>

      {/* Team Performance Summary */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{TEAM_MEMBERS.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {TEAM_MEMBERS.filter(m => m.status === 'active').length} active members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Deals (MTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {TEAM_PERFORMANCE.reduce((total, team) => total + team.dealsTotal, 0)}
            </div>
            <p className="text-xs text-green-600 mt-1">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Deals Per Person</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                TEAM_PERFORMANCE.reduce((total, team) => total + team.dealsTotal, 0) /
                TEAM_MEMBERS.filter(m => m.status === 'active').length
              ).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Target: 15 deals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Closing Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                TEAM_PERFORMANCE.reduce((sum, team) => sum + team.closingRatio * team.members, 0) /
                TEAM_MEMBERS.filter(m => m.status === 'active').length
              ).toFixed(1)}
              %
            </div>
            <p className="text-xs text-green-600 mt-1">+2.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Activity className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="training">
            <Award className="h-4 w-4 mr-2" />
            Training & Development
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between flex-wrap gap-4">
                <CardTitle>Team Members</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search members..."
                      className="w-64 pl-8"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Select Team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Teams</SelectItem>
                      <SelectItem value="Team A">Team A</SelectItem>
                      <SelectItem value="Team B">Team B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Deals (MTD)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map(member => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <div>{member.name}</div>
                            <div className="text-xs text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{member.role}</TableCell>
                      <TableCell>{member.team}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span
                            className={`font-medium ${
                              member.performance === 'top'
                                ? 'text-green-600'
                                : member.performance === 'high'
                                  ? 'text-blue-600'
                                  : member.performance === 'medium'
                                    ? 'text-amber-600'
                                    : 'text-gray-600'
                            }`}
                          >
                            {member.deals}
                          </span>
                          {member.performance === 'top' && (
                            <Award className="ml-1 h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Checkbox
                            checked={member.status === 'active'}
                            onCheckedChange={checked => {
                              // Handle status change
                              const newStatus = checked ? 'active' : 'inactive';
                              // Update member status (this would be an API call in production)
                              console.log(`Set ${member.name} to ${newStatus}`);

                              // Show notification if setting to inactive
                              if (newStatus === 'inactive') {
                                alert(
                                  `A notification has been sent to the Admin to delete ${member.name}.`
                                );
                                // In production, this would be an API call to send email
                              }
                            }}
                            id={`active-status-${member.id}`}
                          />
                          <label htmlFor={`active-status-${member.id}`} className="ml-2 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                member.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {member.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Clock className="mr-1 h-3 w-3" />
                          {member.lastActivity}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMember(member)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-right">Total Units</TableHead>
                      <TableHead className="text-right">New Units</TableHead>
                      <TableHead className="text-right">Used Units</TableHead>
                      <TableHead className="text-right">Total Gross</TableHead>
                      <TableHead className="text-right">PVR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      {
                        team: 'Team A',
                        members: 3,
                        totalUnits: 62,
                        newUnits: 36,
                        usedUnits: 26,
                        totalGross: 124500,
                        pvr: 2008,
                        lastMonth: 58,
                        ytd: 394,
                        avgMonthly: 65.7,
                        annualPace: 788,
                        closingRatio: 32,
                      },
                      {
                        team: 'Team B',
                        members: 2,
                        totalUnits: 38,
                        newUnits: 22,
                        usedUnits: 16,
                        totalGross: 76000,
                        pvr: 2000,
                        lastMonth: 30,
                        ytd: 224,
                        avgMonthly: 37.3,
                        annualPace: 448,
                        closingRatio: 28,
                      },
                    ].map(team => (
                      <TableRow key={team.team}>
                        <TableCell className="font-medium">{team.team}</TableCell>
                        <TableCell className="text-right">{team.totalUnits}</TableCell>
                        <TableCell className="text-right">{team.newUnits}</TableCell>
                        <TableCell className="text-right">{team.usedUnits}</TableCell>
                        <TableCell className="text-right">
                          ${team.totalGross.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">${team.pvr}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-4">Extended Metrics</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Team</TableHead>
                        <TableHead className="text-right">Last Month</TableHead>
                        <TableHead className="text-right">YTD</TableHead>
                        <TableHead className="text-right">Avg/Month</TableHead>
                        <TableHead className="text-right">Annual Pace</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        {
                          team: 'Team A',
                          members: 3,
                          totalUnits: 62,
                          newUnits: 36,
                          usedUnits: 26,
                          totalGross: 124500,
                          pvr: 2008,
                          lastMonth: 58,
                          ytd: 394,
                          avgMonthly: 65.7,
                          annualPace: 788,
                          closingRatio: 32,
                        },
                        {
                          team: 'Team B',
                          members: 2,
                          totalUnits: 38,
                          newUnits: 22,
                          usedUnits: 16,
                          totalGross: 76000,
                          pvr: 2000,
                          lastMonth: 30,
                          ytd: 224,
                          avgMonthly: 37.3,
                          annualPace: 448,
                          closingRatio: 28,
                        },
                      ].map(team => (
                        <TableRow key={team.team}>
                          <TableCell className="font-medium">{team.team}</TableCell>
                          <TableCell className="text-right">{team.lastMonth}</TableCell>
                          <TableCell className="text-right">{team.ytd}</TableCell>
                          <TableCell className="text-right">{team.avgMonthly.toFixed(1)}</TableCell>
                          <TableCell className="text-right">{team.annualPace}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Closing Ratio</span>
                      <span className="text-sm font-medium text-green-600">
                        <CheckCircle className="inline-block h-4 w-4 mr-1" />
                        Good
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: '85%' }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Current: 30%</span>
                      <span>Target: 25%</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Deals Per Person</span>
                      <span className="text-sm font-medium text-amber-600">
                        <AlertTriangle className="inline-block h-4 w-4 mr-1" />
                        Average
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: '68%' }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Current: 12.2</span>
                      <span>Target: 15</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Customer Satisfaction</span>
                      <span className="text-sm font-medium text-green-600">
                        <CheckCircle className="inline-block h-4 w-4 mr-1" />
                        Excellent
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: '92%' }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Current: 4.7/5</span>
                      <span>Target: 4.5/5</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Follow-up Completion</span>
                      <span className="text-sm font-medium text-amber-600">
                        <AlertTriangle className="inline-block h-4 w-4 mr-1" />
                        Needs Improvement
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: '65%' }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Current: 65%</span>
                      <span>Target: 90%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="training" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Training & Development</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <RefreshCw className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Training Module Coming Soon</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  The training and development module is currently under development. Check back
                  soon for updates on training courses, certifications, and skill development
                  tracking.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Team Dialog */}
      <Dialog open={isAddTeamDialogOpen} onOpenChange={setIsAddTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Team</DialogTitle>
            <DialogDescription>Create a new team to organize your salespeople.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="Enter team name"
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="team-color">Team Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  id="team-color"
                  value={teamColor}
                  onChange={e => setTeamColor(e.target.value)}
                  className="p-0 h-9 w-9 border rounded cursor-pointer"
                />
                <div className="text-sm">{teamColor}</div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTeamDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTeam}>Create Team</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Edit Dialog */}
      {editingMember && (
        <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Team Assignment</DialogTitle>
              <DialogDescription>
                Change the team assignment for {editingMember.name}. Sales Managers can only modify
                team assignments.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Label htmlFor="team-select">Team Assignment</Label>
              <Select value={memberTeam} onValueChange={setMemberTeam}>
                <SelectTrigger id="team-select">
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Team A">Team A</SelectItem>
                  <SelectItem value="Team B">Team B</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingMember(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTeamChange}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default TeamManagementPage;
