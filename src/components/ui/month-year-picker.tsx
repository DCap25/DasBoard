import React, { useState } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';

interface MonthYearPickerProps {
  selectedMonth: string;
  onMonthChange: (monthKey: string) => void;
  availableMonths: string[];
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  selectedMonth,
  onMonthChange,
  availableMonths,
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customYear, setCustomYear] = useState(new Date().getFullYear());
  const [customMonth, setCustomMonth] = useState(new Date().getMonth() + 1);

  const formatMonthDisplay = (monthKey: string): string => {
    if (monthKey === 'this-month') return 'This Month';
    if (monthKey === 'last-month') return 'Last Month';
    if (monthKey === 'last-quarter') return 'Last Quarter';
    if (monthKey === 'ytd') return 'Year to Date';
    if (monthKey === 'last-year') return 'Last Year';
    if (monthKey === 'custom') return 'Custom';

    // Parse YYYY-MM format
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const handleCustomDateSubmit = () => {
    const monthKey = `${customYear}-${String(customMonth).padStart(2, '0')}`;
    onMonthChange(monthKey);
    setIsCustomMode(false);
  };

  const months = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="relative">
      <select
        value={selectedMonth}
        onChange={e => {
          if (e.target.value === 'custom') {
            setIsCustomMode(true);
          } else {
            setIsCustomMode(false);
            onMonthChange(e.target.value);
          }
        }}
        className="appearance-none bg-white border border-gray-200 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
      >
        <option value="this-month">This Month</option>
        <option value="last-month">Last Month</option>
        <option value="last-quarter">Last Quarter</option>
        <option value="ytd">Year to Date</option>
        <option value="last-year">Last Year</option>

        {availableMonths.length > 0 && (
          <optgroup label="Archived Months">
            {availableMonths.map(month => (
              <option key={month} value={month}>
                {formatMonthDisplay(month)}
              </option>
            ))}
          </optgroup>
        )}

        <option value="custom">Custom</option>
      </select>

      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />

      {isCustomMode && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-50 min-w-[280px]">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-sm">Select Custom Date</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
              <select
                value={customMonth}
                onChange={e => setCustomMonth(parseInt(e.target.value))}
                className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
              <select
                value={customYear}
                onChange={e => setCustomYear(parseInt(e.target.value))}
                className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCustomDateSubmit}
              className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              Apply
            </button>
            <button
              onClick={() => setIsCustomMode(false)}
              className="flex-1 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthYearPicker;
