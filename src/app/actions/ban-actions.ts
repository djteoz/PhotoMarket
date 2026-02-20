"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureDbUser } from "@/lib/ensure-db-user";

// Иерархия ролей
const ROLE_LEVEL: Record<string, number> = {
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2,
  OWNER: 3,
};

async function requireModerator() {
  const { dbUser } = await ensureDbUser();
  if (!dbUser || ROLE_LEVEL[dbUser.role] < ROLE_LEVEL.MODERATOR) {
    throw new Error("Требуются права модератора");
  }
  return dbUser;
}

export async function toggleUserBan(
  userId: string,
  isBanned: boolean,
  reason?: string,
) {
  try {
    const caller = await requireModerator();

    // Проверяем целевого пользователя
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return { error: "Пользователь не найден" };

    // Нельзя банить пользователя с ролью >= своей
    if (ROLE_LEVEL[target.role] >= ROLE_LEVEL[caller.role]) {
      return { error: "Недостаточно прав для блокировки этого пользователя" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned,
        banReason: isBanned ? reason : null,
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error toggling user ban:", error);
    return { error: "Не удалось обновить статус бана" };
  }
}

export async function banIp(ip: string, reason?: string) {
  try {
    const admin = await requireModerator();

    await prisma.bannedIp.create({
      data: {
        ip,
        reason,
        createdBy: admin.id,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error banning IP:", error);
    return { error: "Не удалось заблокировать IP" };
  }
}

export async function unbanIp(ip: string) {
  try {
    await requireModerator();

    await prisma.bannedIp.delete({
      where: { ip },
    });
    return { success: true };
  } catch (error) {
    console.error("Error unbanning IP:", error);
    return { error: "Не удалось разблокировать IP" };
  }
}
