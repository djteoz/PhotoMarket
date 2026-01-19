import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Camera,
  Users,
  Building2,
  Target,
  Heart,
  Zap,
  Shield,
  Clock,
  Star,
  ArrowRight,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "О нас",
  description:
    "PhotoMarket — современная платформа для поиска и бронирования фотостудий по всей России. Узнайте о нашей миссии и преимуществах.",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function AboutPage() {
  // Получаем актуальную статистику
  const [studiosCount, usersCount, citiesCount] = await Promise.all([
    prisma.studio.count(),
    prisma.user.count(),
    prisma.studio.groupBy({ by: ["city"] }).then((r) => r.length),
  ]);

  const stats = [
    { label: "Фотостудий", value: `${studiosCount}+`, icon: Building2 },
    { label: "Пользователей", value: `${usersCount}+`, icon: Users },
    { label: "Городов", value: citiesCount.toString(), icon: Target },
  ];

  const features = [
    {
      icon: Zap,
      title: "Быстрое бронирование",
      description: "Забронируйте студию за пару кликов без звонков и переписок",
    },
    {
      icon: Shield,
      title: "Проверенные студии",
      description: "Все студии проходят модерацию перед публикацией",
    },
    {
      icon: Clock,
      title: "Актуальное расписание",
      description:
        "Всегда видите реальную доступность залов в реальном времени",
    },
    {
      icon: Star,
      title: "Честные отзывы",
      description: "Читайте отзывы реальных фотографов перед бронированием",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
              <Heart className="h-4 w-4 text-red-400" />
              <span>Создано для фотографов</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              О{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                PhotoMarket
              </span>
            </h1>

            <p className="text-xl text-slate-300 leading-relaxed">
              Мы создаём современную платформу, которая объединяет владельцев
              фотостудий и фотографов по всей России, делая процесс аренды
              простым и удобным.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                <div className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Наша миссия</h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  Мы верим, что каждый фотограф заслуживает иметь доступ к
                  качественным студиям по прозрачным ценам. Наша цель — убрать
                  все барьеры между творческой идеей и её реализацией.
                </p>
                <p className="text-lg text-slate-600 leading-relaxed">
                  PhotoMarket делает процесс поиска и бронирования студий таким
                  же простым, как заказ такси. Никаких звонков, переписок и
                  ожидания — только несколько кликов до идеальной локации.
                </p>
              </div>

              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <Camera className="h-32 w-32 text-slate-400" />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Проверено</div>
                      <div className="text-sm text-slate-500">
                        Качество гарантировано
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-4">Почему PhotoMarket?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Мы создали сервис, который решает реальные проблемы фотографов и
              владельцев студий
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-slate-700" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* For Who Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Для фотографов */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                  <Camera className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Для фотографов</h3>
                <ul className="space-y-3">
                  {[
                    "Удобный поиск по параметрам и на карте",
                    "Актуальное расписание и мгновенное бронирование",
                    "Честные отзывы и рейтинги студий",
                    "Безопасная онлайн-оплата",
                    "История всех бронирований",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/search" className="inline-block mt-6">
                  <Button className="gap-2">
                    Найти студию
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Для владельцев */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
                  <Building2 className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Для владельцев студий
                </h3>
                <ul className="space-y-3">
                  {[
                    "Бесплатное размещение студии",
                    "Привлечение новых клиентов",
                    "Удобное управление бронированиями",
                    "Гибкая настройка цен и расписания",
                    "Аналитика и статистика посещений",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/add-studio" className="inline-block mt-6">
                  <Button
                    variant="outline"
                    className="gap-2 border-amber-300 hover:bg-amber-100"
                  >
                    Добавить студию
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <Mail className="h-12 w-12 mx-auto text-slate-400 mb-6" />
          <h2 className="text-3xl font-bold mb-4">Остались вопросы?</h2>
          <p className="text-slate-400 max-w-xl mx-auto mb-8">
            Мы всегда рады помочь. Напишите нам, и мы ответим в ближайшее время.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contacts">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-white hover:bg-slate-800"
              >
                Связаться с нами
              </Button>
            </Link>
            <a href="mailto:support@photomarket.tech">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100"
              >
                support@photomarket.tech
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
