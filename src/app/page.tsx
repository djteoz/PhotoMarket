import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  MapPin,
  Star,
  Camera,
  Clock,
  Shield,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { SearchHero } from "@/components/search/search-hero";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function Home() {
  // Получаем данные параллельно для оптимизации
  const [popularStudios, stats, cities] = await Promise.all([
    prisma.studio.findMany({
      take: 6,
      include: {
        rooms: true,
        reviews: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    // Статистика платформы
    Promise.all([
      prisma.studio.count(),
      prisma.room.count(),
      prisma.user.count(),
      prisma.booking.count(),
    ]).then(([studios, rooms, users, bookings]) => ({
      studios,
      rooms,
      users,
      bookings,
    })),
    // Популярные города
    prisma.studio.groupBy({
      by: ["city"],
      _count: { city: true },
      orderBy: { _count: { city: "desc" } },
      take: 6,
    }),
  ]);

  // Вычисляем средний рейтинг для студии (null если нет отзывов)
  const getAverageRating = (reviews: { rating: number }[]): number | null => {
    if (reviews.length === 0) return null;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return Math.round(avg * 10) / 10;
  };

  // Минимальная цена студии
  const getMinPrice = (
    rooms: { pricePerHour: number | { toNumber: () => number } }[]
  ) => {
    if (rooms.length === 0) return 0;
    return Math.min(
      ...rooms.map((r) =>
        typeof r.pricePerHour === "number"
          ? r.pricePerHour
          : Number(r.pricePerHour)
      )
    );
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section - Улучшенный с градиентом */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 px-4 overflow-hidden">
        {/* Декоративные элементы */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span>Более {stats.studios} студий по всей России</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Найдите идеальную
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              фотостудию
            </span>
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            {stats.rooms} залов для любых съемок в {cities.length} городах
            России. Бронируйте онлайн быстро и удобно.
          </p>

          <SearchHero />

          {/* Быстрые ссылки на все города */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {cities.map((city) => (
              <Link
                key={city.city}
                href={`/search?city=${encodeURIComponent(city.city)}`}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm transition-colors"
              >
                {city.city} ({city._count.city})
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-slate-900">
                {stats.studios}+
              </div>
              <div className="text-slate-500 text-sm">Фотостудий</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-slate-900">
                {stats.rooms}+
              </div>
              <div className="text-slate-500 text-sm">Залов</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-slate-900">
                {cities.length}
              </div>
              <div className="text-slate-500 text-sm">Городов</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-slate-900">
                {stats.bookings}+
              </div>
              <div className="text-slate-500 text-sm">Бронирований</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Studios Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold">Популярные студии</h2>
            <p className="text-slate-500 mt-1">
              Лучшие предложения от проверенных студий
            </p>
          </div>
          <Link href="/search">
            <Button variant="outline" className="group">
              Смотреть все
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularStudios.map((studio) => (
            <Link href={`/studios/${studio.id}`} key={studio.id}>
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group border-0 shadow-md">
                <div className="relative h-52 bg-slate-100">
                  {studio.images[0] ? (
                    <Image
                      src={studio.images[0]}
                      alt={studio.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                      <Camera className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {getAverageRating(studio.reviews) !== null ? (
                    <div className="absolute top-3 right-3 bg-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {getAverageRating(studio.reviews)}
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 bg-white/95 px-2.5 py-1 rounded-full text-xs font-medium text-slate-600 shadow-lg">
                      Новая
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-semibold text-lg drop-shadow-lg">
                      {studio.name}
                    </h3>
                  </div>
                </div>
                <CardContent className="flex-1 pt-4">
                  <div className="flex items-center text-slate-500 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-1.5 text-slate-400" />
                    {studio.city}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {studio.description}
                  </p>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between items-center">
                  <span className="text-sm text-slate-500">
                    {studio.rooms.length}{" "}
                    {studio.rooms.length === 1
                      ? "зал"
                      : studio.rooms.length < 5
                      ? "зала"
                      : "залов"}
                  </span>
                  <span className="font-semibold text-slate-900">
                    от {getMinPrice(studio.rooms).toLocaleString("ru-RU")} ₽/час
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Cities Section */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">Студии по городам</h2>
            <p className="text-slate-500 mt-2">
              Найдите фотостудию в вашем городе
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cities.map((city) => (
              <Link
                key={city.city}
                href={`/search?city=${encodeURIComponent(city.city)}`}
                className="group"
              >
                <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm">
                  <Building2 className="h-8 w-8 mx-auto text-slate-400 group-hover:text-slate-900 transition-colors" />
                  <h3 className="font-semibold mt-3 group-hover:text-slate-900">
                    {city.city}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {city._count.city} студий
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Улучшенный */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Почему выбирают PhotoMarket</h2>
            <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
              Мы создали удобный сервис для поиска и бронирования фотостудий
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                <Search className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">Умный поиск</h3>
              <p className="text-slate-600 text-sm">
                Фильтры по цене, оборудованию, площади и расположению
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                <Star className="h-7 w-7 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold">Честные отзывы</h3>
              <p className="text-slate-600 text-sm">
                Реальные фото и отзывы от других фотографов
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                <Clock className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Быстрое бронирование</h3>
              <p className="text-slate-600 text-sm">
                Мгновенное подтверждение без звонков администратору
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                <Shield className="h-7 w-7 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold">Гарантия качества</h3>
              <p className="text-slate-600 text-sm">
                Все студии проходят проверку перед добавлением
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">Как это работает</h2>
            <p className="text-slate-400 mt-2">
              Три простых шага до идеальной съемки
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white font-bold text-xl flex items-center justify-center mx-auto">
                1
              </div>
              <h3 className="text-lg font-semibold">Найдите студию</h3>
              <p className="text-slate-400 text-sm">
                Используйте фильтры для поиска идеального зала под ваши задачи
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white font-bold text-xl flex items-center justify-center mx-auto">
                2
              </div>
              <h3 className="text-lg font-semibold">Забронируйте время</h3>
              <p className="text-slate-400 text-sm">
                Выберите удобную дату и время в интерактивном календаре
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white font-bold text-xl flex items-center justify-center mx-auto">
                3
              </div>
              <h3 className="text-lg font-semibold">Приходите на съемку</h3>
              <p className="text-slate-400 text-sm">
                Получите подтверждение и наслаждайтесь работой в студии
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section for Studio Owners */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />

            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold">
                  У вас есть фотостудия?
                </h2>
                <p className="text-slate-300 text-lg">
                  Присоединяйтесь к PhotoMarket и получайте новых клиентов
                  каждый день. Бесплатная регистрация, простое управление
                  бронированиями.
                </p>

                <ul className="space-y-3">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <span>Бесплатное размещение студии</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <span>Удобный календарь бронирований</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <span>Прямой контакт с клиентами</span>
                  </li>
                </ul>

                <Link href="/add-studio">
                  <Button
                    size="lg"
                    className="bg-white text-slate-900 hover:bg-slate-100"
                  >
                    Добавить студию
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="hidden md:flex items-center justify-center">
                <div className="relative">
                  <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Camera className="h-20 w-20 text-white" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 bg-white text-slate-900 rounded-2xl p-4 shadow-xl">
                    <div className="text-2xl font-bold">{stats.bookings}+</div>
                    <div className="text-sm text-slate-500">бронирований</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community CTA */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <Users className="h-12 w-12 mx-auto text-slate-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">
            Присоединяйтесь к сообществу
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto mb-6">
            Общайтесь с другими фотографами, делитесь опытом и находите
            вдохновение
          </p>
          <Link href="/community">
            <Button variant="outline" size="lg">
              Перейти в сообщество
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
