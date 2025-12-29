"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateTicketStatus(ticketId: string, status: string) {
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status },
  });

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath("/admin/tickets");
}

export async function deleteStudio(studioId: string) {
  await prisma.studio.delete({
    where: { id: studioId },
  });
  revalidatePath("/admin/studios");
}

export async function deleteUser(userId: string) {
  await prisma.user.delete({
    where: { id: userId },
  });
  revalidatePath("/admin/users");
}

