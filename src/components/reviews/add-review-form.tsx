"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createReview } from "@/app/actions/review";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AddReviewFormProps {
  studioId: string;
}

export function AddReviewForm({ studioId }: AddReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, поставьте оценку",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("studioId", studioId);
    formData.append("rating", rating.toString());
    formData.append("comment", comment);

    startTransition(async () => {
      const result = await createReview(formData);

      if (result.error) {
        toast({
          title: "Ошибка",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Успешно",
          description: "Ваш отзыв добавлен",
        });
        setRating(0);
        setComment("");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 border rounded-lg p-4 bg-white"
    >
      <h3 className="font-semibold text-lg">Оставить отзыв</h3>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-colors"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(star)}
          >
            <Star
              className={cn(
                "h-6 w-6",
                (hoveredRating || rating) >= star
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              )}
            />
          </button>
        ))}
      </div>

      <Textarea
        placeholder="Расскажите о ваших впечатлениях..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="resize-none"
        rows={4}
      />

      <Button type="submit" disabled={isPending}>
        {isPending ? "Отправка..." : "Отправить отзыв"}
      </Button>
    </form>
  );
}
