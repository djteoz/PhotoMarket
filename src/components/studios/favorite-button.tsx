"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/app/actions/favorite";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  studioId: string;
  initialIsFavorite: boolean;
  isIconOnly?: boolean;
}

export function FavoriteButton({
  studioId,
  initialIsFavorite,
  isIconOnly = false,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation if inside a Link
    e.stopPropagation();

    // Optimistic update
    setIsFavorite((prev) => !prev);

    startTransition(async () => {
      const result = await toggleFavorite(studioId);
      if (result.error) {
        // Revert on error
        setIsFavorite((prev) => !prev);
        if (result.error === "Unauthorized") {
            router.push("/sign-in");
        }
      }
    });
  };

  return (
    <Button
      variant={isIconOnly ? "ghost" : "outline"}
      size="icon"
      className={cn(
        "transition-colors",
        isFavorite && "text-red-500 hover:text-red-600"
      )}
      onClick={handleToggle}
      disabled={isPending}
    >
      <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
    </Button>
  );
}
