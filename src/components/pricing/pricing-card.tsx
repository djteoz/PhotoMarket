"use client";

import { Check } from "lucide-react";
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

interface PricingCardProps {
  plan: {
    name: string;
    price: string;
    period?: string;
    description: string;
    features: string[];
    popular: boolean;
    planId: SubscriptionPlan;
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
      className={`relative rounded-xl border bg-card p-8 shadow-sm flex flex-col ${
        plan.popular ? "border-primary ring-1 ring-primary shadow-md" : ""
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
          Популярный
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{plan.price}</span>
          {plan.period && (
            <span className="text-muted-foreground">{plan.period}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="w-full"
            variant={plan.popular ? "default" : "outline"}
            onClick={handleSubscribe}
            disabled={isPending || isCurrent}
          >
            {isPending
              ? "Обработка..."
              : isCurrent
              ? "Текущий план"
              : "Выбрать тариф"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Выберите способ оплаты</DialogTitle>
            <DialogDescription>
              Оплата тарифа "{plan.name}" на сумму {plan.price}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <RadioGroup
              value={selectedProvider}
              onValueChange={(v) => setSelectedProvider(v as any)}
            >
              <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="YOOKASSA" id="yookassa" />
                <Label
                  htmlFor="yookassa"
                  className="flex-1 cursor-pointer font-medium"
                >
                  ЮKassa (Банковские карты, SberPay)
                </Label>
              </div>
              <div className="flex items-center space-x-2 border p-4 rounded-lg cursor-pointer hover:bg-gray-50">
                <RadioGroupItem value="ROBOKASSA" id="robokassa" />
                <Label
                  htmlFor="robokassa"
                  className="flex-1 cursor-pointer font-medium"
                >
                  Robokassa (Все способы)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={confirmPayment}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "Перенаправление..." : "Перейти к оплате"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
