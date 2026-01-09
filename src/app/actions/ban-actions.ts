"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleUserBan(
  userId: string,
  isBanned: boolean,
  reason?: string
) {
  try {
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
    return { error: "Failed to update ban status" };
  }
}

export async function banIp(ip: string, reason?: string, adminId?: string) {
  try {
    await prisma.bannedIp.create({
      data: {
        ip,
        reason,
        createdBy: adminId,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error banning IP:", error);
    return { error: "Failed to ban IP" };
  }
}

export async function unbanIp(ip: string) {
  try {
    await prisma.bannedIp.delete({
      where: { ip },
    });
    return { success: true };
  } catch (error) {
    console.error("Error unbanning IP:", error);
    return { error: "Failed to unban IP" };
  }
}
