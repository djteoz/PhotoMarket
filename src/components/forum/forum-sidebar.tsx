import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Hash,
  Sparkles,
  Users,
  ShoppingBag,
  Wrench,
  Star,
  MessagesSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Иконки для категорий
const categoryIcons: Record<string, React.ReactNode> = {
  "общее-обсуждение": <MessagesSquare className="w-4 h-4" />,
  "поиск-ассистентов-и-моделей": <Users className="w-4 h-4" />,
  "техника-и-оборудование": <Wrench className="w-4 h-4" />,
  "отзывы-о-студиях": <Star className="w-4 h-4" />,
  барахолка: <ShoppingBag className="w-4 h-4" />,
};

// Цвета для категорий
const categoryColors: Record<string, string> = {
  "общее-обсуждение": "text-blue-600 bg-blue-100",
  "поиск-ассистентов-и-моделей": "text-green-600 bg-green-100",
  "техника-и-оборудование": "text-orange-600 bg-orange-100",
  "отзывы-о-студиях": "text-yellow-600 bg-yellow-100",
  барахолка: "text-purple-600 bg-purple-100",
};

interface ForumSidebarProps {
  activeCategory?: string;
}

export async function ForumSidebar({ activeCategory }: ForumSidebarProps) {
  const categories = await prisma.forumCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return (
    <div className="w-full lg:w-72 space-y-4">
      {/* Create Button */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        <Link href="/community/create">
          <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700 h-11">
            <Sparkles className="w-4 h-4" />
            Создать тему
          </Button>
        </Link>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-slate-50">
          <h3 className="font-semibold flex items-center gap-2 text-slate-900">
            <MessageSquare className="w-4 h-4 text-purple-600" />
            Категории
          </h3>
        </div>
        <nav className="p-2">
          <Link
            href="/community"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors",
              !activeCategory
                ? "bg-purple-100 text-purple-700 font-medium"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                !activeCategory ? "bg-purple-200" : "bg-slate-100"
              )}
            >
              <Hash className="w-4 h-4" />
            </div>
            <span className="flex-1">Все темы</span>
          </Link>

          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            const icon = categoryIcons[cat.slug] || <Hash className="w-4 h-4" />;
            const colorClass = categoryColors[cat.slug] || "text-slate-600 bg-slate-100";

            return (
              <Link
                key={cat.id}
                href={`/community?category=${cat.slug}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-colors mt-1",
                  isActive
                    ? "bg-purple-100 text-purple-700 font-medium"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    isActive ? "bg-purple-200" : colorClass
                  )}
                >
                  {icon}
                </div>
                <span className="flex-1">{cat.name}</span>
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    isActive
                      ? "bg-purple-200 text-purple-700"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {cat._count.posts}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
        <h4 className="font-semibold text-slate-900 mb-2">
          💡 Правила сообщества
        </h4>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• Уважайте других участников</li>
          <li>• Не размещайте спам и рекламу</li>
          <li>• Пишите по теме категории</li>
        </ul>
      </div>
    </div>
  );
}
