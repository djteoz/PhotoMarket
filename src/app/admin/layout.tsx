import { checkAdmin } from "@/lib/check-admin";
import Link from "next/link";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Building2,
  Shield,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAdmin();

  const navItems = [
    { href: "/admin", label: "Обзор", icon: LayoutDashboard },
    { href: "/admin/tickets", label: "Обращения", icon: MessageSquare },
    { href: "/admin/security", label: "Безопасность", icon: Shield },
    { href: "/admin/studios", label: "Студии", icon: Building2 },
    { href: "/admin/users", label: "Пользователи", icon: Users },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <AdminMobileNav />

      {/* Sidebar */}
      <aside className="w-72 bg-white/80 backdrop-blur-sm border-r border-slate-200 hidden md:flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">PhotoMarket</h1>
              <p className="text-xs text-slate-500">Панель администратора</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
            Меню
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-11 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                    <Icon className="w-4 h-4 group-hover:text-violet-600 transition-colors" />
                  </div>
                  <span className="font-medium">{item.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <Link href="/">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-11 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <LogOut className="w-4 h-4 text-slate-500" />
              <span className="text-slate-600">Вернуться на сайт</span>
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
