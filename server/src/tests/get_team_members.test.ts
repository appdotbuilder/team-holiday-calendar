import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { teamMembersTable } from '../db/schema';
import { getTeamMembers } from '../handlers/get_team_members';

describe('getTeamMembers', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no team members exist', async () => {
    const result = await getTeamMembers();

    expect(result).toEqual([]);
  });

  it('should return all team members', async () => {
    // Create test team members
    await db.insert(teamMembersTable)
      .values([
        { name: 'Alice Johnson' },
        { name: 'Bob Smith' },
        { name: 'Carol Williams' }
      ])
      .execute();

    const result = await getTeamMembers();

    expect(result).toHaveLength(3);
    
    // Check that all team members are returned
    const names = result.map(member => member.name).sort();
    expect(names).toEqual(['Alice Johnson', 'Bob Smith', 'Carol Williams']);

    // Verify structure of returned objects
    result.forEach(member => {
      expect(member.id).toBeDefined();
      expect(typeof member.id).toBe('number');
      expect(member.name).toBeDefined();
      expect(typeof member.name).toBe('string');
      expect(member.created_at).toBeInstanceOf(Date);
    });
  });

  it('should return team members in database order', async () => {
    // Create team members in specific order
    const firstMember = await db.insert(teamMembersTable)
      .values({ name: 'First Member' })
      .returning()
      .execute();

    const secondMember = await db.insert(teamMembersTable)
      .values({ name: 'Second Member' })
      .returning()
      .execute();

    const result = await getTeamMembers();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBeLessThan(result[1].id);
    expect(result[0].name).toBe('First Member');
    expect(result[1].name).toBe('Second Member');
  });

  it('should handle single team member', async () => {
    // Create single team member
    await db.insert(teamMembersTable)
      .values({ name: 'Solo Member' })
      .execute();

    const result = await getTeamMembers();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Solo Member');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should preserve all database fields', async () => {
    // Create team member and verify all fields are preserved
    const insertResult = await db.insert(teamMembersTable)
      .values({ name: 'Test Member' })
      .returning()
      .execute();

    const result = await getTeamMembers();

    expect(result).toHaveLength(1);
    const member = result[0];
    const originalMember = insertResult[0];

    expect(member.id).toBe(originalMember.id);
    expect(member.name).toBe(originalMember.name);
    expect(member.created_at).toEqual(originalMember.created_at);
  });
});