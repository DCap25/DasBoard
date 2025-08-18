import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';

// Mock data for appointments
const APPOINTMENTS = [
  {
    id: 1,
    customer: 'John Smith',
    vehicle: '2024 Honda Accord',
    time: '9:00 AM',
    date: '2024-05-17',
    status: 'Confirmed',
    type: 'Final Document Signing',
  },
  {
    id: 2,
    customer: 'Sarah Wilson',
    vehicle: '2023 Toyota Camry',
    time: '10:30 AM',
    date: '2024-05-17',
    status: 'Confirmed',
    type: 'Contract Review',
  },
  {
    id: 3,
    customer: 'Michael Brown',
    vehicle: '2023 Nissan Rogue',
    time: '1:00 PM',
    date: '2024-05-17',
    status: 'Pending',
    type: 'Insurance Verification',
  },
  {
    id: 4,
    customer: 'Jessica Taylor',
    vehicle: '2024 Subaru Outback',
    time: '3:30 PM',
    date: '2024-05-17',
    status: 'Confirmed',
    type: 'Final Document Signing',
  },
  {
    id: 5,
    customer: 'David Anderson',
    vehicle: '2023 Mazda CX-5',
    time: '11:00 AM',
    date: '2024-05-18',
    status: 'Confirmed',
    type: 'Contract Review',
  },
  {
    id: 6,
    customer: 'Elizabeth Martin',
    vehicle: '2024 Jeep Grand Cherokee',
    time: '2:00 PM',
    date: '2024-05-18',
    status: 'Pending',
    type: 'Final Document Signing',
  },
  {
    id: 7,
    customer: 'Robert Miller',
    vehicle: '2024 Ford F-150',
    time: '9:30 AM',
    date: '2024-05-19',
    status: 'Confirmed',
    type: 'Insurance Verification',
  },
  {
    id: 8,
    customer: 'Jennifer Lee',
    vehicle: '2023 Chevy Equinox',
    time: '1:30 PM',
    date: '2024-05-19',
    status: 'Confirmed',
    type: 'Contract Review',
  },
];

// Generate calendar days
const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Create array for calendar
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return days;
};

const FinanceSchedulePage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = generateCalendarDays(year, month);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Format date as YYYY-MM-DD for comparison
  const formatDateForComparison = (year: number, month: number, day: number | null) => {
    if (day === null) return '';
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Filter appointments for selected date
  const filteredAppointments = APPOINTMENTS.filter(app => app.date === selectedDate).sort(
    (a, b) => {
      // Sort by time
      const timeA = new Date(`1970/01/01 ${a.time}`).getTime();
      const timeB = new Date(`1970/01/01 ${b.time}`).getTime();
      return timeA - timeB;
    }
  );

  // Count appointments per day for the calendar
  const appointmentsByDay = APPOINTMENTS.reduce(
    (acc, appointment) => {
      const date = appointment.date;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date]++;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Finance Schedule</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-7 lg:grid-cols-12">
        {/* Calendar */}
        <div className="md:col-span-3 lg:col-span-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <CardTitle>
                  {monthNames[month]} {year}
                </CardTitle>
                <Button variant="ghost" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {daysOfWeek.map(day => (
                  <div key={day} className="text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const dateString = day ? formatDateForComparison(year, month, day) : '';
                  const isCurrentDay = dateString === new Date().toISOString().split('T')[0];
                  const isSelected = dateString === selectedDate;
                  const appointmentCount = dateString ? appointmentsByDay[dateString] || 0 : 0;

                  return (
                    <div
                      key={index}
                      onClick={() =>
                        day && setSelectedDate(formatDateForComparison(year, month, day))
                      }
                      className={`
                        h-12 flex flex-col items-center justify-center rounded-md cursor-pointer text-sm
                        ${isCurrentDay ? 'border border-blue-500' : ''}
                        ${isSelected ? 'bg-blue-100' : day ? 'hover:bg-gray-100' : ''}
                        ${!day ? 'text-gray-300' : ''}
                      `}
                    >
                      {day && (
                        <>
                          <span>{day}</span>
                          {appointmentCount > 0 && (
                            <span className="text-xs px-1.5 py-0.5 bg-blue-500 text-white rounded-full mt-1">
                              {appointmentCount}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments */}
        <div className="md:col-span-4 lg:col-span-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>
                  Appointments for{' '}
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No appointments scheduled for this day.</p>
                  <Button className="mt-4" variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map(appointment => (
                    <div
                      key={appointment.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{appointment.customer}</h3>
                          <p className="text-sm text-gray-500">{appointment.vehicle}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {appointment.time}
                            <span className="mx-2">•</span>
                            <Badge
                              variant={appointment.status === 'Confirmed' ? 'default' : 'outline'}
                            >
                              {appointment.status}
                            </Badge>
                            <span className="mx-2">•</span>
                            {appointment.type}
                          </div>
                        </div>
                        <div className="flex">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FinanceSchedulePage;
