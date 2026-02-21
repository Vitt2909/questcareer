import { router, publicProcedure } from './server';
import { assessmentRouter } from '@/modules/assessment/router';
import { careerRouter } from '@/modules/career/router';
import { executionRouter } from '@/modules/execution/router';
import { progressRouter } from '@/modules/progress/router';

export const appRouter = router({
    health: publicProcedure.query(() => ({ ok: true })),
    assessment: assessmentRouter,
    career: careerRouter,
    execution: executionRouter,
    progress: progressRouter,
});

export type AppRouter = typeof appRouter;
