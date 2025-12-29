"use client";

import { deleteUser } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function DeleteUserButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      await deleteUser(userId);
      toast.success("Пользователь удален");
    } catch (error) {
      toast.error("Ошибка при удалении пользователя");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-600 hover:bg-red-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
