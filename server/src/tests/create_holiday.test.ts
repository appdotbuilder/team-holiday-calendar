import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { holidaysTable, teamMembersTable } from '../db/schema';
import { type CreateHolidayInput } from '../schema';
import { createHoliday } from '../handlers/create_holiday';
import { eq } from 'drizzle-orm';

describe('createHoliday', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testTeamMemberId: number;

  beforeEach(async () => {
    // Create a test team member for our holiday tests
    const teamMemberResult = await db.insert(teamMembersTable)
      .values({
        name: 'Test Team Member'
      })
      .returning()
      .execute();
    
    testTeamMemberId = teamMemberResult[0].id;
  });

  it('should create a holiday successfully', async () => {
    const testInput: CreateHolidayInput = {
      team_member_id: testTeamMemberId,
      holiday_date: '2024-12-25' // Christmas
    };

    const result = await createHoliday(testInput);

    // Basic field validation
    expect(result.team_member_id).toEqual(testTeamMemberId);
    expect(result.holiday_date).toBeInstanceOf(Date);
    expect(result.holiday_date.toISOString().slice(0, 10)).toEqual('2024-12-25');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save holiday to database', async () => {
    const testInput: CreateHolidayInput = {
      team_member_id: testTeamMemberId,
      holiday_date: '2024-07-04' // Independence Day
    };

    const result = await createHoliday(testInput);

    // Query the database to verify the holiday was saved
    const holidays = await db.select()
      .from(holidaysTable)
      .where(eq(holidaysTable.id, result.id))
      .execute();

    expect(holidays).toHaveLength(1);
    expect(holidays[0].team_member_id).toEqual(testTeamMemberId);
    expect(holidays[0].holiday_date).toEqual('2024-07-04');
    expect(holidays[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different date formats correctly', async () => {
    const testInput: CreateHolidayInput = {
      team_member_id: testTeamMemberId,
      holiday_date: '2024-01-01' // New Year's Day
    };

    const result = await createHoliday(testInput);

    expect(result.holiday_date).toBeInstanceOf(Date);
    expect(result.holiday_date.getFullYear()).toBe(2024);
    expect(result.holiday_date.getMonth()).toBe(0); // January is 0
    expect(result.holiday_date.getDate()).toBe(1);
  });

  it('should throw error for non-existent team member', async () => {
    const testInput: CreateHolidayInput = {
      team_member_id: 99999, // Non-existent ID
      holiday_date: '2024-12-25'
    };

    await expect(createHoliday(testInput)).rejects.toThrow(/team member.*not found/i);
  });

  it('should validate foreign key relationship', async () => {
    const testInput: CreateHolidayInput = {
      team_member_id: testTeamMemberId,
      holiday_date: '2024-11-28' // Thanksgiving
    };

    const result = await createHoliday(testInput);

    // Verify the foreign key relationship works
    const holidayWithTeamMember = await db.select({
      holidayId: holidaysTable.id,
      teamMemberName: teamMembersTable.name,
      holidayDate: holidaysTable.holiday_date
    })
      .from(holidaysTable)
      .innerJoin(teamMembersTable, eq(holidaysTable.team_member_id, teamMembersTable.id))
      .where(eq(holidaysTable.id, result.id))
      .execute();

    expect(holidayWithTeamMember).toHaveLength(1);
    expect(holidayWithTeamMember[0].teamMemberName).toEqual('Test Team Member');
    expect(holidayWithTeamMember[0].holidayDate).toEqual('2024-11-28');
  });

  it('should allow multiple holidays for same team member', async () => {
    const holiday1Input: CreateHolidayInput = {
      team_member_id: testTeamMemberId,
      holiday_date: '2024-12-25'
    };

    const holiday2Input: CreateHolidayInput = {
      team_member_id: testTeamMemberId,
      holiday_date: '2024-12-26'
    };

    const result1 = await createHoliday(holiday1Input);
    const result2 = await createHoliday(holiday2Input);

    expect(result1.id).not.toEqual(result2.id);
    expect(result1.team_member_id).toEqual(result2.team_member_id);

    // Verify both holidays exist in database
    const holidays = await db.select()
      .from(holidaysTable)
      .where(eq(holidaysTable.team_member_id, testTeamMemberId))
      .execute();

    expect(holidays).toHaveLength(2);
  });
});