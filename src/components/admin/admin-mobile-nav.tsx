"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Обзор", icon: LayoutDashboard },
    { href: "/admin/tickets", label: "Обращения", icon: MessageSquare },
    { href: "/admin/security", label: "Безопасность", icon: LogOut }, // Using LogOut rotate-90 icon logic in layout, here just LogOut for simplicity or I can rotate it
    { href: "/admin/studios", label: "Студии", icon: Building2 },
    { href: "/admin/users", label: "Пользователи", icon: Users },
  ];

  return (
    <div className="md:hidden bg-white border-b p-4 flex items-center justify-between">
      <div className="font-bold flex items-center gap-2">
        <LayoutDashboard className="w-5 h-5" />
        Admin Panel
      </div>
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-50 p-4 animate-in slide-in-from-top-5">
          <nav className="flex flex-col gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium p-2 rounded-md hover:bg-gray-100 transition-colors",
                    pathname === link.href && "bg-gray-100 text-primary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t my-2" />
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium p-2 rounded-md hover:bg-gray-100 text-red-600"
            >
              <LogOut className="w-4 h-4" />
              Выйти на сайт
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
