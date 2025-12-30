import { getMessages } from "@/app/actions/messages";
import { ChatWindow } from "@/components/messages/chat-window";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (!dbUser) redirect("/sign-in");

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { users: true },
  });

  if (!conversation || !conversation.users.some((u) => u.id === dbUser.id)) {
    notFound();
  }

  const messages = await getMessages(id);
  const otherUser = conversation.users.find((u) => u.id !== dbUser.id);

  if (!otherUser) return <div>User not found</div>;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <ChatWindow
        conversationId={id}
        initialMessages={messages}
        currentUserId={dbUser.id}
        otherUser={otherUser}
      />
    </div>
  );
}
