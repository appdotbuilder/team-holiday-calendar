import { db } from '../db';
import { holidaysTable, teamMembersTable } from '../db/schema';
import { type GetHolidaysForWeekInput, type HolidayWithTeamMember } from '../schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export const getHolidaysForWeek = async (input: GetHolidaysForWeekInput): Promise<HolidayWithTeamMember[]> => {
  try {
    // Parse the start date and calculate the end date (6 days later)
    const startDate = new Date(input.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    // Query holidays with team member details for the specified week
    const results = await db.select()
      .from(holidaysTable)
      .innerJoin(teamMembersTable, eq(holidaysTable.team_member_id, teamMembersTable.id))
      .where(
        and(
          gte(holidaysTable.holiday_date, startDate.toISOString().split('T')[0]), // Convert to YYYY-MM-DD format
          lte(holidaysTable.holiday_date, endDate.toISOString().split('T')[0])    // Convert to YYYY-MM-DD format
        )
      )
      .execute();

    // Transform the joined results to match HolidayWithTeamMember schema
    return results.map(result => ({
      id: result.holidays.id,
      team_member_id: result.holidays.team_member_id,
      holiday_date: new Date(result.holidays.holiday_date),
      created_at: result.holidays.created_at,
      team_member: {
        id: result.team_members.id,
        name: result.team_members.name,
        created_at: result.team_members.created_at
      }
    }));
  } catch (error) {
    console.error('Failed to get holidays for week:', error);
    throw error;
  }
};