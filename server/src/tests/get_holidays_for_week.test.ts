import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { teamMembersTable, holidaysTable } from '../db/schema';
import { type GetHolidaysForWeekInput } from '../schema';
import { getHolidaysForWeek } from '../handlers/get_holidays_for_week';

describe('getHolidaysForWeek', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return holidays for a specific week', async () => {
    // Create test team members
    const teamMembers = await db.insert(teamMembersTable)
      .values([
        { name: 'Alice Johnson' },
        { name: 'Bob Smith' }
      ])
      .returning()
      .execute();

    const alice = teamMembers[0];
    const bob = teamMembers[1];

    // Create holidays - some within the week, some outside
    await db.insert(holidaysTable)
      .values([
        { team_member_id: alice.id, holiday_date: '2024-01-01' }, // Monday - within week
        { team_member_id: bob.id, holiday_date: '2024-01-03' },   // Wednesday - within week
        { team_member_id: alice.id, holiday_date: '2024-01-07' }, // Sunday - within week
        { team_member_id: bob.id, holiday_date: '2024-01-08' },   // Monday next week - outside
        { team_member_id: alice.id, holiday_date: '2023-12-31' }  // Sunday previous week - outside
      ])
      .execute();

    const input: GetHolidaysForWeekInput = {
      startDate: '2024-01-01' // Monday
    };

    const result = await getHolidaysForWeek(input);

    // Should return 3 holidays within the week (Jan 1, 3, 7)
    expect(result).toHaveLength(3);

    // Verify dates are within the week range
    const holidayDates = result.map(h => h.holiday_date.toISOString().split('T')[0]);
    expect(holidayDates).toContain('2024-01-01');
    expect(holidayDates).toContain('2024-01-03');
    expect(holidayDates).toContain('2024-01-07');
    expect(holidayDates).not.toContain('2024-01-08'); // Outside week
    expect(holidayDates).not.toContain('2023-12-31'); // Outside week

    // Verify team member data is included
    result.forEach(holiday => {
      expect(holiday.team_member).toBeDefined();
      expect(holiday.team_member.id).toBeDefined();
      expect(holiday.team_member.name).toBeDefined();
      expect(['Alice Johnson', 'Bob Smith']).toContain(holiday.team_member.name);
      expect(holiday.team_member.created_at).toBeInstanceOf(Date);
    });

    // Verify holiday fields
    result.forEach(holiday => {
      expect(holiday.id).toBeDefined();
      expect(holiday.team_member_id).toBeDefined();
      expect(holiday.holiday_date).toBeInstanceOf(Date);
      expect(holiday.created_at).toBeInstanceOf(Date);
    });
  });

  it('should return empty array when no holidays exist for the week', async () => {
    // Create a team member but no holidays
    await db.insert(teamMembersTable)
      .values({ name: 'John Doe' })
      .execute();

    const input: GetHolidaysForWeekInput = {
      startDate: '2024-01-01'
    };

    const result = await getHolidaysForWeek(input);

    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should handle week boundaries correctly', async () => {
    // Create test team member
    const teamMember = await db.insert(teamMembersTable)
      .values({ name: 'Jane Doe' })
      .returning()
      .execute();

    // Create holidays on exact week boundaries
    await db.insert(holidaysTable)
      .values([
        { team_member_id: teamMember[0].id, holiday_date: '2024-01-01' }, // Monday (start of week)
        { team_member_id: teamMember[0].id, holiday_date: '2024-01-07' }, // Sunday (end of week)
        { team_member_id: teamMember[0].id, holiday_date: '2023-12-31' }, // Previous Sunday
        { team_member_id: teamMember[0].id, holiday_date: '2024-01-08' }  // Next Monday
      ])
      .execute();

    const input: GetHolidaysForWeekInput = {
      startDate: '2024-01-01'
    };

    const result = await getHolidaysForWeek(input);

    // Should include start and end of week, but not outside boundaries
    expect(result).toHaveLength(2);
    
    const holidayDates = result.map(h => h.holiday_date.toISOString().split('T')[0]);
    expect(holidayDates).toContain('2024-01-01'); // Start boundary - included
    expect(holidayDates).toContain('2024-01-07'); // End boundary - included
    expect(holidayDates).not.toContain('2023-12-31'); // Before start - excluded
    expect(holidayDates).not.toContain('2024-01-08'); // After end - excluded
  });

  it('should handle multiple holidays for same team member in one week', async () => {
    // Create test team member
    const teamMember = await db.insert(teamMembersTable)
      .values({ name: 'Multi Holiday Person' })
      .returning()
      .execute();

    // Create multiple holidays for the same person in the same week
    await db.insert(holidaysTable)
      .values([
        { team_member_id: teamMember[0].id, holiday_date: '2024-01-01' },
        { team_member_id: teamMember[0].id, holiday_date: '2024-01-02' },
        { team_member_id: teamMember[0].id, holiday_date: '2024-01-05' }
      ])
      .execute();

    const input: GetHolidaysForWeekInput = {
      startDate: '2024-01-01'
    };

    const result = await getHolidaysForWeek(input);

    expect(result).toHaveLength(3);

    // All should be for the same team member
    result.forEach(holiday => {
      expect(holiday.team_member.name).toBe('Multi Holiday Person');
      expect(holiday.team_member_id).toBe(teamMember[0].id);
    });

    // Verify all dates are within the week
    const dates = result.map(h => h.holiday_date.toISOString().split('T')[0]);
    expect(dates).toContain('2024-01-01');
    expect(dates).toContain('2024-01-02');
    expect(dates).toContain('2024-01-05');
  });

  it('should handle different week start dates correctly', async () => {
    // Create test team member
    const teamMember = await db.insert(teamMembersTable)
      .values({ name: 'Test Person' })
      .returning()
      .execute();

    // Create holidays across multiple weeks
    await db.insert(holidaysTable)
      .values([
        { team_member_id: teamMember[0].id, holiday_date: '2024-02-05' }, // Week 1
        { team_member_id: teamMember[0].id, holiday_date: '2024-02-12' }, // Week 2
        { team_member_id: teamMember[0].id, holiday_date: '2024-02-19' }  // Week 3
      ])
      .execute();

    // Test different week start dates
    const input1: GetHolidaysForWeekInput = {
      startDate: '2024-02-05' // Monday of week 1
    };

    const input2: GetHolidaysForWeekInput = {
      startDate: '2024-02-12' // Monday of week 2
    };

    const result1 = await getHolidaysForWeek(input1);
    const result2 = await getHolidaysForWeek(input2);

    // Each week should return only its respective holiday
    expect(result1).toHaveLength(1);
    expect(result1[0].holiday_date.toISOString().split('T')[0]).toBe('2024-02-05');

    expect(result2).toHaveLength(1);
    expect(result2[0].holiday_date.toISOString().split('T')[0]).toBe('2024-02-12');
  });
});