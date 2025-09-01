import { db } from '../db';
import { teamMembersTable } from '../db/schema';
import { type TeamMember } from '../schema';

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const results = await db.select()
      .from(teamMembersTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    throw error;
  }
};