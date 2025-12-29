import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, MapPin } from "lucide-react";
import { Studio } from "@prisma/client";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      studios: true,
    },
  });

  if (!dbUser) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Личный кабинет</h1>
          <Link href="/add-studio">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Добавить студию
            </Button>
          </Link>
        </div>
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-medium mb-2">Добро пожаловать!</h3>
          <p className="text-gray-500 mb-4">
            Вы успешно вошли, но ваш профиль еще не создан в нашей базе данных.
          </p>
          <p className="text-gray-500 mb-4">
            Попробуйте добавить студию, чтобы завершить настройку.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Мои студии</h1>
        <Link href="/add-studio">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Добавить студию
          </Button>
        </Link>
      </div>

      {dbUser.studios.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <h3 className="text-lg font-medium mb-2">У вас пока нет студий</h3>
          <p className="text-gray-500 mb-4">
            Добавьте свою первую студию, чтобы начать принимать бронирования.
          </p>
          <Link href="/add-studio">
            <Button variant="outline">Добавить студию</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dbUser.studios.map((studio: Studio) => (
            <Card key={studio.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{studio.name}</CardTitle>
                <div className="flex items-center text-gray-500 text-sm gap-1">
                  <MapPin className="h-4 w-4" />
                  {studio.city}, {studio.address}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {studio.description || "Нет описания"}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <Link href={`/studios/${studio.id}`}>Просмотр</Link>
                    </Button>
                    <Button size="sm" className="w-full">
                      Редактировать
                    </Button>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link href={`/studios/${studio.id}/add-room`}>
                      <Plus className="mr-2 h-3 w-3" /> Добавить зал
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
