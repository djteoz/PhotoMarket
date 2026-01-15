"use client";

import { useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ShieldX, LogOut, Mail } from "lucide-react";
import Link from "next/link";

export default function BannedPage() {
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
            Аккаунт заблокирован
          </h1>

          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Администрация ограничила ваш доступ к сервису за нарушение правил
            пользования платформой.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => signOut({ redirectUrl: "/" })}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Выйти из аккаунта
            </Button>

            <Link href="/contacts" className="block">
              <Button variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Связаться с поддержкой
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
