import { router } from "../trpc";
import { studioRouter } from "./studio";
import { bookingRouter } from "./booking";
import { reviewRouter } from "./review";

/**
 * Main App Router
 * All sub-routers are merged here
 */
export const appRouter = router({
  studio: studioRouter,
  booking: bookingRouter,
  review: reviewRouter,
});

// Export type for client
export type AppRouter = typeof appRouter;
