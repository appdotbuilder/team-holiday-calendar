import { db } from '../db';
import { teamMembersTable } from '../db/schema';
import { type CreateTeamMemberInput, type TeamMember } from '../schema';

export const createTeamMember = async (input: CreateTeamMemberInput): Promise<TeamMember> => {
  try {
    // Insert team member record
    const result = await db.insert(teamMembersTable)
      .values({
        name: input.name
      })
      .returning()
      .execute();

    // Return the created team member
    const teamMember = result[0];
    return teamMember;
  } catch (error) {
    console.error('Team member creation failed:', error);
    throw error;
  }
};