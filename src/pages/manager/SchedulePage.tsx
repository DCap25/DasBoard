import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Calendar,
  CalendarCell,
  CalendarCellProps,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarHeading,
  CalendarMonthTrigger,
  CalendarViewTrigger,
} from '../../components/ui/calendar';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  UserPlus,
  Calendar as CalendarIcon,
  Clock,
  Save,
  Copy,
  Trash2,
  FileText,
  ArrowLeft,
  AlertCircle,
  Info,
  Plus,
  Check,
  X,
  Edit,
} from 'lucide-react';

// Sample schedule data
const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Sarah Johnson',
    team: 'Team A',
    color: '#4f46e5',
  },
  {
    id: 2,
    name: 'Michael Chen',
    team: 'Team A',
    color: '#4f46e5',
  },
  {
    id: 3,
    name: 'David Rodriguez',
    team: 'Team A',
    color: '#4f46e5',
  },
  {
    id: 4,
    name: 'Amanda Williams',
    team: 'Team B',
    color: '#0891b2',
  },
  {
    id: 5,
    name: 'Robert Johnson',
    team: 'Team B',
    color: '#0891b2',
  },
];

// Sample shift types
const SHIFT_TYPES = [
  { id: 1, name: 'Opening (9am-6pm)', color: '#22c55e' },
  { id: 2, name: 'Mid (10am-7pm)', color: '#3b82f6' },
  { id: 3, name: 'Closing (12pm-9pm)', color: '#8b5cf6' },
  { id: 4, name: 'Weekend (9am-5pm)', color: '#f59e0b' },
  { id: 5, name: 'Off', color: '#e5e7eb' },
];

// Sample schedule data for the current month
const CURRENT_SCHEDULE = [
  {
    date: '2023-06-12',
    day: 'Monday',
    shifts: [
      { memberId: 1, shiftTypeId: 1 },
      { memberId: 2, shiftTypeId: 1 },
      { memberId: 3, shiftTypeId: 1 },
      { memberId: 4, shiftTypeId: 5 },
      { memberId: 5, shiftTypeId: 5 },
    ],
  },
  {
    date: '2023-06-13',
    day: 'Tuesday',
    shifts: [
      { memberId: 1, shiftTypeId: 1 },
      { memberId: 2, shiftTypeId: 1 },
      { memberId: 3, shiftTypeId: 1 },
      { memberId: 4, shiftTypeId: 5 },
      { memberId: 5, shiftTypeId: 5 },
    ],
  },
  {
    date: '2023-06-14',
    day: 'Wednesday',
    shifts: [
      { memberId: 1, shiftTypeId: 2 },
      { memberId: 2, shiftTypeId: 2 },
      { memberId: 3, shiftTypeId: 2 },
      { memberId: 4, shiftTypeId: 5 },
      { memberId: 5, shiftTypeId: 5 },
    ],
  },
  {
    date: '2023-06-15',
    day: 'Thursday',
    shifts: [
      { memberId: 1, shiftTypeId: 5 },
      { memberId: 2, shiftTypeId: 5 },
      { memberId: 3, shiftTypeId: 5 },
      { memberId: 4, shiftTypeId: 1 },
      { memberId: 5, shiftTypeId: 1 },
    ],
  },
  {
    date: '2023-06-16',
    day: 'Friday',
    shifts: [
      { memberId: 1, shiftTypeId: 5 },
      { memberId: 2, shiftTypeId: 5 },
      { memberId: 3, shiftTypeId: 5 },
      { memberId: 4, shiftTypeId: 3 },
      { memberId: 5, shiftTypeId: 3 },
    ],
  },
  {
    date: '2023-06-17',
    day: 'Saturday',
    shifts: [
      { memberId: 1, shiftTypeId: 4 },
      { memberId: 2, shiftTypeId: 4 },
      { memberId: 3, shiftTypeId: 4 },
      { memberId: 4, shiftTypeId: 4 },
      { memberId: 5, shiftTypeId: 4 },
    ],
  },
  {
    date: '2023-06-18',
    day: 'Sunday',
    shifts: [
      { memberId: 1, shiftTypeId: 5 },
      { memberId: 2, shiftTypeId: 5 },
      { memberId: 3, shiftTypeId: 5 },
      { memberId: 4, shiftTypeId: 4 },
      { memberId: 5, shiftTypeId: 5 },
    ],
  },
];

// Helper to generate dates for the week view
const generateWeekDates = (startDate = new Date()) => {
  const dates = [];
  const currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() - currentDate.getDay()); // Start from Sunday

  for (let i = 0; i < 7; i++) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

// Helper to format date as YYYY-MM-DD
const formatDate = date => {
  return date.toISOString().split('T')[0];
};

const SchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState('week'); // 'week' or 'month'
  const [currentWeek, setCurrentWeek] = useState(generateWeekDates());
  const [editingShift, setEditingShift] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedShiftType, setSelectedShiftType] = useState(null);

  // Move to the next/previous week
  const navigateWeek = direction => {
    const newStartDate = new Date(currentWeek[0]);
    newStartDate.setDate(newStartDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(generateWeekDates(newStartDate));
  };

  // Helper to get shift type by ID
  const getShiftType = id => SHIFT_TYPES.find(shift => shift.id === id);

  // Helper to get team member by ID
  const getTeamMember = id => TEAM_MEMBERS.find(member => member.id === id);

  // Get shifts for a specific member on a specific date
  const getMemberShift = (memberId, date) => {
    const scheduleDay = CURRENT_SCHEDULE.find(day => day.date === date);
    if (!scheduleDay) return null;

    const shift = scheduleDay.shifts.find(shift => shift.memberId === memberId);
    return shift ? getShiftType(shift.shiftTypeId) : null;
  };

  // Handle editing a shift
  const handleEditShift = (memberId, date) => {
    const scheduleDay = CURRENT_SCHEDULE.find(day => day.date === date);
    if (!scheduleDay) return;

    const shift = scheduleDay.shifts.find(shift => shift.memberId === memberId);

    setEditingShift({ memberId, date });
    setSelectedMember(TEAM_MEMBERS.find(m => m.id === memberId));
    setSelectedShiftType(shift ? getShiftType(shift.shiftTypeId) : null);
  };

  // Handle saving a shift
  const handleSaveShift = () => {
    // In a real app, this would update the database
    console.log('Saving shift:', {
      memberId: selectedMember.id,
      date: editingShift.date,
      shiftTypeId: selectedShiftType.id,
    });

    // Close the edit modal
    setEditingShift(null);
    setSelectedMember(null);
    setSelectedShiftType(null);
  };

  // Get the name of the month and year
  const monthYearString = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(currentWeek[0]);

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
          <h1 className="text-3xl font-bold">Sales Schedule Configurator</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Copy className="mr-2 h-4 w-4" />
            Copy Last Week
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Export Schedule
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Schedule Navigation */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />
              <CardTitle>{monthYearString}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
                Previous Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(generateWeekDates(new Date()))}
              >
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                Next Week
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          {/* Week View */}
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-8 border-b">
                {/* Left header for team members */}
                <div className="font-medium text-sm p-3 border-r bg-gray-50">Team Member</div>

                {/* Day headers */}
                {currentWeek.map((date, index) => {
                  const isToday = new Date().toDateString() === date.toDateString();
                  return (
                    <div
                      key={index}
                      className={`p-3 text-center border-r last:border-r-0 ${
                        isToday ? 'bg-blue-50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div
                        className={`text-xs ${
                          isToday ? 'font-bold text-blue-700' : 'text-gray-500'
                        }`}
                      >
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Team member rows */}
              {TEAM_MEMBERS.map(member => (
                <div key={member.id} className="grid grid-cols-8 border-b last:border-b-0">
                  {/* Team member name */}
                  <div className="p-3 flex items-center border-r bg-gray-50">
                    <div
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: member.color }}
                    ></div>
                    <div className="text-sm font-medium">{member.name}</div>
                  </div>

                  {/* Shift cells for each day */}
                  {currentWeek.map((date, dateIndex) => {
                    const formattedDate = formatDate(date);
                    const shift = getMemberShift(member.id, formattedDate);

                    return (
                      <div
                        key={`${member.id}-${dateIndex}`}
                        className="p-2 border-r last:border-r-0 text-center cursor-pointer hover:bg-gray-50"
                        onClick={() => handleEditShift(member.id, formattedDate)}
                      >
                        {shift ? (
                          <div
                            className="text-xs p-1 rounded"
                            style={{
                              backgroundColor: shift.color + '20',
                              borderLeft: `3px solid ${shift.color}`,
                            }}
                          >
                            {shift.name}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 italic p-1">Unassigned</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Coverage Overview */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Team Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Opening</TableHead>
                  <TableHead className="text-right">Mid</TableHead>
                  <TableHead className="text-right">Closing</TableHead>
                  <TableHead className="text-right">Off</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentWeek.map((date, index) => {
                  const formattedDate = formatDate(date);
                  const scheduleForDay = CURRENT_SCHEDULE.find(d => d.date === formattedDate);

                  // Count shifts by type
                  const shifts = {
                    opening: 0,
                    mid: 0,
                    closing: 0,
                    weekend: 0,
                    off: 0,
                  };

                  if (scheduleForDay) {
                    scheduleForDay.shifts.forEach(shift => {
                      if (shift.shiftTypeId === 1) shifts.opening++;
                      else if (shift.shiftTypeId === 2) shifts.mid++;
                      else if (shift.shiftTypeId === 3) shifts.closing++;
                      else if (shift.shiftTypeId === 4) shifts.weekend++;
                      else if (shift.shiftTypeId === 5) shifts.off++;
                    });
                  }

                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </TableCell>
                      <TableCell>
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </TableCell>
                      <TableCell className="text-right">
                        {shifts.opening > 0 ? shifts.opening : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {shifts.mid > 0 ? shifts.mid : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {shifts.closing > 0 || shifts.weekend > 0
                          ? shifts.closing + shifts.weekend
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {shifts.off > 0 ? shifts.off : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shift Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {SHIFT_TYPES.map(shift => (
                <div key={shift.id} className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-2"
                    style={{ backgroundColor: shift.color }}
                  ></div>
                  <div className="flex-grow">
                    <div className="font-medium text-sm">{shift.name}</div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button variant="outline" className="w-full mt-2" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Shift Type
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Shift Dialog */}
      {editingShift && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium mb-4">Edit Shift</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="member">Team Member</Label>
                <div className="text-sm font-medium mt-1">{selectedMember?.name}</div>
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <div className="text-sm font-medium mt-1">
                  {new Date(editingShift.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <div>
                <Label htmlFor="shift-type">Shift Type</Label>
                <Select
                  value={selectedShiftType?.id.toString() || ''}
                  onValueChange={value => {
                    const shiftType = SHIFT_TYPES.find(s => s.id === parseInt(value));
                    setSelectedShiftType(shiftType);
                  }}
                >
                  <SelectTrigger id="shift-type">
                    <SelectValue placeholder="Select a shift type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFT_TYPES.map(shift => (
                      <SelectItem key={shift.id} value={shift.id.toString()}>
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: shift.color }}
                          ></div>
                          {shift.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingShift(null);
                    setSelectedMember(null);
                    setSelectedShiftType(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveShift}>Save</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchedulePage;
