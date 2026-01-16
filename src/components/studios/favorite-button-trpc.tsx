"use client";

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";

interface FavoriteButtonTRPCProps {
  studioId: string;
  initialFavorited?: boolean;
  className?: string;
}

/**
 * Favorite button using tRPC for type-safe API calls
 */
export function FavoriteButtonTRPC({
  studioId,
  initialFavorited = false,
  className,
}: FavoriteButtonTRPCProps) {
  const { isSignedIn } = useAuth();
  const utils = trpc.useUtils();

  // Toggle mutation with optimistic updates
  const toggleMutation = trpc.studio.toggleFavorite.useMutation({
    onMutate: async () => {
      // Cancel outgoing fetches
      await utils.studio.favorites.cancel();
    },
    onSuccess: (data) => {
      if (data.favorited) {
        toast.success("Добавлено в избранное");
      } else {
        toast.success("Удалено из избранного");
      }
      // Invalidate and refetch
      utils.studio.favorites.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleClick = () => {
    if (!isSignedIn) {
      toast.error("Войдите чтобы добавить в избранное");
      return;
    }
    toggleMutation.mutate({ studioId });
  };

  const isFavorited = toggleMutation.data?.favorited ?? initialFavorited;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      className={cn("hover:bg-red-50", className)}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-colors",
          isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"
        )}
      />
    </Button>
  );
}
