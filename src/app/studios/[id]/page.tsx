import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Share, Heart } from "lucide-react";
import Image from "next/image";
import { BookingForm } from "@/components/booking/booking-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default async function StudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const studio = await prisma.studio.findUnique({
    where: { id },
    include: {
      rooms: true,
      reviews: true,
    },
  });

  if (!studio) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{studio.name}</h1>
          <div className="flex items-center text-gray-600 gap-4 text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {studio.city}, {studio.address}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              4.9 (12 отзывов)
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Share className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] mb-12 rounded-xl overflow-hidden">
        <div className="md:col-span-2 h-full bg-gray-200 relative">
          {studio.images[0] ? (
            <Image
              src={studio.images[0]}
              alt={studio.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              Нет фото
            </div>
          )}
        </div>
        <div className="hidden md:grid grid-rows-2 gap-4 h-full">
          <div className="bg-gray-100 relative">
            {studio.images[1] && (
              <Image
                src={studio.images[1]}
                alt={`${studio.name} 2`}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="bg-gray-100 relative">
            {studio.images[2] && (
              <Image
                src={studio.images[2]}
                alt={`${studio.name} 3`}
                fill
                className="object-cover"
              />
            )}
          </div>
        </div>
        <div className="hidden md:grid grid-rows-2 gap-4 h-full">
          <div className="bg-gray-100 relative">
            {studio.images[3] && (
              <Image
                src={studio.images[3]}
                alt={`${studio.name} 4`}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="bg-gray-100 relative">
            {studio.images[4] && (
              <Image
                src={studio.images[4]}
                alt={`${studio.name} 5`}
                fill
                className="object-cover"
              />
            )}
            {studio.images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl cursor-pointer hover:bg-black/60 transition-colors">
                +{studio.images.length - 5}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">О студии</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {studio.description || "Описание отсутствует."}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              Залы ({studio.rooms.length})
            </h2>
            {studio.rooms.length > 0 ? (
              <div className="space-y-4">
                {studio.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="border rounded-lg p-4 flex gap-4"
                  >
                    <div className="w-32 h-24 bg-gray-100 rounded-md flex-shrink-0 relative overflow-hidden">
                      {room.images[0] ? (
                        <Image
                          src={room.images[0]}
                          alt={room.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{room.name}</h3>
                      <p className="text-sm text-gray-500">
                        {room.area} м² • {Number(room.pricePerHour)} ₽/час
                      </p>
                      {room.hasNaturalLight && (
                        <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Естественный свет
                        </span>
                      )}
                    </div>
                    <div className="ml-auto self-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>Забронировать</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Бронирование: {room.name}</DialogTitle>
                            <DialogDescription>
                              Выберите дату и время для бронирования.
                            </DialogDescription>
                          </DialogHeader>
                          <BookingForm roomId={room.id} pricePerHour={Number(room.pricePerHour)} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                В этой студии пока нет добавленных залов.
              </p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="border rounded-xl p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-lg mb-4">Контакты</h3>
            <div className="space-y-3 text-sm">
              {studio.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Телефон</span>
                  <span className="font-medium">{studio.phone}</span>
                </div>
              )}
              {studio.email && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium">{studio.email}</span>
                </div>
              )}
              <div className="pt-4 border-t">
                <Button className="w-full" size="lg">
                  Написать владельцу
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">О студии</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {studio.description || "Описание отсутствует."}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              Залы ({studio.rooms.length})
            </h2>
            {studio.rooms.length > 0 ? (
              <div className="space-y-4">
                {studio.rooms.map((room) => (
                  <div
                    key={room.id}
                    className="border rounded-lg p-4 flex gap-4"
                  >
                    <div className="w-32 h-24 bg-gray-100 rounded-md flex-shrink-0"></div>
                    <div>
                      <h3 className="font-bold text-lg">{room.name}</h3>
                      <p className="text-sm text-gray-500">
                        {room.area} м² • {Number(room.pricePerHour)} ₽/час
                      </p>
                    </div>
                    <div className="ml-auto self-center">
                      <Button>Выбрать</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                В этой студии пока нет добавленных залов.
              </p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="border rounded-xl p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-lg mb-4">Контакты</h3>
            <div className="space-y-3 text-sm">
              {studio.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Телефон</span>
                  <span className="font-medium">{studio.phone}</span>
                </div>
              )}
              {studio.email && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium">{studio.email}</span>
                </div>
              )}
              <div className="pt-4 border-t">
                <Button className="w-full" size="lg">
                  Написать владельцу
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
