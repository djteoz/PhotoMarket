import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Camera, Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className="text-[150px] md:text-[200px] font-bold text-slate-100 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center animate-pulse">
              <Camera className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
          Страница не найдена
        </h1>

        <p className="text-slate-600 mb-8">
          К сожалению, запрашиваемая страница не существует или была перемещена.
          Возможно, вы перешли по устаревшей ссылке.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto gap-2">
              <Home className="h-4 w-4" />
              На главную
            </Button>
          </Link>
          <Link href="/search">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto gap-2"
            >
              <Search className="h-4 w-4" />
              Найти студию
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t">
          <p className="text-sm text-slate-500 mb-3">Или попробуйте:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link
              href="/catalog"
              className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
            >
              Каталог студий
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/community"
              className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
            >
              Сообщество
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/contacts"
              className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
            >
              Контакты
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
