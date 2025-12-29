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
