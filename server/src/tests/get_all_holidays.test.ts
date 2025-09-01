import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { teamMembersTable, holidaysTable } from '../db/schema';
import { getAllHolidays } from '../handlers/get_all_holidays';

describe('getAllHolidays', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no holidays exist', async () => {
    const result = await getAllHolidays();
    expect(result).toEqual([]);
  });

  it('should return all holidays with team member details', async () => {
    // Create test team members
    const teamMembers = await db.insert(teamMembersTable)
      .values([
        { name: 'John Doe' },
        { name: 'Jane Smith' }
      ])
      .returning()
      .execute();

    const johnId = teamMembers[0].id;
    const janeId = teamMembers[1].id;

    // Create test holidays
    const testDate1 = new Date('2024-01-15');
    const testDate2 = new Date('2024-02-20');
    const testDate3 = new Date('2024-03-25');

    await db.insert(holidaysTable)
      .values([
        { team_member_id: johnId, holiday_date: testDate1.toISOString().split('T')[0] },
        { team_member_id: janeId, holiday_date: testDate2.toISOString().split('T')[0] },
        { team_member_id: johnId, holiday_date: testDate3.toISOString().split('T')[0] }
      ])
      .execute();

    const result = await getAllHolidays();

    expect(result).toHaveLength(3);

    // Verify structure of returned data
    result.forEach(holiday => {
      expect(holiday.id).toBeDefined();
      expect(holiday.team_member_id).toBeDefined();
      expect(holiday.holiday_date).toBeInstanceOf(Date);
      expect(holiday.created_at).toBeInstanceOf(Date);
      
      // Verify team member details are included
      expect(holiday.team_member).toBeDefined();
      expect(holiday.team_member.id).toBeDefined();
      expect(holiday.team_member.name).toBeDefined();
      expect(holiday.team_member.created_at).toBeInstanceOf(Date);
    });

    // Verify specific team member associations
    const johnHolidays = result.filter(h => h.team_member.name === 'John Doe');
    const janeHolidays = result.filter(h => h.team_member.name === 'Jane Smith');

    expect(johnHolidays).toHaveLength(2);
    expect(janeHolidays).toHaveLength(1);

    // Verify correct team member IDs are associated
    johnHolidays.forEach(holiday => {
      expect(holiday.team_member_id).toEqual(johnId);
      expect(holiday.team_member.id).toEqual(johnId);
    });

    janeHolidays.forEach(holiday => {
      expect(holiday.team_member_id).toEqual(janeId);
      expect(holiday.team_member.id).toEqual(janeId);
    });
  });

  it('should handle multiple holidays for same team member', async () => {
    // Create a team member
    const teamMember = await db.insert(teamMembersTable)
      .values({ name: 'Alice Johnson' })
      .returning()
      .execute();

    const aliceId = teamMember[0].id;

    // Create multiple holidays for the same team member
    const dates = ['2024-01-01', '2024-02-14', '2024-03-17', '2024-04-22'];
    await db.insert(holidaysTable)
      .values(dates.map(date => ({
        team_member_id: aliceId,
        holiday_date: date
      })))
      .execute();

    const result = await getAllHolidays();

    expect(result).toHaveLength(4);

    // All holidays should be for Alice
    result.forEach(holiday => {
      expect(holiday.team_member_id).toEqual(aliceId);
      expect(holiday.team_member.name).toEqual('Alice Johnson');
      expect(holiday.team_member.id).toEqual(aliceId);
    });

    // Verify all expected dates are present
    const holidayDates = result.map(h => h.holiday_date.toISOString().split('T')[0]).sort();
    expect(holidayDates).toEqual(dates.sort());
  });

  it('should return holidays in database order', async () => {
    // Create team members
    const teamMembers = await db.insert(teamMembersTable)
      .values([
        { name: 'Team Member 1' },
        { name: 'Team Member 2' }
      ])
      .returning()
      .execute();

    // Insert holidays in specific order
    const holiday1 = await db.insert(holidaysTable)
      .values({ team_member_id: teamMembers[0].id, holiday_date: '2024-01-01' })
      .returning()
      .execute();

    const holiday2 = await db.insert(holidaysTable)
      .values({ team_member_id: teamMembers[1].id, holiday_date: '2024-01-02' })
      .returning()
      .execute();

    const holiday3 = await db.insert(holidaysTable)
      .values({ team_member_id: teamMembers[0].id, holiday_date: '2024-01-03' })
      .returning()
      .execute();

    const result = await getAllHolidays();

    expect(result).toHaveLength(3);

    // Verify the order matches insertion order (database default)
    expect(result[0].id).toEqual(holiday1[0].id);
    expect(result[1].id).toEqual(holiday2[0].id);
    expect(result[2].id).toEqual(holiday3[0].id);
  });
});