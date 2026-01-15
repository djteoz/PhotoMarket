import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  Camera,
  MessageSquare,
  User,
  Shield,
  Plus,
  Search,
} from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { MobileNav } from "./mobile-nav";
import { NotificationBell } from "@/components/notifications/notification-bell";

export async function Header() {
  const user = await currentUser();
  let isAdmin = false;
  let notifications: any[] = [];

  if (user) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, role: true },
    });

    if (dbUser) {
      isAdmin =
        dbUser.role === "ADMIN" ||
        dbUser.role === "OWNER" ||
        dbUser.role === "MODERATOR";

      notifications = await prisma.notification.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-xl group"
        >
          <div className="p-1.5 bg-slate-900 rounded-lg group-hover:bg-slate-800 transition-colors">
            <Camera className="h-5 w-5 text-white" />
          </div>
          <span className="hidden sm:inline">PhotoMarket</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/search"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Поиск
          </Link>
          <Link
            href="/catalog"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Каталог
          </Link>
          <Link
            href="/community"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Сообщество
          </Link>
          <Link
            href="/pricing"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Тарифы
          </Link>
          <Link
            href="/about"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            О нас
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <SignedOut>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Войти
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Регистрация</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/add-studio">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Добавить студию
              </Button>
            </Link>

            <div className="w-px h-6 bg-slate-200 mx-1" />

            {isAdmin && (
              <Button
                variant="ghost"
                size="icon"
                asChild
                title="Админ-панель"
                className="h-9 w-9"
              >
                <Link href="/admin">
                  <Shield className="h-5 w-5 text-red-600" />
                </Link>
              </Button>
            )}
            <NotificationBell initialNotifications={notifications} />
            <Button
              variant="ghost"
              size="icon"
              asChild
              title="Сообщения"
              className="h-9 w-9"
            >
              <Link href="/messages">
                <MessageSquare className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              asChild
              title="Профиль"
              className="h-9 w-9"
            >
              <Link href="/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Кабинет</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        <MobileNav isAdmin={isAdmin} />
      </div>
    </header>
  );
}
