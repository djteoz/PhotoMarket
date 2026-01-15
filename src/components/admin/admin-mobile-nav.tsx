"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Building2,
  Shield,
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
    { href: "/admin/security", label: "Безопасность", icon: Shield },
    { href: "/admin/studios", label: "Студии", icon: Building2 },
    { href: "/admin/users", label: "Пользователи", icon: Users },
  ];

  return (
    <div className="md:hidden bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-50">
      <Link href="/admin" className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-slate-900">Админ</span>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="hover:bg-slate-100"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-lg z-50 p-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 text-sm font-medium p-3 rounded-lg transition-all",
                    isActive
                      ? "bg-violet-100 text-violet-700"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                      isActive ? "bg-violet-200" : "bg-slate-100"
                    )}
                  >
                    <Icon
                      className={cn("w-4 h-4", isActive && "text-violet-700")}
                    />
                  </div>
                  {link.label}
                </Link>
              );
            })}
            <div className="border-t border-slate-200 my-2" />
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 text-sm font-medium p-3 rounded-lg text-slate-600 hover:bg-slate-100 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              Вернуться на сайт
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
