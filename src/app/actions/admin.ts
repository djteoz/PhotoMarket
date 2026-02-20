"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { ensureDbUser } from "@/lib/ensure-db-user";

async function requireAdmin() {
  const { dbUser } = await ensureDbUser();
  if (!dbUser || dbUser.role !== "ADMIN") {
    throw new Error("Требуются права администратора");
  }
  return dbUser;
}

export async function updateUserRole(userId: string, newRole: Role) {
  try {
    await requireAdmin();

    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { error: "Не удалось обновить роль" };
  }
}

export async function updateTicketStatus(ticketId: string, status: string) {
  try {
    await requireAdmin();

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });

    revalidatePath(`/admin/tickets/${ticketId}`);
    revalidatePath("/admin/tickets");
    return { success: true };
  } catch (error) {
    console.error("Error updating ticket:", error);
    return { error: "Не удалось обновить тикет" };
  }
}

export async function deleteStudio(studioId: string) {
  try {
    await requireAdmin();

    await prisma.studio.delete({
      where: { id: studioId },
    });
    revalidatePath("/admin/studios");
    return { success: true };
  } catch (error) {
    console.error("Error deleting studio:", error);
    return { error: "Не удалось удалить студию" };
  }
}

export async function deleteUser(userId: string) {
  try {
    await requireAdmin();

    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Не удалось удалить пользователя" };
  }
}
