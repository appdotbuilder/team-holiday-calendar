import { db } from '../db';
import { holidaysTable, teamMembersTable } from '../db/schema';
import { type CreateHolidayInput, type Holiday } from '../schema';
import { eq } from 'drizzle-orm';

export const createHoliday = async (input: CreateHolidayInput): Promise<Holiday> => {
  try {
    // First, verify that the team member exists
    const teamMember = await db.select()
      .from(teamMembersTable)
      .where(eq(teamMembersTable.id, input.team_member_id))
      .execute();

    if (teamMember.length === 0) {
      throw new Error(`Team member with ID ${input.team_member_id} not found`);
    }

    // Insert holiday record
    const result = await db.insert(holidaysTable)
      .values({
        team_member_id: input.team_member_id,
        holiday_date: input.holiday_date // Date string will be handled by Drizzle
      })
      .returning()
      .execute();

    // Return the created holiday
    const holiday = result[0];
    return {
      ...holiday,
      holiday_date: new Date(holiday.holiday_date) // Ensure date is converted to Date object
    };
  } catch (error) {
    console.error('Holiday creation failed:', error);
    throw error;
  }
};