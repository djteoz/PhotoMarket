import { initTRPC, TRPCError } from "@trpc/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import superjson from "superjson";
import { prisma } from "@/lib/prisma";

/**
 * tRPC Context - available in all procedures
 */
export const createTRPCContext = async () => {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;

  // Get or create database user if authenticated
  let dbUser = null;
  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      try {
        dbUser = await prisma.user.create({
          data: {
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress ?? "",
            name:
              [user.firstName, user.lastName].filter(Boolean).join(" ") ||
              "Пользователь",
            phone: user.phoneNumbers?.[0]?.phoneNumber,
          },
        });
      } catch {
        // Race condition: another request may have created the user
        dbUser = await prisma.user.findUnique({
          where: { clerkId: user.id },
        });
      }
    }
  }

  return {
    userId,
    user,
    dbUser,
    prisma,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialize tRPC
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof Error ? error.cause.message : null,
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId || !ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Необходимо авторизоваться",
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      user: ctx.user,
    },
  });
});

/**
 * Owner procedure - requires user to have a studio
 */
export const ownerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.dbUser) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Пользователь не найден в базе данных",
    });
  }

  const hasStudio = await ctx.prisma.studio.findFirst({
    where: { ownerId: ctx.dbUser.id },
  });

  if (!hasStudio) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "У вас нет зарегистрированной студии",
    });
  }

  return next({
    ctx: {
      ...ctx,
      dbUser: ctx.dbUser,
    },
  });
});

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.dbUser || ctx.dbUser.role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Требуются права администратора",
    });
  }

  return next({
    ctx: {
      ...ctx,
      dbUser: ctx.dbUser,
    },
  });
});
