import { prisma } from "@/lib/prisma";
import { getCityName, getCitySlug, getCityPrepositional } from "@/lib/cities";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  MapPin,
  Star,
  Camera,
  ArrowRight,
  Building2,
  Search,
  Filter,
} from "lucide-react";
import { BreadcrumbJsonLd, StudiosListJsonLd } from "@/components/seo/json-ld";

// Force dynamic rendering - no static generation at build time
export const dynamic = "force-dynamic";

interface CityPageProps {
  params: Promise<{ slug: string }>;
}

// Skip static generation at build time (would require DB connection)
// Pages will be generated on-demand at runtime
export async function generateStaticParams() {
  // Return empty array to skip build-time generation
  // Cities will be rendered dynamically on first request
  return [];
}

// Генерация метаданных
export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Получаем название города из slug
  const cityName = getCityName(slug);

  if (!cityName) {
    return { title: "Город не найден" };
  }

  const capitalizedCity = cityName.charAt(0).toUpperCase() + cityName.slice(1);
  const cityPrep = getCityPrepositional(cityName);

  const studiosCount = await prisma.studio.count({
    where: { city: { contains: capitalizedCity, mode: "insensitive" } },
  });

  return {
    title: `Фотостудии в ${cityPrep} — ${studiosCount} студий для аренды`,
    description: `Аренда фотостудий в ${cityPrep}. ${studiosCount} студий с актуальными ценами, отзывами и онлайн-бронированием. Найдите идеальный зал для съёмки.`,
    keywords: [
      `фотостудия ${capitalizedCity}`,
      `аренда фотостудии ${capitalizedCity}`,
      `фотозал ${capitalizedCity}`,
      `съёмка в студии ${capitalizedCity}`,
      `бронирование фотостудии ${capitalizedCity}`,
    ],
    openGraph: {
      title: `Фотостудии в ${cityPrep} | PhotoMarket`,
      description: `${studiosCount} фотостудий для аренды в ${cityPrep}. Сравнивайте цены и бронируйте онлайн.`,
    },
    alternates: {
      canonical: `https://www.photomarket.tech/city/${slug}`,
    },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;

  // Получаем название города из slug
  const cityNameLower = getCityName(slug);

  if (!cityNameLower) {
    notFound();
  }

  const cityName =
    cityNameLower.charAt(0).toUpperCase() + cityNameLower.slice(1);
  const cityPrep = getCityPrepositional(cityNameLower);

  // Получаем студии города
  const studios = await prisma.studio.findMany({
    where: {
      city: { contains: cityName, mode: "insensitive" },
    },
    include: {
      rooms: true,
      reviews: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (studios.length === 0) {
    notFound();
  }

  // Статистика
  const totalRooms = studios.reduce((sum, s) => sum + s.rooms.length, 0);
  const studiosWithReviews = studios.filter((s) => s.reviews.length > 0);
  const avgRating =
    studiosWithReviews.length > 0
      ? studiosWithReviews.reduce((sum, s) => {
          const avg =
            s.reviews.reduce((r, review) => r + review.rating, 0) /
            s.reviews.length;
          return sum + avg;
        }, 0) / studiosWithReviews.length
      : null;

  const minPrice = Math.min(
    ...studios.flatMap((s) => s.rooms.map((r) => Number(r.pricePerHour)))
  );

  // Вычисление рейтинга студии (null если нет отзывов)
  const getAverageRating = (reviews: { rating: number }[]): number | null => {
    if (reviews.length === 0) return null;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return Math.round(avg * 10) / 10;
  };

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

  const baseUrl = "https://www.photomarket.tech";

  return (
    <div className="flex flex-col">
      {/* JSON-LD */}
      <BreadcrumbJsonLd
        items={[
          { name: "Главная", url: baseUrl },
          { name: "Города", url: `${baseUrl}/catalog` },
          { name: cityName, url: `${baseUrl}/city/${slug}` },
        ]}
      />
      <StudiosListJsonLd studios={studios} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
              <Link href="/" className="hover:text-white">
                Главная
              </Link>
              <span>/</span>
              <Link href="/catalog" className="hover:text-white">
                Каталог
              </Link>
              <span>/</span>
              <span className="text-white">{cityName}</span>
            </nav>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Фотостудии в {cityPrep}
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              {studios.length}{" "}
              {studios.length === 1
                ? "студия"
                : studios.length < 5
                ? "студии"
                : "студий"}{" "}
              для аренды с онлайн-бронированием
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-slate-400" />
                <span>{studios.length} студий</span>
              </div>
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-slate-400" />
                <span>{totalRooms} залов</span>
              </div>
              {avgRating !== null && (
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  <span>{avgRating.toFixed(1)} средний рейтинг</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-green-400 font-semibold">
                  от {minPrice.toLocaleString("ru-RU")} ₽/час
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="bg-white border-b py-4 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <p className="text-slate-600">
              Найдено: <strong>{studios.length}</strong> студий
            </p>
            <div className="flex gap-2">
              <Link href={`/search?city=${encodeURIComponent(cityName)}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Фильтры
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Studios Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studios.map((studio) => (
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
                      {studio.address || studio.city}
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
                      от {getMinPrice(studio.rooms).toLocaleString("ru-RU")}{" "}
                      ₽/час
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Text Section */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">
              Аренда фотостудий в {cityPrep}
            </h2>
            <div className="prose prose-slate">
              <p>
                На PhotoMarket представлены лучшие фотостудии{" "}
                {cityName.endsWith("а")
                  ? cityName.slice(0, -1) + "ы"
                  : cityName + "а"}{" "}
                для профессиональных съёмок. Все студии проверены нашей командой
                и имеют актуальное расписание для онлайн-бронирования.
              </p>
              <p>
                В нашем каталоге вы найдёте {totalRooms} залов различной площади
                и стилистики: от минималистичных интерьеров до тематических
                локаций. Цены начинаются от {minPrice.toLocaleString("ru-RU")}{" "}
                рублей в час.
              </p>
            </div>

            <div className="mt-8 flex gap-4">
              <Link href={`/search?city=${encodeURIComponent(cityName)}`}>
                <Button className="gap-2">
                  <Search className="h-4 w-4" />
                  Расширенный поиск
                </Button>
              </Link>
              <Link href="/catalog">
                <Button variant="outline" className="gap-2">
                  Все города
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
