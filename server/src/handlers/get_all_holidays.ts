import { db } from '../db';
import { holidaysTable, teamMembersTable } from '../db/schema';
import { type HolidayWithTeamMember } from '../schema';
import { eq } from 'drizzle-orm';

export const getAllHolidays = async (): Promise<HolidayWithTeamMember[]> => {
  try {
    // Query holidays with team member details using inner join
    const results = await db.select()
      .from(holidaysTable)
      .innerJoin(teamMembersTable, eq(holidaysTable.team_member_id, teamMembersTable.id))
      .execute();

    // Transform the joined results to match HolidayWithTeamMember schema
    return results.map(result => ({
      id: result.holidays.id,
      team_member_id: result.holidays.team_member_id,
      holiday_date: new Date(result.holidays.holiday_date), // Convert string date to Date object
      created_at: result.holidays.created_at,
      team_member: {
        id: result.team_members.id,
        name: result.team_members.name,
        created_at: result.team_members.created_at
      }
    }));
  } catch (error) {
    console.error('Failed to fetch holidays:', error);
    throw error;
  }
};