"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
} from "@clerk/nextjs";

interface MobileNavProps {
  isAdmin: boolean;
}

export function MobileNav({ isAdmin }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = [
    { href: "/catalog", label: "Каталог студий" },
    { href: "/community", label: "Сообщество" },
    { href: "/about", label: "О нас" },
    { href: "/contacts", label: "Контакты" },
  ];

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b shadow-lg p-4 flex flex-col gap-4 z-50 animate-in slide-in-from-top-5">
          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium p-2 rounded-md hover:bg-gray-100 transition-colors",
                  pathname === link.href && "bg-gray-100 text-primary"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t pt-4 flex flex-col gap-2">
            <SignedIn>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-sm font-medium p-2 rounded-md hover:bg-gray-100 text-red-600"
                >
                  <Shield className="h-4 w-4" />
                  Админ-панель
                </Link>
              )}
              <Link
                href="/dashboard"
                className="text-sm font-medium p-2 rounded-md hover:bg-gray-100"
              >
                Личный кабинет
              </Link>
              <div className="p-2">
                <SignOutButton>
                  <Button variant="outline" className="w-full justify-start">
                    Выйти
                  </Button>
                </SignOutButton>
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline" className="w-full">
                  Войти
                </Button>
              </SignInButton>
              <Link href="/sign-up" className="w-full">
                <Button className="w-full">Регистрация</Button>
              </Link>
            </SignedOut>
          </div>
        </div>
      )}
    </div>
  );
}
