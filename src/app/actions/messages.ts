"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function startConversation(receiverId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });
  if (!dbUser) throw new Error("User not found");

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
}

export async function sendMessage(conversationId: string, content: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });
  if (!dbUser) throw new Error("User not found");

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
}

export async function getConversations() {
  const user = await currentUser();
  if (!user) return [];

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });
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
}

export async function getMessages(conversationId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Verify user is part of conversation
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });
  
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { users: true },
  });

  if (!conversation || !conversation.users.some(u => u.id === dbUser?.id)) {
    throw new Error("Unauthorized");
  }

  return await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    include: { sender: true },
  });
}
