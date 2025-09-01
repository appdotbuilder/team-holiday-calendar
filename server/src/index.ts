import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schema types
import { 
  createTeamMemberInputSchema, 
  createHolidayInputSchema, 
  getHolidaysForWeekInputSchema 
} from './schema';

// Import handlers
import { createTeamMember } from './handlers/create_team_member';
import { getTeamMembers } from './handlers/get_team_members';
import { createHoliday } from './handlers/create_holiday';
import { getHolidaysForWeek } from './handlers/get_holidays_for_week';
import { getAllHolidays } from './handlers/get_all_holidays';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Team member routes
  createTeamMember: publicProcedure
    .input(createTeamMemberInputSchema)
    .mutation(({ input }) => createTeamMember(input)),
  
  getTeamMembers: publicProcedure
    .query(() => getTeamMembers()),
  
  // Holiday routes
  createHoliday: publicProcedure
    .input(createHolidayInputSchema)
    .mutation(({ input }) => createHoliday(input)),
  
  getHolidaysForWeek: publicProcedure
    .input(getHolidaysForWeekInputSchema)
    .query(({ input }) => getHolidaysForWeek(input)),
  
  getAllHolidays: publicProcedure
    .query(() => getAllHolidays()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();