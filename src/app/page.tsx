import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { SearchHero } from "@/components/search/search-hero";
import { prisma } from "@/lib/prisma";
import Image from "next/image";

export default async function Home() {
  const popularStudios = await prisma.studio.findMany({
    take: 3,
    include: {
      rooms: true,
      reviews: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white py-20 px-4">
        <div className="container mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold">
            Найдите идеальную фотостудию
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Тысячи залов для любых съемок. Бронируйте онлайн быстро и удобно.
          </p>

          <SearchHero />
        </div>
      </section>

      {/* Popular Studios Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Популярные студии</h2>
          <Link href="/search">
            <Button variant="outline">Смотреть все</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularStudios.map((studio) => (
            <Link href={`/studios/${studio.id}`} key={studio.id}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                <div className="relative h-48 bg-gray-200">
                  {studio.images[0] ? (
                    <Image
                      src={studio.images[0]}
                      alt={studio.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Нет фото
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    4.9
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{studio.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-center text-gray-500 text-sm mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {studio.city}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {studio.description}
                  </p>
                </CardContent>
                <CardFooter className="border-t pt-4 text-sm text-gray-500">
                  {studio.rooms.length} залов
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Почему выбирают нас
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Удобный поиск</h3>
              <p className="text-gray-600">
                Фильтры по цене, оборудованию и расположению помогут найти то,
                что нужно.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Честные отзывы</h3>
              <p className="text-gray-600">
                Реальные фотографии и отзывы от других фотографов.
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Бронирование онлайн</h3>
              <p className="text-gray-600">
                Мгновенное подтверждение бронирования без звонков
                администратору.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
