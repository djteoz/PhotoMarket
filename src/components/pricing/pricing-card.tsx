"use client";

import { Check, Sparkles, Gift, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubscriptionPlan } from "@prisma/client";
import { createSubscriptionPayment } from "@/app/actions/subscription";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Маппинг имён иконок на компоненты
const iconMap = {
  gift: Gift,
  zap: Zap,
  shield: Shield,
} as const;

type IconName = keyof typeof iconMap;

interface PricingCardProps {
  plan: {
    name: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    popular: boolean;
    planId: SubscriptionPlan;
    iconName?: IconName;
    gradient?: string;
  };
  currentPlan?: SubscriptionPlan;
  isLoggedIn: boolean;
}

export function PricingCard({
  plan,
  currentPlan,
  isLoggedIn,
}: PricingCardProps) {
  const [isPending, startTransition] = useTransition();
  const [selectedProvider, setSelectedProvider] = useState<
    "YOOKASSA" | "ROBOKASSA"
  >("YOOKASSA");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  const isCurrent = currentPlan === plan.planId;
  const Icon = plan.iconName ? iconMap[plan.iconName] : null;

  const handleSubscribe = () => {
    if (!isLoggedIn) {
      router.push("/sign-in");
      return;
    }

    if (plan.planId === "FREE") {
      // Handle downgrade or switch to free if needed
      return;
    }

    setIsDialogOpen(true);
  };

  const confirmPayment = () => {
    startTransition(async () => {
      const result = await createSubscriptionPayment(
        plan.planId,
        selectedProvider
      );

      if (result.error) {
        toast.error("Ошибка", { description: result.error });
      } else if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        // Should not happen for paid plans
        toast.success("Успешно", { description: "Тариф изменен" });
        router.refresh();
        setIsDialogOpen(false);
      }
    });
  };

  return (
    <div
      className={`relative rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-xl flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
        plan.popular
          ? "ring-2 ring-purple-500 shadow-purple-500/20"
          : "border border-slate-200 dark:border-slate-700"
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-medium rounded-full shadow-lg flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          Популярный
        </div>
      )}

      {/* Icon & Name */}
      <div className="mb-6">
        {Icon && (
          <div
            className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${
              plan.gradient || "from-slate-500 to-slate-600"
            } mb-4`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold">{plan.price}</span>
          {plan.period && (
            <span className="text-muted-foreground text-lg">{plan.period}</span>
          )}
        </div>
        {plan.planId !== "FREE" && (
          <p className="text-xs text-muted-foreground mt-1">
            7 дней бесплатного пробного периода
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <div
              className={`rounded-full p-0.5 ${
                plan.popular
                  ? "bg-purple-100 dark:bg-purple-900/30"
                  : "bg-green-100 dark:bg-green-900/30"
              }`}
            >
              <Check
                className={`w-4 h-4 ${
                  plan.popular
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-green-600 dark:text-green-400"
                }`}
              />
            </div>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className={`w-full h-12 text-base font-semibold ${
              plan.popular
                ? "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg shadow-purple-500/25"
                : ""
            }`}
            variant={plan.popular ? "default" : "outline"}
            onClick={handleSubscribe}
            disabled={isPending || isCurrent}
          >
            {isPending
              ? "Обработка..."
              : isCurrent
              ? "✓ Текущий план"
              : plan.planId === "FREE"
              ? "Начать бесплатно"
              : "Выбрать тариф"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Выберите способ оплаты</DialogTitle>
            <DialogDescription>
              Оплата тарифа &quot;{plan.name}&quot; на сумму {plan.price}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <RadioGroup
              value={selectedProvider}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onValueChange={(v) => setSelectedProvider(v as any)}
              className="space-y-3"
            >
              <div
                className={`flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-colors ${
                  selectedProvider === "YOOKASSA"
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <RadioGroupItem value="YOOKASSA" id="yookassa" />
                <Label htmlFor="yookassa" className="flex-1 cursor-pointer">
                  <span className="font-semibold block">ЮKassa</span>
                  <span className="text-sm text-muted-foreground">
                    Банковские карты, SberPay, ЮMoney
                  </span>
                </Label>
              </div>
              <div
                className={`flex items-center space-x-3 border-2 p-4 rounded-xl cursor-pointer transition-colors ${
                  selectedProvider === "ROBOKASSA"
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                }`}
              >
                <RadioGroupItem value="ROBOKASSA" id="robokassa" />
                <Label htmlFor="robokassa" className="flex-1 cursor-pointer">
                  <span className="font-semibold block">Robokassa</span>
                  <span className="text-sm text-muted-foreground">
                    Все популярные способы оплаты
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={confirmPayment}
            disabled={isPending}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
          >
            {isPending ? "Перенаправление..." : "Перейти к оплате →"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
