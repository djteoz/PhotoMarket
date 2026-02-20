"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureDbUser } from "@/lib/ensure-db-user";

export async function startConversation(receiverId: string) {
  try {
    const { dbUser } = await ensureDbUser();
    if (!dbUser) return { error: "Необходимо авторизоваться" };

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { users: { some: { id: dbUser.id } } },
          { users: { some: { id: receiverId } } },
        ],
      },
    });

    if (existingConversation) {
      return { id: existingConversation.id };
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        users: {
          connect: [{ id: dbUser.id }, { id: receiverId }],
        },
      },
    });

    return { id: conversation.id };
  } catch (error) {
    console.error("Error starting conversation:", error);
    return { error: "Не удалось начать беседу" };
  }
}

export async function sendMessage(conversationId: string, content: string) {
  try {
    const { dbUser } = await ensureDbUser();
    if (!dbUser) return { error: "Необходимо авторизоваться" };

    await prisma.message.create({
      data: {
        conversationId,
        senderId: dbUser.id,
        content,
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    revalidatePath(`/messages/${conversationId}`);
    return { success: true };
  } catch (error) {
    console.error("Error sending message:", error);
    return { error: "Не удалось отправить сообщение" };
  }
}

export async function getConversations() {
  try {
    const { dbUser } = await ensureDbUser();
    if (!dbUser) return [];

    const conversations = await prisma.conversation.findMany({
      where: {
        users: { some: { id: dbUser.id } },
      },
      include: {
        users: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return conversations;
  } catch (error) {
    console.error("Error getting conversations:", error);
    return [];
  }
}

export async function getMessages(conversationId: string) {
  try {
    const { dbUser } = await ensureDbUser();
    if (!dbUser) return [];

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { users: true },
    });

    if (!conversation || !conversation.users.some((u) => u.id === dbUser.id)) {
      return [];
    }

    return await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: { sender: true },
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    return [];
  }
}
