"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 p-8">
        <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
          <WifiOff className="w-12 h-12 text-gray-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900">
          Нет подключения к интернету
        </h1>

        <p className="text-gray-600 max-w-md">
          Проверьте подключение к сети и попробуйте снова. Некоторые страницы
          могут быть доступны из кеша.
        </p>

        <div className="flex gap-4 justify-center">
          <Button onClick={() => window.location.reload()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Попробовать снова
          </Button>

          <Button variant="outline" onClick={() => window.history.back()}>
            Назад
          </Button>
        </div>

        <div className="pt-8 text-sm text-gray-500">
          <p>Доступные офлайн страницы:</p>
          <ul className="mt-2 space-y-1">
            <li>• Главная страница</li>
            <li>• Каталог (последняя версия)</li>
            <li>• Поиск (последняя версия)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
