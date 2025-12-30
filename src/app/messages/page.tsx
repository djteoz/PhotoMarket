import { getConversations } from "@/app/actions/messages";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

export default async function MessagesPage() {
  const user = await currentUser();
  if (!user) return <div>Please sign in</div>;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  const conversations = await getConversations();

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Сообщения</h1>
      <div className="space-y-4">
        {conversations.length === 0 ? (
          <p className="text-gray-500 text-center py-12">У вас нет активных диалогов.</p>
        ) : (
          conversations.map((conversation) => {
            const otherUser = conversation.users.find((u) => u.id !== dbUser?.id);
            const lastMessage = conversation.messages[0];

            return (
              <Link href={`/messages/${conversation.id}`} key={conversation.id}>
                <Card className="hover:bg-gray-50 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={otherUser?.image || ""} />
                      <AvatarFallback>
                        {otherUser?.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold truncate">
                          {otherUser?.name || otherUser?.email}
                        </h3>
                        {lastMessage && (
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatDistanceToNow(lastMessage.createdAt, {
                              addSuffix: true,
                              locale: ru,
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {lastMessage ? lastMessage.content : "Нет сообщений"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
