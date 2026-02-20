"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { ensureDbUser } from "@/lib/ensure-db-user";

// Иерархия ролей: OWNER > ADMIN > MODERATOR > USER
const ROLE_LEVEL: Record<Role, number> = {
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2,
  OWNER: 3,
};

async function requireAdmin() {
  const { dbUser } = await ensureDbUser();
  if (!dbUser || (dbUser.role !== "ADMIN" && dbUser.role !== "OWNER")) {
    throw new Error("Требуются права администратора");
  }
  return dbUser;
}

async function requireModerator() {
  const { dbUser } = await ensureDbUser();
  if (!dbUser || ROLE_LEVEL[dbUser.role] < ROLE_LEVEL.MODERATOR) {
    throw new Error("Требуются права модератора");
  }
  return dbUser;
}

export async function updateUserRole(userId: string, newRole: Role) {
  try {
    const caller = await requireAdmin();
    const callerLevel = ROLE_LEVEL[caller.role];
    const newRoleLevel = ROLE_LEVEL[newRole];

    // Нельзя назначить роль выше или равную своей (кроме OWNER)
    if (caller.role !== "OWNER" && newRoleLevel >= callerLevel) {
      return { error: "Нельзя назначить роль равную или выше своей" };
    }

    // Проверяем целевого пользователя
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return { error: "Пользователь не найден" };

    const targetLevel = ROLE_LEVEL[target.role];

    // Нельзя менять роль пользователю с ролью >= своей (кроме OWNER)
    if (caller.role !== "OWNER" && targetLevel >= callerLevel) {
      return {
        error: "Недостаточно прав для изменения роли этого пользователя",
      };
    }

    // OWNER не может быть понижен никем кроме себя
    if (target.role === "OWNER" && caller.id !== target.id) {
      return { error: "Только владелец может изменить свою роль" };
    }

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
    const caller = await requireAdmin();

    // Проверяем целевого пользователя
    const target = await prisma.user.findUnique({ where: { id: userId } });
    if (!target) return { error: "Пользователь не найден" };

    // OWNER не может быть удалён
    if (target.role === "OWNER") {
      return { error: "Невозможно удалить владельца" };
    }

    // ADMIN не может удалить другого ADMIN
    if (caller.role === "ADMIN" && target.role === "ADMIN") {
      return { error: "Администратор не может удалить другого администратора" };
    }

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
