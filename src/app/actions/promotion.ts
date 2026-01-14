"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Promotion prices
const PROMOTION_PRICES = {
  TOP: { day: 299, week: 1490, month: 4990 },
  FEATURED: { day: 199, week: 990, month: 2990 },
  HIGHLIGHT: { day: 99, week: 490, month: 1490 },
} as const;

export type PromotionType = keyof typeof PROMOTION_PRICES;
export type PromotionDuration = "day" | "week" | "month";

// In-memory store for promotions (until Prisma model is ready)
interface PromotionRecord {
  id: string;
  studioId: string;
  type: PromotionType;
  startDate: Date;
  endDate: Date;
  amount: number;
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
}

const promotionsStore: PromotionRecord[] = [];

/**
 * Get promotion price
 */
export async function getPromotionPrice(
  type: PromotionType,
  duration: PromotionDuration
) {
  return PROMOTION_PRICES[type][duration];
}

/**
 * Create a promotion for a studio
 */
export async function createPromotion(
  studioId: string,
  type: PromotionType,
  duration: PromotionDuration
) {
  const user = await currentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const studio = await prisma.studio.findUnique({
    where: { id: studioId },
    include: { owner: { select: { clerkId: true } } },
  });

  if (!studio) {
    return { error: "Студия не найдена" };
  }

  if (studio.owner.clerkId !== user.id) {
    return { error: "Нет доступа к этой студии" };
  }

  const amount = await getPromotionPrice(type, duration);
  const durationDays = duration === "day" ? 1 : duration === "week" ? 7 : 30;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + durationDays);

  // Create in-memory promotion (temporary until Prisma model works)
  const promotion: PromotionRecord = {
    id: `promo_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    studioId,
    type,
    startDate,
    endDate,
    amount,
    status: "ACTIVE",
  };

  promotionsStore.push(promotion);

  revalidatePath("/catalog");
  revalidatePath(`/studios/${studioId}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    promotion,
    paymentUrl: `/api/payment/promotion?promotionId=${promotion.id}`,
  };
}

/**
 * Cancel a promotion
 */
export async function cancelPromotion(promotionId: string) {
  const user = await currentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const promotion = promotionsStore.find((p) => p.id === promotionId);

  if (!promotion) {
    return { error: "Продвижение не найдено" };
  }

  // Verify ownership
  const studio = await prisma.studio.findUnique({
    where: { id: promotion.studioId },
    include: { owner: { select: { clerkId: true } } },
  });

  if (!studio || studio.owner.clerkId !== user.id) {
    return { error: "Нет доступа" };
  }

  promotion.status = "CANCELLED";

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * Get active promotions for user's studios
 */
export async function getMyPromotions() {
  const user = await currentUser();
  if (!user) return [];

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) return [];

  // Get user's studios
  const studios = await prisma.studio.findMany({
    where: { ownerId: dbUser.id },
    select: { id: true, name: true },
  });

  const studioIds = new Set(studios.map((s) => s.id));
  const now = new Date();

  // Filter promotions from in-memory store
  return promotionsStore
    .filter(
      (p) =>
        studioIds.has(p.studioId) && p.status === "ACTIVE" && p.endDate > now
    )
    .map((p) => ({
      ...p,
      studio: studios.find((s) => s.id === p.studioId) || {
        id: p.studioId,
        name: "Unknown",
      },
    }));
}

/**
 * Cron job to expire promotions (call from /api/cron/expire-promotions)
 */
export async function expirePromotions() {
  const now = new Date();

  let expiredCount = 0;

  promotionsStore.forEach((p) => {
    if (p.status === "ACTIVE" && p.endDate < now) {
      p.status = "EXPIRED";
      expiredCount++;
    }
  });

  return { expired: expiredCount };
}

/**
 * Check if a studio is promoted (for display purposes)
 */
export async function isStudioPromoted(studioId: string): Promise<{
  isPromoted: boolean;
  type: PromotionType | null;
  until: Date | null;
}> {
  const now = new Date();
  const activePromotion = promotionsStore.find(
    (p) => p.studioId === studioId && p.status === "ACTIVE" && p.endDate > now
  );

  if (activePromotion) {
    return {
      isPromoted: true,
      type: activePromotion.type,
      until: activePromotion.endDate,
    };
  }

  return { isPromoted: false, type: null, until: null };
}
