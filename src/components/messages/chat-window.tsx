"use client";

import { useState, useRef, useEffect } from "react";
import { Message, User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendMessage } from "@/app/actions/messages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Send } from "lucide-react";

interface ChatWindowProps {
  conversationId: string;
  initialMessages: (Message & { sender: User })[];
  currentUserId: string;
  otherUser: User;
}

export function ChatWindow({
  conversationId,
  initialMessages,
  currentUserId,
  otherUser,
}: ChatWindowProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const tempMessage: Message & { sender: User } = {
      id: Date.now().toString(),
      conversationId,
      senderId: currentUserId,
      content: newMessage,
      createdAt: new Date(),
      read: false,
      sender: {
        id: currentUserId,
        name: "Вы",
        image: null,
        email: "",
        phone: null,
        clerkId: "",
        role: "USER",
        subscriptionPlan: "FREE",
        subscriptionEndsAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    await sendMessage(conversationId, tempMessage.content);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] border rounded-lg overflow-hidden bg-white">
      <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={otherUser.image || ""} />
          <AvatarFallback>{otherUser.name?.[0] || "U"}</AvatarFallback>
        </Avatar>
        <span className="font-semibold">
          {otherUser.name || otherUser.email}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  isMe
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p>{msg.content}</p>
                <span
                  className={`text-[10px] block mt-1 ${
                    isMe ? "text-primary-foreground/70" : "text-gray-500"
                  }`}
                >
                  {format(new Date(msg.createdAt), "HH:mm", { locale: ru })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t bg-white flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Напишите сообщение..."
        />
        <Button onClick={handleSend} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
