import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

type ScheduleEntry = {
  id: string;
  start_time: string;
  end_time: string;
};

type ScheduleTabsProps = {
  schedule: ScheduleEntry[];
};

function ScheduleTable({ schedule }: { schedule: ScheduleEntry[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Start</TableHead>
          <TableHead>End</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedule.map((s) => (
          <TableRow key={s.id}>
            <TableCell>{new Date(s.start_time).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(s.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
            <TableCell>{new Date(s.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export const ScheduleTabs: React.FC<ScheduleTabsProps> = ({ schedule }) => (
  <Tabs defaultValue="3day" className="w-full">
    <TabsList>
      <TabsTrigger value="3day">3-Day</TabsTrigger>
      <TabsTrigger value="week">Week</TabsTrigger>
      <TabsTrigger value="month">Month</TabsTrigger>
    </TabsList>
    <TabsContent value="3day">
      <ScheduleTable schedule={schedule.slice(0, 3)} />
    </TabsContent>
    <TabsContent value="week">
      <ScheduleTable schedule={schedule.slice(0, 7)} />
    </TabsContent>
    <TabsContent value="month">
      <ScheduleTable schedule={schedule.slice(0, 31)} />
    </TabsContent>
  </Tabs>
); 