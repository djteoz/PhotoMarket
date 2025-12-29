"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubscriptionPlan } from "@prisma/client";
import { subscribe } from "@/app/actions/subscription";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

export function PricingCard({ plan, currentPlan, isLoggedIn }: PricingCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isCurrent = currentPlan === plan.planId;

  const handleSubscribe = () => {
    if (!isLoggedIn) {
      router.push("/sign-in");
      return;
    }

    if (plan.planId === "FREE") {
        return; // Already free by default
    }

    startTransition(async () => {
      const result = await subscribe(plan.planId);
      if (result.error) {
        toast.error("Ошибка", { description: result.error });
      } else {
        toast.success("Успешно", { description: `Вы перешли на тариф ${plan.name}` });
        router.refresh();
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
        <p className="text-sm text-muted-foreground mt-2">
          {plan.description}
        </p>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button 
        className="w-full" 
        variant={plan.popular ? "default" : "outline"}
        onClick={handleSubscribe}
        disabled={isPending || isCurrent}
      >
        {isPending ? "Обработка..." : isCurrent ? "Текущий план" : "Выбрать тариф"}
      </Button>
    </div>
  );
}
