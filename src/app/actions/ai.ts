"use server";

import {
  generateStudioDescription,
  parseSearchQuery,
  improveDescription,
  generateStudioTags,
  answerStudioQuestion,
} from "@/lib/ai/yandex-gpt";
import { ensureDbUser } from "@/lib/ensure-db-user";
import { prisma } from "@/lib/prisma";
import { rateLimiter, RATE_LIMITS } from "@/lib/rate-limit";

// Rate limit check helper
async function checkAIRateLimit(userId: string) {
  const config = RATE_LIMITS.ai;
  const result = await rateLimiter.isRateLimited(
    `ai:${userId}`,
    config.limit,
    config.windowMs
  );

  if (result.limited) {
    return {
      error: "Слишком много AI-запросов. Попробуйте через минуту.",
      retryAfter: Math.ceil(result.resetIn / 1000),
    };
  }
  return null;
}

/**
 * AI-генерация описания студии
 */
export async function generateDescription(studioId: string) {
  try {
    const result = await ensureDbUser();
    if (!result) return { error: "Необходимо авторизоваться" };
    const { clerkUser } = result;

    const rateLimit = await checkAIRateLimit(clerkUser.id);
    if (rateLimit) return rateLimit;

    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      include: {
        rooms: {
          include: { amenities: true },
        },
        owner: { select: { clerkId: true } },
      },
    });

    if (!studio) {
      return { error: "Студия не найдена" };
    }

    if (studio.owner.clerkId !== clerkUser.id) {
      return { error: "Нет доступа к этой студии" };
    }

    try {
      const features: string[] = [];

      studio.rooms.forEach((room) => {
        if (room.hasNaturalLight) features.push("естественный свет");
        room.amenities.forEach((a) => features.push(a.name));
      });

      const minPrice = Math.min(
        ...studio.rooms.map((r) => Number(r.pricePerHour))
      );
      const maxPrice = Math.max(
        ...studio.rooms.map((r) => Number(r.pricePerHour))
      );
      const priceRange =
        minPrice === maxPrice ? `${minPrice}` : `${minPrice}-${maxPrice}`;

      const description = await generateStudioDescription({
        name: studio.name,
        city: studio.city,
        rooms: studio.rooms.length,
        features: [...new Set(features)].slice(0, 5),
        priceRange,
      });

      return { success: true, description };
    } catch (error) {
      console.error("AI generation error:", error);
      return { error: "Ошибка генерации. Попробуйте позже." };
    }
  } catch (error) {
    console.error("generateDescription error:", error);
    return { error: "Ошибка генерации. Попробуйте позже." };
  }
}

/**
 * AI-поиск с естественным языком
 */
export async function aiSearch(query: string) {
  try {
    const result = await ensureDbUser();
    const userId = result?.clerkUser?.id || "anonymous";

    const rateLimit = await checkAIRateLimit(userId);
    if (rateLimit) return rateLimit;

    const filters = await parseSearchQuery(query);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { AND: [] };

    if (filters.city) {
      where.AND.push({
        city: { contains: filters.city, mode: "insensitive" },
      });
    }

    if (filters.keywords && filters.keywords.length > 0) {
      where.AND.push({
        OR: [
          { name: { contains: filters.keywords[0], mode: "insensitive" } },
          {
            description: { contains: filters.keywords[0], mode: "insensitive" },
          },
        ],
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roomWhere: any = {};

    if (filters.minPrice || filters.maxPrice) {
      roomWhere.pricePerHour = {};
      if (filters.minPrice) roomWhere.pricePerHour.gte = filters.minPrice;
      if (filters.maxPrice) roomWhere.pricePerHour.lte = filters.maxPrice;
    }

    if (filters.minArea) {
      roomWhere.area = { gte: filters.minArea };
    }

    if (filters.hasNaturalLight !== undefined) {
      roomWhere.hasNaturalLight = filters.hasNaturalLight;
    }

    if (Object.keys(roomWhere).length > 0) {
      where.AND.push({ rooms: { some: roomWhere } });
    }

    const studios = await prisma.studio.findMany({
      where: where.AND.length > 0 ? where : undefined,
      include: {
        rooms: true,
        reviews: true,
      },
      take: 20,
    });

    return {
      success: true,
      studios,
      filters,
      query,
    };
  } catch (error) {
    console.error("AI search error:", error);
    return { error: "Ошибка поиска. Попробуйте обычный поиск." };
  }
}

/**
 * Улучшение текста с помощью AI
 */
export async function improveText(text: string) {
  try {
    const result = await ensureDbUser();
    if (!result) return { error: "Необходимо авторизоваться" };
    const { clerkUser } = result;

    const rateLimit = await checkAIRateLimit(clerkUser.id);
    if (rateLimit) return rateLimit;

    const improved = await improveDescription(text);
    return { success: true, text: improved };
  } catch (error) {
    console.error("AI improve error:", error);
    return { error: "Ошибка улучшения текста" };
  }
}

/**
 * Автоматическая генерация тегов
 */
export async function generateTags(studioId: string) {
  try {
    const result = await ensureDbUser();
    if (!result) return { error: "Необходимо авторизоваться" };
    const { clerkUser } = result;

    const rateLimit = await checkAIRateLimit(clerkUser.id);
    if (rateLimit) return rateLimit;

    const studio = await prisma.studio.findUnique({
      where: { id: studioId },
      include: { rooms: true },
    });

    if (!studio) {
      return { error: "Студия не найдена" };
    }

    const fullDescription = `${studio.name}. ${studio.description || ""}. ${
      studio.city
    }. ${studio.rooms
      .map((r) => r.name + " " + (r.description || ""))
      .join(". ")}`;
    const tags = await generateStudioTags(fullDescription);
    return { success: true, tags };
  } catch (error) {
    console.error("AI tags error:", error);
    return { error: "Ошибка генерации тегов" };
  }
}

/**
 * AI-ассистент для вопросов о студии
 */
export async function askAboutStudio(studioId: string, question: string) {
  const rateLimit = await checkAIRateLimit("anonymous");
  if (rateLimit) return rateLimit;

  const studio = await prisma.studio.findUnique({
    where: { id: studioId },
    include: {
      rooms: {
        include: { amenities: true },
      },
    },
  });

  if (!studio) {
    return { error: "Студия не найдена" };
  }

  try {
    const answer = await answerStudioQuestion(
      {
        name: studio.name,
        description: studio.description || "",
        address: studio.address,
        rooms: studio.rooms.map((r) => ({
          name: r.name,
          pricePerHour: Number(r.pricePerHour),
          area: r.area,
          amenities: r.amenities.map((a) => a.name),
        })),
      },
      question
    );
    return { success: true, answer };
  } catch (error) {
    console.error("AI answer error:", error);
    return { error: "Не удалось получить ответ" };
  }
}
