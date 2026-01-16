import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const reviewRouter = router({
  /**
   * Create a review for a studio
   */
  create: protectedProcedure
    .input(
      z.object({
        studioId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.dbUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Пользователь не найден",
        });
      }

      // Check if user already reviewed this studio
      const existing = await ctx.prisma.review.findFirst({
        where: {
          userId: ctx.dbUser.id,
          studioId: input.studioId,
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Вы уже оставили отзыв для этой студии",
        });
      }

      // Check if user has a booking at this studio
      const hasBooking = await ctx.prisma.booking.findFirst({
        where: {
          userId: ctx.dbUser.id,
          room: { studioId: input.studioId },
          status: "COMPLETED",
        },
      });

      if (!hasBooking) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Вы можете оставить отзыв только после посещения студии",
        });
      }

      return ctx.prisma.review.create({
        data: {
          userId: ctx.dbUser.id,
          studioId: input.studioId,
          rating: input.rating,
          comment: input.comment,
        },
        include: {
          user: { select: { name: true, image: true } },
        },
      });
    }),

  /**
   * Get reviews for a studio
   */
  byStudio: protectedProcedure
    .input(z.object({ studioId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.review.findMany({
        where: { studioId: input.studioId },
        include: {
          user: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  /**
   * Delete own review
   */
  delete: protectedProcedure
    .input(z.object({ reviewId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.dbUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Пользователь не найден",
        });
      }

      const review = await ctx.prisma.review.findUnique({
        where: { id: input.reviewId },
      });

      if (!review) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Отзыв не найден",
        });
      }

      if (review.userId !== ctx.dbUser.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Вы не можете удалить этот отзыв",
        });
      }

      return ctx.prisma.review.delete({
        where: { id: input.reviewId },
      });
    }),
});
