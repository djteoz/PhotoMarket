import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/_app";

/**
 * tRPC React hooks
 * Usage: const { data } = trpc.studio.list.useQuery()
 */
export const trpc = createTRPCReact<AppRouter>();
