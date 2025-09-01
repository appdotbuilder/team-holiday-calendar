import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { teamMembersTable } from '../db/schema';
import { type CreateTeamMemberInput } from '../schema';
import { createTeamMember } from '../handlers/create_team_member';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateTeamMemberInput = {
  name: 'John Doe'
};

describe('createTeamMember', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a team member', async () => {
    const result = await createTeamMember(testInput);

    // Basic field validation
    expect(result.name).toEqual('John Doe');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.id).toBeGreaterThan(0);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save team member to database', async () => {
    const result = await createTeamMember(testInput);

    // Query using proper drizzle syntax
    const teamMembers = await db.select()
      .from(teamMembersTable)
      .where(eq(teamMembersTable.id, result.id))
      .execute();

    expect(teamMembers).toHaveLength(1);
    expect(teamMembers[0].name).toEqual('John Doe');
    expect(teamMembers[0].id).toEqual(result.id);
    expect(teamMembers[0].created_at).toBeInstanceOf(Date);
  });

  it('should create team member with different names', async () => {
    const input1: CreateTeamMemberInput = { name: 'Alice Smith' };
    const input2: CreateTeamMemberInput = { name: 'Bob Johnson' };

    const result1 = await createTeamMember(input1);
    const result2 = await createTeamMember(input2);

    // Verify both team members were created with different IDs
    expect(result1.name).toEqual('Alice Smith');
    expect(result2.name).toEqual('Bob Johnson');
    expect(result1.id).not.toEqual(result2.id);

    // Verify both are in the database
    const allTeamMembers = await db.select()
      .from(teamMembersTable)
      .execute();

    expect(allTeamMembers).toHaveLength(2);
    const names = allTeamMembers.map(tm => tm.name);
    expect(names).toContain('Alice Smith');
    expect(names).toContain('Bob Johnson');
  });

  it('should handle long team member names', async () => {
    const longNameInput: CreateTeamMemberInput = {
      name: 'This is a very long team member name that tests the system limits'
    };

    const result = await createTeamMember(longNameInput);

    expect(result.name).toEqual(longNameInput.name);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);

    // Verify it was saved correctly
    const teamMember = await db.select()
      .from(teamMembersTable)
      .where(eq(teamMembersTable.id, result.id))
      .execute();

    expect(teamMember[0].name).toEqual(longNameInput.name);
  });

  it('should create team members with unique auto-incremented IDs', async () => {
    const members = await Promise.all([
      createTeamMember({ name: 'Member 1' }),
      createTeamMember({ name: 'Member 2' }),
      createTeamMember({ name: 'Member 3' })
    ]);

    // Verify all IDs are unique
    const ids = members.map(member => member.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toEqual(3);

    // Verify IDs are sequential (auto-increment behavior)
    ids.sort((a, b) => a - b);
    expect(ids[1]).toEqual(ids[0] + 1);
    expect(ids[2]).toEqual(ids[1] + 1);
  });
});