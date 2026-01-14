"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { subDays, format } from "date-fns";

// Типы для аналитики (пока модели не синхронизированы)
interface DailyData {
  date: string;
  views: number;
  clicks: number;
  bookings: number;
  revenue: number;
}

/**
 * Track studio view - упрощённая версия без новых полей
 */
export async function trackStudioView(studioId: string) {
  try {
    // Просто проверяем что студия существует
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
    });

    if (!studio) {
      return { error: "Studio not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Track view error:", error);
    return { error: "Failed to track" };
  }
}

/**
 * Track booking click
 */
export async function trackBookingClick(studioId: string) {
  try {
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
    });

    if (!studio) {
      return { error: "Studio not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Track click error:", error);
    return { error: "Failed to track" };
  }
}

/**
 * Get analytics for owner's studios
 */
export async function getOwnerAnalytics(days: number = 30) {
  const user = await currentUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) return null;

  const startDate = subDays(new Date(), days);

  // Get all owner's studios
  const studios = await prisma.studio.findMany({
    where: { ownerId: dbUser.id },
    select: { id: true, name: true },
  });

  if (studios.length === 0) return null;

  const studioIds = studios.map((s) => s.id);

  // Get bookings
  const bookings = await prisma.booking.findMany({
    where: {
      room: { studioId: { in: studioIds } },
      createdAt: { gte: startDate },
      status: { in: ["CONFIRMED", "COMPLETED"] },
    },
    include: {
      room: { select: { studioId: true } },
    },
  });

  // Aggregate data by date
  const dailyData: Record<string, DailyData> = {};

  // Initialize all dates
  for (let i = 0; i <= days; i++) {
    const date = format(subDays(new Date(), days - i), "yyyy-MM-dd");
    dailyData[date] = { date, views: 0, clicks: 0, bookings: 0, revenue: 0 };
  }

  // Add booking data
  bookings.forEach((b) => {
    const date = format(b.createdAt, "yyyy-MM-dd");
    if (dailyData[date]) {
      dailyData[date].bookings += 1;
      dailyData[date].revenue += Number(b.totalPrice);
    }
  });

  // Calculate totals
  const totals = {
    views: 0, // Will be populated when StudioAnalytics model is ready
    bookings: bookings.length,
    revenue: bookings.reduce((acc, b) => acc + Number(b.totalPrice), 0),
    conversionRate: 0,
  };

  // Top studios
  const studioStats = studios.map((studio) => {
    const studioBookings = bookings.filter(
      (b) => b.room.studioId === studio.id
    );

    return {
      id: studio.id,
      name: studio.name,
      views: 0,
      bookings: studioBookings.length,
      revenue: studioBookings.reduce((acc, b) => acc + Number(b.totalPrice), 0),
      clicks: 0,
    };
  });

  return {
    dailyData: Object.values(dailyData),
    totals,
    studios: studioStats.sort((a, b) => b.revenue - a.revenue),
    period: { start: startDate, end: new Date() },
  };
}

/**
 * Get single studio analytics
 */
export async function getStudioAnalytics(studioId: string, days: number = 30) {
  const user = await currentUser();
  if (!user) return null;

  const studio = await prisma.studio.findUnique({
    where: { id: studioId },
    include: { owner: { select: { clerkId: true } } },
  });

  if (!studio || studio.owner.clerkId !== user.id) {
    return null;
  }

  const startDate = subDays(new Date(), days);

  const bookings = await prisma.booking.findMany({
    where: {
      room: { studioId },
      createdAt: { gte: startDate },
    },
  });

  // Recent bookings
  const recentBookings = await prisma.booking.findMany({
    where: { room: { studioId } },
    include: {
      user: { select: { name: true, email: true } },
      room: { select: { name: true, pricePerHour: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Generate placeholder analytics data
  const analyticsData: DailyData[] = [];
  for (let i = 0; i <= days; i++) {
    const date = format(subDays(new Date(), days - i), "yyyy-MM-dd");
    analyticsData.push({ date, views: 0, clicks: 0, bookings: 0, revenue: 0 });
  }

  // Add booking data to analytics
  bookings.forEach((b) => {
    const date = format(b.createdAt, "yyyy-MM-dd");
    const dayData = analyticsData.find((d) => d.date === date);
    if (dayData) {
      dayData.bookings += 1;
      dayData.revenue += Number(b.totalPrice);
    }
  });

  return {
    studio: {
      id: studio.id,
      name: studio.name,
      totalViews: 0, // Will be populated when views field is available
    },
    analytics: analyticsData,
    totals: {
      views: 0,
      clicks: 0,
      bookings: bookings.length,
      revenue: bookings.reduce((acc, b) => acc + Number(b.totalPrice), 0),
    },
    recentBookings,
  };
}
