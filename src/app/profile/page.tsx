import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { Metadata } from "next";
import {
  User,
  Mail,
  Shield,
  Camera,
  Heart,
  CalendarDays,
  Crown,
  Building2,
  MessageSquare,
  Star,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Мой профиль — PhotoMarket",
  description: "Управление профилем и настройками аккаунта",
};

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      _count: {
        select: {
          studios: true,
          bookings: true,
          favorites: true,
          reviews: true,
          sentMessages: true,
        },
      },
    },
  });

  if (!dbUser) redirect("/sign-in");

  const subscriptionLabels: Record<string, string> = {
    FREE: "Базовый",
    PRO: "Профессионал",
    BUSINESS: "Бизнес",
  };

  const subscriptionColors: Record<string, string> = {
    FREE: "bg-slate-100 text-slate-700",
    PRO: "bg-purple-100 text-purple-700",
    BUSINESS: "bg-amber-100 text-amber-700",
  };

  const stats = [
    {
      label: "Мои студии",
      value: dbUser._count.studios,
      icon: Building2,
      href: "/dashboard",
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Бронирования",
      value: dbUser._count.bookings,
      icon: CalendarDays,
      href: "/dashboard",
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Избранное",
      value: dbUser._count.favorites,
      icon: Heart,
      href: "/catalog",
      color: "text-red-600 bg-red-100",
    },
    {
      label: "Отзывы",
      value: dbUser._count.reviews,
      icon: Star,
      href: "/dashboard",
      color: "text-yellow-600 bg-yellow-100",
    },
  ];

  const quickLinks = [
    {
      label: "Мои студии",
      href: "/dashboard",
      icon: Building2,
      desc: "Управление студиями",
    },
    {
      label: "Сообщения",
      href: "/messages",
      icon: MessageSquare,
      desc: "Чат с клиентами",
    },
    {
      label: "Добавить студию",
      href: "/add-studio",
      icon: Camera,
      desc: "Новое объявление",
    },
    { label: "Тарифы", href: "/pricing", icon: Crown, desc: "Изменить план" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-3xl font-bold shadow-xl">
                {dbUser.name?.charAt(0).toUpperCase() ||
                  dbUser.email.charAt(0).toUpperCase()}
              </div>
              {dbUser.subscriptionPlan !== "FREE" && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                {dbUser.name || "Пользователь"}
              </h1>
              <p className="text-slate-300 flex items-center justify-center md:justify-start gap-2 mb-3">
                <Mail className="w-4 h-4" />
                {dbUser.email}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subscriptionColors[dbUser.subscriptionPlan]
                  }`}
                >
                  <Crown className="w-3 h-3 inline mr-1" />
                  {subscriptionLabels[dbUser.subscriptionPlan]}
                </span>
                {dbUser.role === "ADMIN" && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                    <Shield className="w-3 h-3 inline mr-1" />
                    Администратор
                  </span>
                )}
                <span className="text-sm text-slate-400">
                  На платформе с{" "}
                  {new Date(dbUser.createdAt).toLocaleDateString("ru-RU", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Quick Action */}
            <div className="flex gap-3">
              <Link href="/dashboard">
                <Button variant="secondary" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  Дашборд
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Личные данные
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Обновите информацию вашего профиля
                </p>
              </div>
              <div className="p-6">
                <ProfileForm
                  user={{
                    id: dbUser.id,
                    email: dbUser.email,
                    name: dbUser.name,
                    phone: dbUser.phone,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="font-bold mb-4">Быстрые действия</h3>
              <div className="space-y-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <link.icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{link.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {link.desc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Subscription Info */}
            <div className="bg-gradient-to-br from-purple-600 to-violet-700 rounded-xl shadow-lg p-6 text-white">
              <Crown className="w-8 h-8 mb-3 opacity-80" />
              <h3 className="font-bold mb-1">
                Тариф: {subscriptionLabels[dbUser.subscriptionPlan]}
              </h3>
              <p className="text-sm text-purple-100 mb-4">
                {dbUser.subscriptionPlan === "FREE"
                  ? "Перейдите на PRO для большего количества функций"
                  : "Спасибо, что выбрали нас!"}
              </p>
              {dbUser.subscriptionPlan === "FREE" && (
                <Link href="/pricing">
                  <Button variant="secondary" size="sm" className="w-full">
                    Улучшить план
                  </Button>
                </Link>
              )}
            </div>

            {/* Security Notice */}
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Безопасность аккаунта</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ваш аккаунт защищен двухфакторной аутентификацией через
                    Clerk
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
