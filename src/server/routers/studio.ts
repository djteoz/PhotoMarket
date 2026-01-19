import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { cache, cacheKeys, TTL } from "@/lib/redis";
import { TRPCError } from "@trpc/server";

export const studioRouter = router({
  /**
   * Get all studios with optional filters (infinite scroll support)
   */
  list: publicProcedure
    .input(
      z
        .object({
          city: z.string().optional(),
          minPrice: z.number().optional(),
          maxPrice: z.number().optional(),
          hasNaturalLight: z.boolean().optional(),
          limit: z.number().min(1).max(100).default(12),
          cursor: z.string().optional(), // for pagination
        })
        .default({})
    )
    .query(async ({ ctx, input }) => {
      // Skip cache for cursor-based queries (infinite scroll)
      const shouldCache = !input.cursor;
      const cacheKey = cacheKeys.studiosList(input.city);

      const fetchStudios = async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        if (input.city) {
          where.city = { contains: input.city, mode: "insensitive" };
        }

        if (input.minPrice || input.maxPrice) {
          where.rooms = {
            some: {
              pricePerHour: {
                gte: input.minPrice,
                lte: input.maxPrice,
              },
            },
          };
        }

        if (input.hasNaturalLight) {
          where.rooms = {
            ...where.rooms,
            some: {
              ...where.rooms?.some,
              hasNaturalLight: true,
            },
          };
        }

        const studios = await ctx.prisma.studio.findMany({
          where,
          include: {
            rooms: true,
            reviews: true,
            owner: {
              select: {
                subscriptionPlan: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: input.limit + 1, // Fetch one extra to check if there are more
          cursor: input.cursor ? { id: input.cursor } : undefined,
          skip: input.cursor ? 1 : 0,
        });

        // Check if there are more results
        let nextCursor: string | undefined = undefined;
        if (studios.length > input.limit) {
          const nextItem = studios.pop();
          nextCursor = nextItem?.id;
        }

        // Sort: Premium first
        studios.sort((a, b) => {
          const aPlan = a.owner?.subscriptionPlan;
          const bPlan = b.owner?.subscriptionPlan;
          const isAPremium = aPlan === "BUSINESS" || aPlan === "PRO";
          const isBPremium = bPlan === "BUSINESS" || bPlan === "PRO";
          if (isAPremium && !isBPremium) return -1;
          if (!isAPremium && isBPremium) return 1;
          return 0;
        });

        return {
          studios,
          nextCursor,
        };
      };

      if (shouldCache) {
        return cache.getOrSet(cacheKey, fetchStudios, TTL.MEDIUM);
      }

      return fetchStudios();
    }),

  /**
   * Get single studio by ID
   */
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return cache.getOrSet(
        cacheKeys.studioDetail(input.id),
        async () => {
          const studio = await ctx.prisma.studio.findUnique({
            where: { id: input.id },
            include: {
              rooms: {
                include: {
                  bookings: {
                    where: { startTime: { gte: new Date() } },
                  },
                },
                orderBy: { pricePerHour: "asc" },
              },
              reviews: {
                include: {
                  user: { select: { name: true, image: true } },
                },
                orderBy: { createdAt: "desc" },
              },
              owner: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  subscriptionPlan: true,
                },
              },
            },
          });

          if (!studio) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Студия не найдена",
            });
          }

          return studio;
        },
        TTL.MEDIUM
      );
    }),

  /**
   * Get cities with studio counts
   */
  cities: publicProcedure.query(async ({ ctx }) => {
    return cache.getOrSet(
      cacheKeys.catalogCities(),
      async () => {
        return ctx.prisma.studio.groupBy({
          by: ["city"],
          _count: { city: true },
          orderBy: { _count: { city: "desc" } },
        });
      },
      TTL.LONG
    );
  }),

  /**
   * Toggle favorite studio
   */
  toggleFavorite: protectedProcedure
    .input(z.object({ studioId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.dbUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Пользователь не найден",
        });
      }

      const existing = await ctx.prisma.favorite.findUnique({
        where: {
          userId_studioId: {
            userId: ctx.dbUser.id,
            studioId: input.studioId,
          },
        },
      });

      if (existing) {
        await ctx.prisma.favorite.delete({
          where: { id: existing.id },
        });
        return { favorited: false };
      } else {
        await ctx.prisma.favorite.create({
          data: {
            userId: ctx.dbUser.id,
            studioId: input.studioId,
          },
        });
        return { favorited: true };
      }
    }),

  /**
   * Get user's favorite studios
   */
  favorites: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.dbUser) {
      return [];
    }

    const favorites = await ctx.prisma.favorite.findMany({
      where: { userId: ctx.dbUser.id },
      include: {
        studio: {
          include: {
            rooms: true,
            reviews: true,
          },
        },
      },
    });

    return favorites.map((f) => f.studio);
  }),
});
