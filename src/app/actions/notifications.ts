"use server";

import { prisma } from "@/lib/prisma";
import { ensureDbUser } from "@/lib/ensure-db-user";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  try {
    const result = await ensureDbUser();
    if (!result) return [];
    const { dbUser } = result;

    return await prisma.notification.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  } catch (error) {
    console.error("getNotifications error:", error);
    return [];
  }
}

export async function markAsRead(notificationId: string) {
  try {
    const result = await ensureDbUser();
    if (!result) return { error: "Необходимо авторизоваться" };
    const { dbUser } = result;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== dbUser.id) {
      return { error: "Уведомление не найдено" };
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("markAsRead error:", error);
    return { error: "Не удалось отметить уведомление" };
  }
}

export async function markAllAsRead() {
  try {
    const result = await ensureDbUser();
    if (!result) return { error: "Необходимо авторизоваться" };
    const { dbUser } = result;

    await prisma.notification.updateMany({
      where: { userId: dbUser.id, read: false },
      data: { read: true },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("markAllAsRead error:", error);
    return { error: "Не удалось отметить уведомления" };
  }
}
