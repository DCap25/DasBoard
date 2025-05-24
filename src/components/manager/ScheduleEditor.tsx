import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useToast } from '../../lib/use-toast';
import { useSupabaseQuery } from '../../hooks/use-supabase-query';
import { useSupabaseMutation } from '../../hooks/use-supabase-mutation';
import { queryClient } from '../../lib/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Calendar } from '../../components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  CalendarIcon,
  PlusCircle,
  Loader2,
  Edit,
  Trash2,
  Save,
  AlertTriangle,
  Users,
} from 'lucide-react';
import {
  format,
  parseISO,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns';

// Define interfaces for data types
interface SalesPerson {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_url?: string;
  team?: string;
}

interface Schedule {
  id: string;
  salesperson_id: string;
  date: string;
  shift_start: string;
  shift_end: string;
  notes?: string;
  team?: string;
  salesperson?: {
    first_name: string;
    last_name: string;
    profile_image_url?: string;
  };
}

interface ScheduleFormData {
  id?: string;
  salesperson_id: string;
  date: string;
  shift_start: string;
  shift_end: string;
  notes: string;
  team: string;
}

// Team options
const TEAMS = [
  { id: 'red', name: 'Red Team' },
  { id: 'blue', name: 'Blue Team' },
  { id: 'green', name: 'Green Team' },
  { id: 'flex', name: 'Flex' },
];

// Shift templates
const SHIFT_TEMPLATES = [
  { id: 'morning', name: 'Morning (9AM-5PM)', start: '09:00', end: '17:00' },
  { id: 'midday', name: 'Midday (11AM-7PM)', start: '11:00', end: '19:00' },
  { id: 'evening', name: 'Evening (1PM-9PM)', start: '13:00', end: '21:00' },
  { id: 'weekend', name: 'Weekend (10AM-6PM)', start: '10:00', end: '18:00' },
];

export function ScheduleEditor() {
  // State variables
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [formData, setFormData] = useState<ScheduleFormData>({
    salesperson_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    shift_start: '09:00',
    shift_end: '17:00',
    notes: '',
    team: '',
  });
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Calculate date range for view
  const startDate =
    viewMode === 'day' ? selectedDate : startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday as week start

  const endDate = viewMode === 'day' ? selectedDate : endOfWeek(selectedDate, { weekStartsOn: 1 }); // Sunday as week end

  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

  // Format dates for queries
  const formattedStartDate = format(startDate, 'yyyy-MM-dd');
  const formattedEndDate = format(endDate, 'yyyy-MM-dd');

  // Fetch salespeople
  const { data: salespeople = [], isLoading: isSalesPeopleLoading } = useSupabaseQuery<
    SalesPerson[]
  >(['salespeople'], async () => {
    return await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, profile_image_url, team')
      .eq('role', 'sales');
  });

  // Fetch schedules
  const {
    data: schedules = [],
    isLoading: isSchedulesLoading,
    refetch: refetchSchedules,
  } = useSupabaseQuery<Schedule[]>(
    ['schedules', formattedStartDate, formattedEndDate],
    async () => {
      return await supabase
        .from('schedules')
        .select(
          `
          id, 
          salesperson_id, 
          date, 
          shift_start, 
          shift_end, 
          notes,
          team,
          salesperson:profiles(first_name, last_name, profile_image_url)
        `
        )
        .gte('date', formattedStartDate)
        .lte('date', formattedEndDate)
        .order('date');
    }
  );

  // Create schedule mutation
  const createScheduleMutation = useSupabaseMutation<{ id: string }, Omit<ScheduleFormData, 'id'>>(
    async scheduleData => {
      return await supabase.from('schedules').insert(scheduleData).select();
    },
    {
      onSuccess: () => {
        toast({
          title: 'Schedule Created',
          description: 'The schedule has been successfully created.',
        });
        queryClient.invalidateQueries(['schedules']);
        setIsDialogOpen(false);
        resetForm();
      },
    }
  );

  // Update schedule mutation
  const updateScheduleMutation = useSupabaseMutation<{ id: string }, ScheduleFormData>(
    async scheduleData => {
      const { id, ...updateData } = scheduleData;
      return await supabase.from('schedules').update(updateData).eq('id', id).select();
    },
    {
      onSuccess: () => {
        toast({
          title: 'Schedule Updated',
          description: 'The schedule has been successfully updated.',
        });
        queryClient.invalidateQueries(['schedules']);
        setIsDialogOpen(false);
        resetForm();
      },
    }
  );

  // Delete schedule mutation
  const deleteScheduleMutation = useSupabaseMutation<{ success: boolean }, { id: string }>(
    async ({ id }) => {
      return await supabase.from('schedules').delete().eq('id', id);
    },
    {
      onSuccess: () => {
        toast({
          title: 'Schedule Deleted',
          description: 'The schedule has been successfully deleted.',
        });
        queryClient.invalidateQueries(['schedules']);
      },
    }
  );

  // Reset form data
  const resetForm = () => {
    setFormData({
      salesperson_id: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      shift_start: '09:00',
      shift_end: '17:00',
      notes: '',
      team: '',
    });
    setEditMode('create');
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode === 'create') {
      const { id, ...createData } = formData;
      createScheduleMutation.mutate(createData);
    } else {
      updateScheduleMutation.mutate(formData);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: keyof ScheduleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle shift template selection
  const handleShiftTemplateChange = (templateId: string) => {
    const template = SHIFT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        shift_start: template.start,
        shift_end: template.end,
      }));
    }
  };

  // Edit a schedule
  const handleEditSchedule = (schedule: Schedule) => {
    setFormData({
      id: schedule.id,
      salesperson_id: schedule.salesperson_id,
      date: schedule.date,
      shift_start: schedule.shift_start,
      shift_end: schedule.shift_end,
      notes: schedule.notes || '',
      team: schedule.team || '',
    });
    setEditMode('edit');
    setIsDialogOpen(true);
  };

  // Delete a schedule
  const handleDeleteSchedule = (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      deleteScheduleMutation.mutate({ id });
    }
  };

  // Get schedules for a specific date
  const getSchedulesForDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return schedules.filter(schedule => schedule.date === formattedDate);
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get initials from name
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  // Get team badge
  const getTeamBadge = (teamId?: string) => {
    if (!teamId) return null;

    const colorMap: Record<string, string> = {
      red: 'bg-red-100 text-red-700',
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      flex: 'bg-purple-100 text-purple-700',
    };

    const team = TEAMS.find(t => t.id === teamId);
    return (
      <Badge variant="outline" className={colorMap[teamId] || ''}>
        {team?.name || teamId}
      </Badge>
    );
  };

  // Loading state
  const isLoading = isSalesPeopleLoading || isSchedulesLoading;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Schedule Management</CardTitle>
              <CardDescription>Manage your sales team schedules</CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Tabs value={viewMode} onValueChange={(v: 'day' | 'week') => setViewMode(v)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="day">Day View</TabsTrigger>
                  <TabsTrigger value="week">Week View</TabsTrigger>
                </TabsList>
              </Tabs>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[240px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={date => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      resetForm();
                      setEditMode('create');
                      // Set date to currently selected date
                      setFormData(prev => ({
                        ...prev,
                        date: format(selectedDate, 'yyyy-MM-dd'),
                      }));
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Schedule
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editMode === 'create' ? 'Create New Schedule' : 'Edit Schedule'}
                    </DialogTitle>
                    <DialogDescription>
                      {editMode === 'create'
                        ? 'Add a new schedule for a salesperson.'
                        : 'Update the selected schedule.'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="salesperson">Salesperson</Label>
                        <Select
                          value={formData.salesperson_id}
                          onValueChange={value => handleInputChange('salesperson_id', value)}
                          disabled={
                            createScheduleMutation.isLoading || updateScheduleMutation.isLoading
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a salesperson" />
                          </SelectTrigger>
                          <SelectContent>
                            {salespeople.map(person => (
                              <SelectItem key={person.id} value={person.id}>
                                {person.first_name} {person.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                              disabled={
                                createScheduleMutation.isLoading || updateScheduleMutation.isLoading
                              }
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.date
                                ? format(parseISO(formData.date), 'PPP')
                                : 'Select a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.date ? parseISO(formData.date) : undefined}
                              onSelect={date =>
                                date && handleInputChange('date', format(date, 'yyyy-MM-dd'))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="shift_template">Shift Template (Optional)</Label>
                        <Select
                          onValueChange={handleShiftTemplateChange}
                          disabled={
                            createScheduleMutation.isLoading || updateScheduleMutation.isLoading
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a template" />
                          </SelectTrigger>
                          <SelectContent>
                            {SHIFT_TEMPLATES.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="shift_start">Shift Start</Label>
                          <Input
                            id="shift_start"
                            type="time"
                            value={formData.shift_start}
                            onChange={e => handleInputChange('shift_start', e.target.value)}
                            disabled={
                              createScheduleMutation.isLoading || updateScheduleMutation.isLoading
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="shift_end">Shift End</Label>
                          <Input
                            id="shift_end"
                            type="time"
                            value={formData.shift_end}
                            onChange={e => handleInputChange('shift_end', e.target.value)}
                            disabled={
                              createScheduleMutation.isLoading || updateScheduleMutation.isLoading
                            }
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="team">Team Assignment</Label>
                        <Select
                          value={formData.team}
                          onValueChange={value => handleInputChange('team', value)}
                          disabled={
                            createScheduleMutation.isLoading || updateScheduleMutation.isLoading
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a team" />
                          </SelectTrigger>
                          <SelectContent>
                            {TEAMS.map(team => (
                              <SelectItem key={team.id} value={team.id}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                          id="notes"
                          value={formData.notes}
                          onChange={e => handleInputChange('notes', e.target.value)}
                          placeholder="Special instructions or notes"
                          disabled={
                            createScheduleMutation.isLoading || updateScheduleMutation.isLoading
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        disabled={
                          !formData.salesperson_id ||
                          !formData.date ||
                          !formData.shift_start ||
                          !formData.shift_end ||
                          createScheduleMutation.isLoading ||
                          updateScheduleMutation.isLoading
                        }
                      >
                        {createScheduleMutation.isLoading || updateScheduleMutation.isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            {editMode === 'create' ? 'Create Schedule' : 'Update Schedule'}
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="h-[400px] w-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div>
              {viewMode === 'day' ? (
                // Day view
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h3>

                  {getSchedulesForDate(selectedDate).length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="mx-auto h-12 w-12 opacity-20 mb-2" />
                      <p>No schedules for this day.</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                          resetForm();
                          setEditMode('create');
                          setFormData(prev => ({
                            ...prev,
                            date: format(selectedDate, 'yyyy-MM-dd'),
                          }));
                          setIsDialogOpen(true);
                        }}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Schedule
                      </Button>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Salesperson</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead>Shift Time</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getSchedulesForDate(selectedDate).map(schedule => (
                          <TableRow key={schedule.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage src={schedule.salesperson?.profile_image_url} />
                                  <AvatarFallback>
                                    {getInitials(
                                      schedule.salesperson?.first_name || '',
                                      schedule.salesperson?.last_name || ''
                                    )}
                                  </AvatarFallback>
                                </Avatar>
                                <span>
                                  {schedule.salesperson?.first_name}{' '}
                                  {schedule.salesperson?.last_name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{getTeamBadge(schedule.team)}</TableCell>
                            <TableCell>
                              {formatTime(schedule.shift_start)} - {formatTime(schedule.shift_end)}
                            </TableCell>
                            <TableCell>{schedule.notes || '-'}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditSchedule(schedule)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              ) : (
                // Week view
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Week of {format(startDate, 'MMMM d')} - {format(endDate, 'MMMM d, yyyy')}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {dateRange.map(date => (
                      <Card
                        key={date.toString()}
                        className={isSameDay(date, new Date()) ? 'border-primary' : ''}
                      >
                        <CardHeader className="p-3">
                          <CardTitle className="text-sm font-medium">
                            {format(date, 'EEE')}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {format(date, 'MMM d')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                          {getSchedulesForDate(date).length === 0 ? (
                            <div className="text-center py-4 text-xs text-muted-foreground">
                              No shifts
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {getSchedulesForDate(date).map(schedule => (
                                <div
                                  key={schedule.id}
                                  className="text-xs p-2 rounded border bg-background relative group"
                                >
                                  <div className="font-medium">
                                    {schedule.salesperson?.first_name}{' '}
                                    {schedule.salesperson?.last_name}
                                  </div>
                                  <div className="text-muted-foreground mt-1">
                                    {formatTime(schedule.shift_start)} -{' '}
                                    {formatTime(schedule.shift_end)}
                                  </div>
                                  {schedule.team && (
                                    <div className="mt-1">{getTeamBadge(schedule.team)}</div>
                                  )}
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => handleEditSchedule(schedule)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="p-2 pt-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs h-7"
                            onClick={() => {
                              resetForm();
                              setEditMode('create');
                              setFormData(prev => ({
                                ...prev,
                                date: format(date, 'yyyy-MM-dd'),
                              }));
                              setIsDialogOpen(true);
                            }}
                          >
                            <PlusCircle className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
