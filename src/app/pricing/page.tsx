import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PricingPage() {
  const plans = [
    {
      name: "Базовый",
      price: "0 ₽",
      description: "Для начинающих фотографов и небольших студий",
      features: [
        "Поиск студий",
        "Просмотр контактов",
        "Добавление 1 студии",
        "Базовая поддержка"
      ],
      buttonText: "Начать бесплатно",
      href: "/sign-up",
      popular: false
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
        "Личный менеджер"
      ],
      buttonText: "Выбрать тариф",
      href: "/sign-up?plan=pro",
      popular: true
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
        "Премиум поддержка 24/7"
      ],
      buttonText: "Связаться с нами",
      href: "/contacts",
      popular: false
    }
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Тарифные планы</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Выберите подходящий тариф для развития вашего бизнеса. Прозрачные условия, никаких скрытых платежей.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.name}
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
                {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
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

            <Button asChild variant={plan.popular ? "default" : "outline"} className="w-full">
              <Link href={plan.href}>{plan.buttonText}</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
