import { getMessages } from "@/app/actions/messages";
import { ChatWindow } from "@/components/messages/chat-window";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Link
              href="/messages"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Avatar className="w-10 h-10 ring-2 ring-white/20">
              <AvatarImage src={otherUser.image || ""} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white font-bold">
                {otherUser.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="font-semibold">
                {otherUser.name || otherUser.email}
              </h1>
              <p className="text-sm text-slate-400">Диалог</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chat */}
      <section className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
          <ChatWindow
            conversationId={id}
            initialMessages={messages}
            currentUserId={dbUser.id}
            otherUser={otherUser}
          />
        </div>
      </section>
    </div>
  );
}
