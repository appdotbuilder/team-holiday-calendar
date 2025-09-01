import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar, Users } from 'lucide-react';
import { WeeklyCalendar } from '@/components/WeeklyCalendar';
import { SampleDataNotice } from '@/components/SampleDataNotice';
import { EmptyState } from '@/components/EmptyState';
import { KeyboardHints } from '@/components/KeyboardHints';
import { HolidayStats } from '@/components/HolidayStats';
import { trpc } from '@/utils/trpc';
import type { TeamMember, HolidayWithTeamMember } from '../../server/src/schema';

function App() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [holidays, setHolidays] = useState<HolidayWithTeamMember[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getStartOfWeek(new Date()));
  const [isLoading, setIsLoading] = useState(false);

  // Get start of week (Monday)
  function getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  // Load team members
  const loadTeamMembers = useCallback(async () => {
    try {
      const result = await trpc.getTeamMembers.query();
      setTeamMembers(result);
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  }, []);

  // Load holidays for the current week
  const loadHolidaysForWeek = useCallback(async (startDate: Date) => {
    setIsLoading(true);
    try {
      const result = await trpc.getHolidaysForWeek.query({
        startDate: startDate.toISOString().split('T')[0]
      });
      setHolidays(result);
    } catch (error) {
      console.error('Failed to load holidays:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on component mount and when week changes
  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  useEffect(() => {
    loadHolidaysForWeek(currentWeekStart);
  }, [currentWeekStart, loadHolidaysForWeek]);

  // Navigate to previous week
  const goToPreviousWeek = useCallback(() => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
  }, [currentWeekStart]);

  // Navigate to next week
  const goToNextWeek = useCallback(() => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(newWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
  }, [currentWeekStart]);

  // Navigate to current week
  const goToCurrentWeek = useCallback(() => {
    setCurrentWeekStart(getStartOfWeek(new Date()));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't interfere with form inputs
      }
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPreviousWeek();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNextWeek();
          break;
        case 't':
        case 'T':
          e.preventDefault();
          goToCurrentWeek();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToPreviousWeek, goToNextWeek, goToCurrentWeek]);

  // Format week range for display
  const formatWeekRange = (startDate: Date): string => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: startDate.getMonth() !== endDate.getMonth() || 
            startDate.getFullYear() !== endDate.getFullYear() ? 'numeric' : undefined
    };
    
    return `${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Team Holiday Calendar</h1>
          </div>
          <p className="text-gray-600 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Track your team's holiday schedule at a glance
          </p>
        </div>

        {/* Sample Data Notice */}
        <SampleDataNotice />

        {/* Week Navigation */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-700">
                📅 {formatWeekRange(currentWeekStart)}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToPreviousWeek}
                  className="hover:bg-blue-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToCurrentWeek}
                  className="hover:bg-blue-50"
                >
                  Today
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={goToNextWeek}
                  className="hover:bg-blue-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Holiday Statistics */}
        {teamMembers.length > 0 && (
          <HolidayStats
            teamMembers={teamMembers}
            holidays={holidays}
            weekStartDate={currentWeekStart}
          />
        )}

        {/* Calendar */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            {teamMembers.length === 0 ? (
              <EmptyState />
            ) : (
              <WeeklyCalendar
                teamMembers={teamMembers}
                holidays={holidays}
                weekStartDate={currentWeekStart}
                isLoading={isLoading}
              />
            )}
          </CardContent>
        </Card>

        {/* Keyboard Navigation Hints */}
        <KeyboardHints />
      </div>
    </div>
  );
}

export default App;