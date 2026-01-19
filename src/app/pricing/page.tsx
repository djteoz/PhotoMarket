import { PricingCard } from "@/components/pricing/pricing-card";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { SubscriptionPlan } from "@prisma/client";
import { Metadata } from "next";
import {
  Check,
  Shield,
  Zap,
  HeadphonesIcon,
  ArrowRight,
  Gift,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Тарифы и цены — PhotoMarket",
  description:
    "Выберите подходящий тариф для размещения вашей фотостудии. Базовый план бесплатно, PRO от 990₽/мес.",
  openGraph: {
    title: "Тарифы и цены — PhotoMarket",
    description:
      "Прозрачные условия размещения фотостудий. Без скрытых платежей.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

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
      description: "Идеально для старта и знакомства с платформой",
      features: [
        "Поиск студий по всей России",
        "Просмотр контактов студий",
        "Добавление 1 студии",
        "Базовая статистика просмотров",
        "Email поддержка",
      ],
      popular: false,
      planId: "FREE" as SubscriptionPlan,
      iconName: "gift" as const,
      gradient: "from-slate-500 to-slate-600",
    },
    {
      name: "Профессионал",
      price: "990 ₽",
      period: "/мес",
      description: "Для владельцев студий, которые хотят расти",
      features: [
        "Все функции Базового",
        "Добавление до 5 студий",
        "Приоритет в результатах поиска",
        "Расширенная статистика и аналитика",
        "Персональный менеджер",
        "Продвижение в соцсетях",
      ],
      popular: true,
      planId: "PRO" as SubscriptionPlan,
      iconName: "zap" as const,
      gradient: "from-violet-600 to-purple-600",
    },
    {
      name: "Бизнес",
      price: "2990 ₽",
      period: "/мес",
      description: "Максимум возможностей для сетей студий",
      features: [
        "Все функции Профессионал",
        "Неограниченное кол-во студий",
        "API доступ для интеграций",
        "Интеграция с CRM системами",
        "Премиум поддержка 24/7",
        "Индивидуальные условия",
      ],
      popular: false,
      planId: "BUSINESS" as SubscriptionPlan,
      iconName: "shield" as const,
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  const benefits = [
    {
      title: "Без скрытых платежей",
      description: "Цена, которую вы видите — это всё, что вы платите",
    },
    {
      title: "Отмена в любой момент",
      description: "Без штрафов и долгосрочных обязательств",
    },
    {
      title: "7 дней бесплатно",
      description: "Попробуйте PRO тариф бесплатно перед покупкой",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-6">
              <Gift className="w-4 h-4 text-yellow-400" />
              <span>Базовый план — всегда бесплатно</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Простые и честные тарифы
            </h1>

            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Выберите план, который подходит вашему бизнесу. Начните бесплатно
              и масштабируйтесь по мере роста.
            </p>

            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2"
                >
                  <Check className="w-4 h-4 text-green-400" />
                  <span>{benefit.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
              className="dark:fill-slate-950"
            />
          </svg>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto -mt-32 relative z-20">
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
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Сравнение тарифов</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Подробное сравнение возможностей каждого тарифного плана
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700">
                  <th className="text-left p-4 font-semibold">Функция</th>
                  <th className="p-4 font-semibold text-center">Базовый</th>
                  <th className="p-4 font-semibold text-center bg-purple-100 dark:bg-purple-900/30">
                    Профессионал
                  </th>
                  <th className="p-4 font-semibold text-center">Бизнес</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                <tr>
                  <td className="p-4">Количество студий</td>
                  <td className="p-4 text-center">1</td>
                  <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/10">
                    5
                  </td>
                  <td className="p-4 text-center">∞</td>
                </tr>
                <tr>
                  <td className="p-4">Приоритет в поиске</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/10">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4">Аналитика</td>
                  <td className="p-4 text-center">Базовая</td>
                  <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/10">
                    Расширенная
                  </td>
                  <td className="p-4 text-center">Полная</td>
                </tr>
                <tr>
                  <td className="p-4">Поддержка</td>
                  <td className="p-4 text-center">Email</td>
                  <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/10">
                    Персональный менеджер
                  </td>
                  <td className="p-4 text-center">24/7 Премиум</td>
                </tr>
                <tr>
                  <td className="p-4">API доступ</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/10 text-slate-400">
                    —
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="p-4">Продвижение</td>
                  <td className="p-4 text-center text-slate-400">—</td>
                  <td className="p-4 text-center bg-purple-50 dark:bg-purple-900/10">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <Check className="w-5 h-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Частые вопросы о тарифах
            </h2>

            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6">
                <h3 className="font-semibold mb-2">
                  Можно ли отменить подписку?
                </h3>
                <p className="text-muted-foreground">
                  Да, вы можете отменить подписку в любой момент. Доступ к
                  функциям тарифа сохранится до конца оплаченного периода.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6">
                <h3 className="font-semibold mb-2">
                  Как работает пробный период?
                </h3>
                <p className="text-muted-foreground">
                  При оформлении PRO тарифа вы получаете 7 дней бесплатно. Если
                  вам не понравится — просто отмените до окончания пробного
                  периода.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6">
                <h3 className="font-semibold mb-2">
                  Какие способы оплаты принимаете?
                </h3>
                <p className="text-muted-foreground">
                  Банковские карты (Visa, MasterCard, МИР), SberPay, ЮMoney и
                  другие популярные способы через ЮKassa и Robokassa.
                </p>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link href="/faq">
                <Button variant="outline" className="gap-2">
                  Все вопросы и ответы
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-purple-600 to-violet-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <HeadphonesIcon className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-bold mb-4">Нужна помощь с выбором?</h2>
          <p className="text-lg text-purple-100 mb-8 max-w-xl mx-auto">
            Наши специалисты помогут подобрать оптимальный тариф под ваши
            задачи. Консультация бесплатная!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contacts">
              <Button size="lg" variant="secondary" className="gap-2">
                Связаться с нами
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/catalog">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white/10"
              >
                Посмотреть студии
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
