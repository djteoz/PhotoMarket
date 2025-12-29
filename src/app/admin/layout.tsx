import { checkAdmin } from "@/lib/check-admin";
import Link from "next/link";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Building2,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAdmin();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6" />
            Admin Panel
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Обзор
            </Button>
          </Link>
          <Link href="/admin/tickets">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <MessageSquare className="w-4 h-4" />
              Обращения
            </Button>
          </Link>
          <Link href="/admin/studios">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Building2 className="w-4 h-4" />
              Студии
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Users className="w-4 h-4" />
              Пользователи
            </Button>
          </Link>
        </nav>

        <div className="p-4 border-t">
          <Link href="/">
            <Button variant="outline" className="w-full justify-start gap-2">
              <LogOut className="w-4 h-4" />
              Вернуться на сайт
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
