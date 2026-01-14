"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Eye, MousePointer, Calendar, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  className?: string;
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  className,
}: StatsCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p
            className={cn(
              "text-xs mt-1",
              change >= 0 ? "text-green-600" : "text-red-600"
            )}
          >
            <TrendingUp
              className={cn("w-3 h-3 inline mr-1", change < 0 && "rotate-180")}
            />
            {change >= 0 ? "+" : ""}
            {change}% за период
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface AnalyticsDashboardProps {
  data: {
    dailyData: Array<{
      date: string;
      views: number;
      clicks: number;
      bookings: number;
      revenue: number;
    }>;
    totals: {
      views: number;
      bookings: number;
      revenue: number;
      conversionRate: number;
    };
    studios: Array<{
      id: string;
      name: string;
      views: number;
      bookings: number;
      revenue: number;
    }>;
  };
}

export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Просмотры"
          value={data.totals.views.toLocaleString("ru-RU")}
          icon={<Eye className="h-4 w-4" />}
        />
        <StatsCard
          title="Бронирования"
          value={data.totals.bookings}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatsCard
          title="Доход"
          value={formatCurrency(data.totals.revenue)}
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatsCard
          title="Конверсия"
          value={`${data.totals.conversionRate}%`}
          icon={<MousePointer className="h-4 w-4" />}
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Динамика за период</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-1">
            {data.dailyData.slice(-30).map((day, i) => {
              const maxViews =
                Math.max(...data.dailyData.map((d) => d.views)) || 1;
              const height = (day.views / maxViews) * 100;

              return (
                <div
                  key={i}
                  className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative group"
                  style={{ height: `${Math.max(height, 2)}%` }}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                    {day.date}: {day.views} просм.
                    {day.bookings > 0 && `, ${day.bookings} брон.`}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{data.dailyData[0]?.date}</span>
            <span>{data.dailyData[data.dailyData.length - 1]?.date}</span>
          </div>
        </CardContent>
      </Card>

      {/* Studios Table */}
      <Card>
        <CardHeader>
          <CardTitle>По студиям</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Студия</th>
                  <th className="pb-3 font-medium text-right">Просмотры</th>
                  <th className="pb-3 font-medium text-right">Бронирования</th>
                  <th className="pb-3 font-medium text-right">Доход</th>
                </tr>
              </thead>
              <tbody>
                {data.studios.map((studio) => (
                  <tr key={studio.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{studio.name}</td>
                    <td className="py-3 text-right">
                      {studio.views.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">{studio.bookings}</td>
                    <td className="py-3 text-right">
                      {formatCurrency(studio.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
