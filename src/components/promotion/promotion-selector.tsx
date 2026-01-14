"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Rocket, Star, Sparkles, Loader2, Check } from "lucide-react";
import {
  createPromotion,
  type PromotionType,
  type PromotionDuration,
} from "@/app/actions/promotion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PROMOTION_OPTIONS = [
  {
    type: "TOP" as PromotionType,
    name: "🚀 ТОП",
    description: "Первое место в результатах поиска",
    icon: Rocket,
    color: "from-orange-500 to-red-500",
    prices: { day: 299, week: 1490, month: 4990 },
  },
  {
    type: "FEATURED" as PromotionType,
    name: "⭐ Рекомендуемое",
    description: "Отображение в блоке рекомендаций",
    icon: Star,
    color: "from-blue-500 to-purple-500",
    prices: { day: 199, week: 990, month: 2990 },
  },
  {
    type: "HIGHLIGHT" as PromotionType,
    name: "✨ Выделение",
    description: "Яркая рамка в каталоге",
    icon: Sparkles,
    color: "from-green-500 to-teal-500",
    prices: { day: 99, week: 490, month: 1490 },
  },
];

const DURATION_OPTIONS: {
  value: PromotionDuration;
  label: string;
  discount?: string;
}[] = [
  { value: "day", label: "1 день" },
  { value: "week", label: "7 дней", discount: "-30%" },
  { value: "month", label: "30 дней", discount: "-45%" },
];

interface PromotionSelectorProps {
  studioId: string;
  studioName: string;
  onSuccess?: () => void;
}

export function PromotionSelector({
  studioId,
  studioName,
  onSuccess,
}: PromotionSelectorProps) {
  const [selectedType, setSelectedType] = useState<PromotionType | null>(null);
  const [selectedDuration, setSelectedDuration] =
    useState<PromotionDuration>("week");
  const [isLoading, setIsLoading] = useState(false);

  const selectedOption = PROMOTION_OPTIONS.find((o) => o.type === selectedType);
  const price = selectedOption?.prices[selectedDuration] || 0;

  const handlePromote = async () => {
    if (!selectedType) {
      toast.error("Выберите тип продвижения");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createPromotion(
        studioId,
        selectedType,
        selectedDuration
      );

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Продвижение активировано!");
      onSuccess?.();

      // In real app, redirect to payment
      // if (result.paymentUrl) window.location.href = result.paymentUrl;
    } catch {
      toast.error("Ошибка активации");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🚀 Продвижение студии</CardTitle>
        <CardDescription>
          Увеличьте видимость &quot;{studioName}&quot; в каталоге
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Promotion Type Selection */}
        <div className="space-y-3">
          <Label>Тип продвижения</Label>
          <div className="grid gap-3">
            {PROMOTION_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedType === option.type;

              return (
                <button
                  key={option.type}
                  onClick={() => setSelectedType(option.type)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border-2 transition-all text-left",
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center text-white",
                      option.color
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{option.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                  {isSelected && <Check className="w-5 h-5 text-blue-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration Selection */}
        {selectedType && (
          <div className="space-y-3">
            <Label>Длительность</Label>
            <RadioGroup
              value={selectedDuration}
              onValueChange={(v) => setSelectedDuration(v as PromotionDuration)}
              className="grid grid-cols-3 gap-3"
            >
              {DURATION_OPTIONS.map((duration) => {
                const durationPrice =
                  selectedOption?.prices[duration.value] || 0;

                return (
                  <Label
                    key={duration.value}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      selectedDuration === duration.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <RadioGroupItem
                      value={duration.value}
                      className="sr-only"
                    />
                    <span className="font-medium">{duration.label}</span>
                    <span className="text-lg font-bold">{durationPrice} ₽</span>
                    {duration.discount && (
                      <span className="text-xs text-green-600 font-medium">
                        {duration.discount}
                      </span>
                    )}
                  </Label>
                );
              })}
            </RadioGroup>
          </div>
        )}

        {/* Summary & CTA */}
        {selectedType && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Итого:</span>
              <span className="text-2xl font-bold">{price} ₽</span>
            </div>
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handlePromote}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  Активировать продвижение
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Оплата через YooKassa или Robokassa
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
