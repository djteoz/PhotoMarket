import { getOwnerAnalytics } from "@/app/actions/analytics";
import { getMyPromotions } from "@/app/actions/promotion";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { PromotionSelector } from "@/components/promotion/promotion-selector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { BarChart3, Rocket, Plus } from "lucide-react";

export default async function OwnerAnalyticsPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    include: {
      studios: {
        select: { id: true, name: true },
      },
    },
  });

  if (!dbUser || dbUser.studios.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-lg mx-auto text-center p-8">
          <CardHeader>
            <CardTitle>У вас пока нет студий</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Добавьте свою первую студию, чтобы видеть аналитику
            </p>
            <Link href="/add-studio">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Добавить студию
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [analytics, promotions] = await Promise.all([
    getOwnerAnalytics(30),
    getMyPromotions(),
  ]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Аналитика
          </h1>
          <p className="text-muted-foreground">
            Статистика ваших студий за последние 30 дней
          </p>
        </div>
      </div>

      {analytics && <AnalyticsDashboard data={analytics} />}

      {/* Active Promotions */}
      {promotions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Активные продвижения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {promotions.map(
                (promo: {
                  id: string;
                  studio: { name: string };
                  type: string;
                  endDate: Date;
                }) => (
                  <div
                    key={promo.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{promo.studio.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {promo.type} • до{" "}
                        {format(promo.endDate, "d MMMM", { locale: ru })}
                      </div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      Активно
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Promotion Options */}
      {dbUser.studios.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Продвинуть студию</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {dbUser.studios.slice(0, 2).map((studio) => (
              <PromotionSelector
                key={studio.id}
                studioId={studio.id}
                studioName={studio.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
