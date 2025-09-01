import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Plane, User } from 'lucide-react';
import { CalendarSkeleton } from './CalendarSkeleton';
import type { TeamMember, HolidayWithTeamMember } from '../../../server/src/schema';

interface WeeklyCalendarProps {
  teamMembers: TeamMember[];
  holidays: HolidayWithTeamMember[];
  weekStartDate: Date;
  isLoading: boolean;
}

export function WeeklyCalendar({ 
  teamMembers, 
  holidays, 
  weekStartDate, 
  isLoading 
}: WeeklyCalendarProps) {
  // Generate week days from start date
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStartDate);
      date.setDate(date.getDate() + index);
      return date;
    });
  }, [weekStartDate]);

  // Create a map of holidays by date and team member for quick lookup
  const holidayMap = useMemo(() => {
    const map = new Map<string, Set<number>>();
    
    holidays.forEach((holiday: HolidayWithTeamMember) => {
      const dateKey = holiday.holiday_date.toISOString().split('T')[0];
      if (!map.has(dateKey)) {
        map.set(dateKey, new Set());
      }
      map.get(dateKey)?.add(holiday.team_member_id);
    });
    
    return map;
  }, [holidays]);

  // Check if a team member has a holiday on a specific date
  const hasHoliday = (teamMemberId: number, date: Date): boolean => {
    const dateKey = date.toISOString().split('T')[0];
    return holidayMap.get(dateKey)?.has(teamMemberId) || false;
  };

  // Format day header
  const formatDayHeader = (date: Date): string => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = date.getDate();
    return `${dayName} ${dayNumber}`;
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is weekend
  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="w-full overflow-x-auto calendar-scroll">
      <div className="min-w-[800px] lg:min-w-full">
        {/* Header row with days */}
        <div className="grid grid-cols-8 gap-2 mb-4" role="row" aria-label="Calendar header">
          <div className="p-4 font-semibold text-gray-700 bg-gray-50 rounded-lg border" role="columnheader">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Team Member
            </div>
          </div>
          {weekDays.map((date: Date, index: number) => (
            <div
              key={index}
              role="columnheader"
              aria-label={`${formatDayHeader(date)}${isToday(date) ? ' (Today)' : ''}`}
              className={`p-4 text-center font-medium rounded-lg border transition-all duration-200 ${
                isToday(date)
                  ? 'today-gradient text-white shadow-md'
                  : isWeekend(date)
                  ? 'weekend-gradient text-purple-700 border-purple-200'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="text-sm font-semibold">
                {formatDayHeader(date)}
              </div>
              {isToday(date) && (
                <Badge variant="secondary" className="mt-1 text-xs today-badge">
                  Today
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Team member rows */}
        <div className="space-y-2" role="grid" aria-label="Holiday calendar grid">
          {teamMembers.map((member: TeamMember) => (
            <div key={member.id} className="grid grid-cols-8 gap-2" role="row" aria-label={`Holiday schedule for ${member.name}`}>
              {/* Team member name cell */}
              <div className="p-4 bg-gradient-to-r from-white to-gray-50 border rounded-lg shadow-sm calendar-cell-hover">
                <div className="font-medium text-gray-800 truncate" title={member.name}>
                  {member.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ID: {member.id}
                </div>
              </div>

              {/* Day cells */}
              {weekDays.map((date: Date, dayIndex: number) => {
                const onHoliday = hasHoliday(member.id, date);
                
                return (
                  <div
                    key={dayIndex}
                    className={`p-4 border rounded-lg transition-all duration-200 min-h-[80px] flex items-center justify-center calendar-cell-hover ${
                      onHoliday
                        ? 'holiday-gradient border-orange-300 shadow-md'
                        : isWeekend(date)
                        ? 'bg-purple-50 border-purple-100'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {onHoliday && (
                      <div className="flex flex-col items-center gap-1">
                        <Plane className="w-6 h-6 text-orange-600" />
                        <Badge 
                          variant="secondary" 
                          className="text-xs holiday-badge"
                        >
                          🏖️ Holiday
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Summary row */}
        {teamMembers.length > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Holiday Summary</span>
              </div>
              <div className="flex items-center gap-4">
                <span>
                  Total holidays this week: {' '}
                  <Badge variant="outline" className="ml-1">
                    {holidays.length}
                  </Badge>
                </span>
                <span>
                  Team members: {' '}
                  <Badge variant="outline" className="ml-1">
                    {teamMembers.length}
                  </Badge>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}