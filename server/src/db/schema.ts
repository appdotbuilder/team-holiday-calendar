import { serial, text, pgTable, timestamp, integer, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Team members table
export const teamMembersTable = pgTable('team_members', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Holidays table
export const holidaysTable = pgTable('holidays', {
  id: serial('id').primaryKey(),
  team_member_id: integer('team_member_id').notNull().references(() => teamMembersTable.id),
  holiday_date: date('holiday_date').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const teamMembersRelations = relations(teamMembersTable, ({ many }) => ({
  holidays: many(holidaysTable),
}));

export const holidaysRelations = relations(holidaysTable, ({ one }) => ({
  teamMember: one(teamMembersTable, {
    fields: [holidaysTable.team_member_id],
    references: [teamMembersTable.id],
  }),
}));

// TypeScript types for the table schemas
export type TeamMember = typeof teamMembersTable.$inferSelect;
export type NewTeamMember = typeof teamMembersTable.$inferInsert;
export type Holiday = typeof holidaysTable.$inferSelect;
export type NewHoliday = typeof holidaysTable.$inferInsert;

// Important: Export all tables and relations for proper query building
export const tables = { 
  teamMembers: teamMembersTable, 
  holidays: holidaysTable 
};

export const tableRelations = {
  teamMembersRelations,
  holidaysRelations
};