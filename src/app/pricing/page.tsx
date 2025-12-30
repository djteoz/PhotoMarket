import { PricingCard } from "@/components/pricing/pricing-card";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionPlan } from "@prisma/client";

export default async function PricingPage() {
  const user = await currentUser();
  let currentPlan: SubscriptionPlan = "FREE";

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });
    if (dbUser) {
      currentPlan = dbUser.subscriptionPlan;
    }
  }

  const plans = [
    {
      name: "Базовый",
      price: "0 ₽",
      description: "Для начинающих фотографов и небольших студий",
      features: [
        "Поиск студий",
        "Просмотр контактов",
        "Добавление 1 студии",
        "Базовая поддержка",
      ],
      popular: false,
      planId: "FREE" as SubscriptionPlan,
    },
    {
      name: "Профессионал",
      price: "990 ₽",
      period: "/мес",
      description: "Для активных владельцев студий",
      features: [
        "Все функции Базового",
        "Добавление до 5 студий",
        "Приоритет в поиске",
        "Расширенная статистика",
        "Личный менеджер",
      ],
      popular: true,
      planId: "PRO" as SubscriptionPlan,
    },
    {
      name: "Бизнес",
      price: "2990 ₽",
      period: "/мес",
      description: "Для сетей фотостудий",
      features: [
        "Все функции Профессионал",
        "Неограниченное кол-во студий",
        "API доступ",
        "Интеграция с CRM",
        "Премиум поддержка 24/7",
      ],
      popular: false,
      planId: "BUSINESS" as SubscriptionPlan,
    },
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Тарифные планы</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Выберите подходящий тариф для развития вашего бизнеса. Прозрачные
          условия, никаких скрытых платежей.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <PricingCard
            key={plan.name}
            plan={plan}
            currentPlan={currentPlan}
            isLoggedIn={!!user}
          />
        ))}
      </div>
    </div>
  );
}
