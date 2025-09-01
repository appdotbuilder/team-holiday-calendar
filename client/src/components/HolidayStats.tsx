import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Plane, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import type { TeamMember, HolidayWithTeamMember } from '../../../server/src/schema';

interface HolidayStatsProps {
  teamMembers: TeamMember[];
  holidays: HolidayWithTeamMember[];
  weekStartDate: Date;
}

export function HolidayStats({ teamMembers, holidays, weekStartDate }: HolidayStatsProps) {
  const stats = useMemo(() => {
    const holidaysByDay = new Map<string, number>();
    const memberHolidayCounts = new Map<number, number>();

    holidays.forEach((holiday: HolidayWithTeamMember) => {
      const dateKey = holiday.holiday_date.toISOString().split('T')[0];
      holidaysByDay.set(dateKey, (holidaysByDay.get(dateKey) || 0) + 1);
      
      memberHolidayCounts.set(
        holiday.team_member_id, 
        (memberHolidayCounts.get(holiday.team_member_id) || 0) + 1
      );
    });

    const busiestDay = Array.from(holidaysByDay.entries())
      .sort(([, a], [, b]) => b - a)[0];

    const memberWithMostHolidays = Array.from(memberHolidayCounts.entries())
      .sort(([, a], [, b]) => b - a)[0];

    return {
      totalHolidays: holidays.length,
      totalTeamMembers: teamMembers.length,
      busiestDay: busiestDay ? {
        date: new Date(busiestDay[0]),
        count: busiestDay[1]
      } : null,
      memberWithMostHolidays: memberWithMostHolidays ? {
        member: teamMembers.find(m => m.id === memberWithMostHolidays[0]),
        count: memberWithMostHolidays[1]
      } : null,
      holidaysByDay: holidaysByDay,
      averageHolidaysPerMember: teamMembers.length > 0 ? holidays.length / teamMembers.length : 0
    };
  }, [teamMembers, holidays, weekStartDate]);

  if (teamMembers.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Holidays</p>
              <p className="text-2xl font-bold text-blue-800">{stats.totalHolidays}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Team Members</p>
              <p className="text-2xl font-bold text-green-800">{stats.totalTeamMembers}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-orange-200 bg-orange-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-orange-600 font-medium">Busiest Day</p>
              {stats.busiestDay ? (
                <>
                  <p className="text-lg font-bold text-orange-800">
                    {stats.busiestDay.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <Badge variant="secondary" className="mt-1 text-xs bg-orange-200 text-orange-700">
                    {stats.busiestDay.count} holidays
                  </Badge>
                </>
              ) : (
                <p className="text-lg font-bold text-orange-800">N/A</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">Average per Member</p>
              <p className="text-2xl font-bold text-purple-800">
                {stats.averageHolidaysPerMember.toFixed(1)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}