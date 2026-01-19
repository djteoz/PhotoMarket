import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const bookingRouter = router({
  /**
   * Create a new booking
   */
  create: protectedProcedure
    .input(
      z.object({
        roomId: z.string(),
        startTime: z.date(),
        endTime: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.dbUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Пользователь не найден",
        });
      }

      // Get room with price
      const room = await ctx.prisma.room.findUnique({
        where: { id: input.roomId },
        include: { studio: true },
      });

      if (!room) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Зал не найден",
        });
      }

      // Check for conflicts
      const conflict = await ctx.prisma.booking.findFirst({
        where: {
          roomId: input.roomId,
          status: { notIn: ["CANCELLED"] },
          OR: [
            {
              startTime: { lte: input.startTime },
              endTime: { gt: input.startTime },
            },
            {
              startTime: { lt: input.endTime },
              endTime: { gte: input.endTime },
            },
            {
              startTime: { gte: input.startTime },
              endTime: { lte: input.endTime },
            },
          ],
        },
      });

      if (conflict) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Это время уже занято",
        });
      }

      // Calculate total price
      const hours =
        (input.endTime.getTime() - input.startTime.getTime()) /
        (1000 * 60 * 60);
      const totalPrice = Number(room.pricePerHour) * hours;

      // Create booking
      const booking = await ctx.prisma.booking.create({
        data: {
          userId: ctx.dbUser.id,
          roomId: input.roomId,
          startTime: input.startTime,
          endTime: input.endTime,
          totalPrice,
          status: "PENDING",
        },
        include: {
          room: {
            include: { studio: true },
          },
        },
      });

      return booking;
    }),

  /**
   * Get user's bookings
   */
  myBookings: protectedProcedure
    .input(
      z
        .object({
          status: z
            .enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"])
            .optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.dbUser) {
        return [];
      }

      return ctx.prisma.booking.findMany({
        where: {
          userId: ctx.dbUser.id,
          status: input?.status,
        },
        include: {
          room: {
            include: {
              studio: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                },
              },
            },
          },
        },
        orderBy: { startTime: "desc" },
      });
    }),

  /**
   * Cancel booking
   */
  cancel: protectedProcedure
    .input(z.object({ bookingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.dbUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Пользователь не найден",
        });
      }

      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.bookingId },
      });

      if (!booking) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Бронирование не найдено",
        });
      }

      if (booking.userId !== ctx.dbUser.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Вы не можете отменить это бронирование",
        });
      }

      if (booking.status === "CANCELLED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Бронирование уже отменено",
        });
      }

      return ctx.prisma.booking.update({
        where: { id: input.bookingId },
        data: { status: "CANCELLED" },
      });
    }),
});
