"use client";

import { Button } from "@/components/ui/button";
import { startConversation } from "@/app/actions/messages";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useTransition } from "react";

interface ContactOwnerButtonProps {
  ownerId: string;
  studioName: string;
}

export function ContactOwnerButton({ ownerId, studioName }: ContactOwnerButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleContact = () => {
    startTransition(async () => {
      try {
        const { id } = await startConversation(ownerId);
        router.push(`/messages/${id}`);
      } catch (error) {
        toast.error("Не удалось начать диалог. Возможно, вы не авторизованы.");
      }
    });
  };

  return (
    <Button 
      className="w-full" 
      size="lg" 
      onClick={handleContact}
      disabled={isPending}
    >
      <MessageSquare className="mr-2 h-4 w-4" />
      {isPending ? "Загрузка..." : "Написать владельцу"}
    </Button>
  );
}
