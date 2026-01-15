import { AddStudioForm } from "@/components/studios/add-studio-form";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import {
  Camera,
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Добавить студию — PhotoMarket",
  description:
    "Добавьте вашу фотостудию на PhotoMarket и начните принимать бронирования онлайн",
};

export default async function AddStudioPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const benefits = [
    "Онлайн-бронирование 24/7",
    "Управление расписанием",
    "Статистика и аналитика",
    "Отзывы клиентов",
    "Продвижение студии",
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>Бесплатное размещение</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Добавить{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                фотостудию
              </span>
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Разместите вашу студию на PhotoMarket и начните получать
              бронирования от фотографов по всей России
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-purple-600" />
                    Информация о студии
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Заполните данные о вашей фотостудии
                  </p>
                </div>
                <div className="p-6">
                  <AddStudioForm />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Benefits Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Преимущества размещения
                </h3>
                <ul className="space-y-3">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips Card */}
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800">
                <h3 className="font-bold mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Info className="w-5 h-5" />
                  Советы по размещению
                </h3>
                <ul className="space-y-2 text-sm text-purple-600 dark:text-purple-300">
                  <li>• Добавьте качественные фото интерьера</li>
                  <li>• Укажите точный адрес</li>
                  <li>• Подробно опишите оборудование</li>
                  <li>• Добавьте несколько залов</li>
                </ul>
              </div>

              {/* PRO Card */}
              <div className="bg-gradient-to-br from-purple-600 to-violet-700 rounded-2xl shadow-lg p-6 text-white">
                <Camera className="w-8 h-8 mb-3 opacity-80" />
                <h3 className="font-bold mb-2">Продвиньте студию</h3>
                <p className="text-sm text-purple-100 mb-4">
                  С тарифом PRO ваша студия будет показываться выше в поиске
                </p>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  Узнать о тарифах
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
