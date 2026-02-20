"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureDbUser } from "@/lib/ensure-db-user";

async function requireAdmin() {
  const { dbUser } = await ensureDbUser();
  if (!dbUser || dbUser.role !== "ADMIN") {
    throw new Error("Требуются права администратора");
  }
  return dbUser;
}

export async function toggleUserBan(
  userId: string,
  isBanned: boolean,
  reason?: string,
) {
  try {
    await requireAdmin();

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
    const admin = await requireAdmin();

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
    await requireAdmin();

    await prisma.bannedIp.delete({
      where: { ip },
    });
    return { success: true };
  } catch (error) {
    console.error("Error unbanning IP:", error);
    return { error: "Не удалось разблокировать IP" };
  }
}
