import { z } from 'zod';

// Team member schema
export const teamMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.coerce.date()
});

export type TeamMember = z.infer<typeof teamMemberSchema>;

// Input schema for creating team members
export const createTeamMemberInputSchema = z.object({
  name: z.string().min(1, "Name is required")
});

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberInputSchema>;

// Holiday schema
export const holidaySchema = z.object({
  id: z.number(),
  team_member_id: z.number(),
  holiday_date: z.coerce.date(),
  created_at: z.coerce.date()
});

export type Holiday = z.infer<typeof holidaySchema>;

// Input schema for creating holidays
export const createHolidayInputSchema = z.object({
  team_member_id: z.number(),
  holiday_date: z.string().date() // ISO date string format
});

export type CreateHolidayInput = z.infer<typeof createHolidayInputSchema>;

// Holiday with team member details for display
export const holidayWithTeamMemberSchema = z.object({
  id: z.number(),
  team_member_id: z.number(),
  holiday_date: z.coerce.date(),
  created_at: z.coerce.date(),
  team_member: teamMemberSchema
});

export type HolidayWithTeamMember = z.infer<typeof holidayWithTeamMemberSchema>;

// Input schema for fetching holidays by week
export const getHolidaysForWeekInputSchema = z.object({
  startDate: z.string().date() // ISO date string for the start of the week (Monday)
});

export type GetHolidaysForWeekInput = z.infer<typeof getHolidaysForWeekInputSchema>;