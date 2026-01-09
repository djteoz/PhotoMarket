"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  const user = await currentUser();
  if (!user) return [];

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) return [];

  return await prisma.notification.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function markAsRead(notificationId: string) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return { error: "User not found" };

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== dbUser.id) {
    return { error: "Notification not found" };
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  revalidatePath("/");
  return { success: true };
}

export async function markAllAsRead() {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return { error: "User not found" };

  await prisma.notification.updateMany({
    where: { userId: dbUser.id, read: false },
    data: { read: true },
  });

  revalidatePath("/");
  return { success: true };
}
