import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Camera, MessageSquare, User, Shield } from "lucide-react";
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
    <header className="border-b relative">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Camera className="h-6 w-6" />
          <span>PhotoMarket</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/catalog" className="text-sm font-medium hover:underline">
            Каталог студий
          </Link>
          <Link
            href="/community"
            className="text-sm font-medium hover:underline"
          >
            Сообщество
          </Link>
          <Link href="/about" className="text-sm font-medium hover:underline">
            О нас
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline">Войти</Button>
            </SignInButton>
            <Link href="/sign-up">
              <Button>Регистрация</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            {isAdmin && (
              <Button variant="ghost" size="icon" asChild title="Админ-панель">
                <Link href="/admin">
                  <Shield className="h-5 w-5 text-red-600" />
                </Link>
              </Button>
            )}
            <NotificationBell initialNotifications={notifications} />
            <Button variant="ghost" size="icon" asChild title="Сообщения">
              <Link href="/messages">
                <MessageSquare className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild title="Профиль">
              <Link href="/profile">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" asChild>
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
