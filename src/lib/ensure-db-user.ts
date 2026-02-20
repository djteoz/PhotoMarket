import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * Получает текущего Clerk-пользователя и синхронизирует его с локальной БД.
 * Возвращает { clerkUser, dbUser } или { clerkUser: null, dbUser: null } если не авторизован.
 *
 * Используйте эту функцию вместо прямого вызова currentUser() + prisma.user.findUnique()
 * во всех server actions для единообразной обработки.
 */
export async function ensureDbUser() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return { clerkUser: null, dbUser: null };
    }

    // Ищем или создаём пользователя в локальной БД
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || "",
          name:
            [clerkUser.firstName, clerkUser.lastName]
              .filter(Boolean)
              .join(" ") || "Пользователь",
          image: clerkUser.imageUrl,
        },
      });
    }

    return { clerkUser, dbUser };
  } catch (error) {
    console.error("ensureDbUser error:", error);
    return { clerkUser: null, dbUser: null };
  }
}
