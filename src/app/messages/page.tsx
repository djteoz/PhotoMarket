import { getConversations } from "@/app/actions/messages";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { MessageSquare, Sparkles, Users, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Сообщения — PhotoMarket",
  description: "Ваши диалоги с владельцами студий и клиентами",
};

export default async function MessagesPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  const conversations = await getConversations();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              <span>{conversations.length} диалогов</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Сообщения
              </span>
            </h1>
            <p className="text-slate-300">
              Общайтесь с владельцами студий и клиентами
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-4">
          {conversations.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
              <div className="w-16 h-16 mx-auto mb-6 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Нет активных диалогов</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
                Найдите студию и напишите владельцу, чтобы начать общение
              </p>
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Перейти в каталог
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            conversations.map((conversation) => {
              const otherUser = conversation.users.find(
                (u) => u.id !== dbUser?.id
              );
              const lastMessage = conversation.messages[0];

              return (
                <Link
                  href={`/messages/${conversation.id}`}
                  key={conversation.id}
                >
                  <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 bg-white dark:bg-slate-800 border-0 shadow-md">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Avatar className="w-12 h-12 ring-2 ring-purple-100 dark:ring-purple-900">
                        <AvatarImage src={otherUser?.image || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white font-bold">
                          {otherUser?.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="font-semibold truncate">
                            {otherUser?.name || otherUser?.email}
                          </h3>
                          {lastMessage && (
                            <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                              {formatDistanceToNow(lastMessage.createdAt, {
                                addSuffix: true,
                                locale: ru,
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {lastMessage ? lastMessage.content : "Нет сообщений"}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
