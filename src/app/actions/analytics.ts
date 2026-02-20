"use server";

import { ensureDbUser } from "@/lib/ensure-db-user";
import { prisma } from "@/lib/prisma";
import { subDays, format, startOfDay } from "date-fns";

// Типы для аналитики
interface DailyData {
  date: string;
  views: number;
  clicks: number;
  bookings: number;
  revenue: number;
}

/**
 * Track studio view - реальное отслеживание просмотров
 */
export async function trackStudioView(studioId: string) {
  try {
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
    });

    if (!studio) {
      return { error: "Studio not found" };
    }

    // Увеличиваем счётчик просмотров студии
    await prisma.studio.update({
      where: { id: studioId },
      data: { views: { increment: 1 } },
    });

    // Обновляем дневную аналитику
    const today = startOfDay(new Date());

    await prisma.studioAnalytics.upsert({
      where: {
        studioId_date: {
          studioId,
          date: today,
        },
      },
      update: {
        views: { increment: 1 },
      },
      create: {
        studioId,
        date: today,
        views: 1,
        clicks: 0,
        bookings: 0,
        revenue: 0,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Track view error:", error);
    return { error: "Failed to track" };
  }
}

/**
 * Track booking click - отслеживание кликов на бронирование
 */
export async function trackBookingClick(studioId: string) {
  try {
    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
    });

    if (!studio) {
      return { error: "Studio not found" };
    }

    // Обновляем дневную аналитику
    const today = startOfDay(new Date());

    await prisma.studioAnalytics.upsert({
      where: {
        studioId_date: {
          studioId,
          date: today,
        },
      },
      update: {
        clicks: { increment: 1 },
      },
      create: {
        studioId,
        date: today,
        views: 0,
        clicks: 1,
        bookings: 0,
        revenue: 0,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Track click error:", error);
    return { error: "Failed to track" };
  }
}

/**
 * Record booking in analytics
 */
export async function trackBookingComplete(studioId: string, revenue: number) {
  try {
    const today = startOfDay(new Date());

    await prisma.studioAnalytics.upsert({
      where: {
        studioId_date: {
          studioId,
          date: today,
        },
      },
      update: {
        bookings: { increment: 1 },
        revenue: { increment: revenue },
      },
      create: {
        studioId,
        date: today,
        views: 0,
        clicks: 0,
        bookings: 1,
        revenue: revenue,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Track booking error:", error);
    return { error: "Failed to track" };
  }
}

/**
 * Get analytics for owner's studios
 */
export async function getOwnerAnalytics(days: number = 30) {
  try {
    const result = await ensureDbUser();
    if (!result) return null;
    const { dbUser } = result;

  const startDate = subDays(new Date(), days);

  // Get all owner's studios with views
  const studios = await prisma.studio.findMany({
    where: { ownerId: dbUser.id },
    select: { id: true, name: true, views: true },
  });

  if (studios.length === 0) return null;

  const studioIds = studios.map((s) => s.id);

  // Get analytics data from StudioAnalytics
  const analyticsRecords = await prisma.studioAnalytics.findMany({
    where: {
      studioId: { in: studioIds },
      date: { gte: startDate },
    },
    orderBy: { date: "asc" },
  });

  // Get bookings for additional data
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

  // Add analytics data
  analyticsRecords.forEach((record) => {
    const date = format(record.date, "yyyy-MM-dd");
    if (dailyData[date]) {
      dailyData[date].views += record.views;
      dailyData[date].clicks += record.clicks;
      dailyData[date].bookings += record.bookings;
      dailyData[date].revenue += Number(record.revenue);
    }
  });

  // Calculate totals from analytics
  const totalViews = analyticsRecords.reduce((acc, r) => acc + r.views, 0);
  const totalClicks = analyticsRecords.reduce((acc, r) => acc + r.clicks, 0);
  const totalBookings = analyticsRecords.reduce(
    (acc, r) => acc + r.bookings,
    0
  );
  const totalRevenue = analyticsRecords.reduce(
    (acc, r) => acc + Number(r.revenue),
    0
  );

  const totals = {
    views: totalViews,
    bookings: totalBookings || bookings.length,
    revenue:
      totalRevenue ||
      bookings.reduce((acc, b) => acc + Number(b.totalPrice), 0),
    conversionRate: totalViews > 0 ? (totalBookings / totalViews) * 100 : 0,
  };

  // Top studios with real data
  const studioStats = await Promise.all(
    studios.map(async (studio) => {
      const studioAnalytics = analyticsRecords.filter(
        (r) => r.studioId === studio.id
      );
      const studioBookings = bookings.filter(
        (b) => b.room.studioId === studio.id
      );

      return {
        id: studio.id,
        name: studio.name,
        views:
          studio.views || studioAnalytics.reduce((acc, r) => acc + r.views, 0),
        bookings:
          studioAnalytics.reduce((acc, r) => acc + r.bookings, 0) ||
          studioBookings.length,
        revenue:
          studioAnalytics.reduce((acc, r) => acc + Number(r.revenue), 0) ||
          studioBookings.reduce((acc, b) => acc + Number(b.totalPrice), 0),
        clicks: studioAnalytics.reduce((acc, r) => acc + r.clicks, 0),
      };
    })
  );

  return {
    dailyData: Object.values(dailyData),
    totals,
    studios: studioStats.sort((a, b) => b.revenue - a.revenue),
    period: { start: startDate, end: new Date() },
  };
  } catch (error) {
    console.error("getOwnerAnalytics error:", error);
    return null;
  }
}

/**
 * Get single studio analytics
 */
export async function getStudioAnalytics(studioId: string, days: number = 30) {
  try {
    const result = await ensureDbUser();
    if (!result) return null;
    const { clerkUser } = result;

    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      include: { owner: { select: { clerkId: true } } },
    });

    if (!studio || studio.owner.clerkId !== clerkUser.id) {
      return null;
    }

  const startDate = subDays(new Date(), days);

  // Get analytics from StudioAnalytics model
  const analyticsRecords = await prisma.studioAnalytics.findMany({
    where: {
      studioId,
      date: { gte: startDate },
    },
    orderBy: { date: "asc" },
  });

  // Get bookings for this studio
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

  // Build analytics data from real records
  const analyticsData: DailyData[] = [];
  for (let i = 0; i <= days; i++) {
    const date = format(subDays(new Date(), days - i), "yyyy-MM-dd");
    const record = analyticsRecords.find(
      (r) => format(r.date, "yyyy-MM-dd") === date
    );

    analyticsData.push({
      date,
      views: record?.views || 0,
      clicks: record?.clicks || 0,
      bookings: record?.bookings || 0,
      revenue: record ? Number(record.revenue) : 0,
    });
  }

  // Add booking data to analytics if not already tracked
  bookings.forEach((b) => {
    const date = format(b.createdAt, "yyyy-MM-dd");
    const dayData = analyticsData.find((d) => d.date === date);
    if (dayData && dayData.bookings === 0) {
      dayData.bookings += 1;
      dayData.revenue += Number(b.totalPrice);
    }
  });

  // Calculate totals
  const totalViews =
    analyticsRecords.reduce((acc, r) => acc + r.views, 0) || studio.views;
  const totalClicks = analyticsRecords.reduce((acc, r) => acc + r.clicks, 0);
  const totalBookings =
    analyticsRecords.reduce((acc, r) => acc + r.bookings, 0) || bookings.length;
  const totalRevenue =
    analyticsRecords.reduce((acc, r) => acc + Number(r.revenue), 0) ||
    bookings.reduce((acc, b) => acc + Number(b.totalPrice), 0);

  return {
    studio: {
      id: studio.id,
      name: studio.name,
      totalViews: studio.views,
    },
    analytics: analyticsData,
    totals: {
      views: totalViews,
      clicks: totalClicks,
      bookings: totalBookings,
      revenue: totalRevenue,
    },
    recentBookings,
  };
  } catch (error) {
    console.error("getStudioAnalytics error:", error);
    return null;
  }
}
