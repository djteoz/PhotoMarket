"use client";

import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function BannedPage() {
  const { signOut } = useClerk();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Ваш аккаунт заблокирован
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Администрация ограничила ваш доступ к сервису за нарушение правил.
          </p>
        </div>

        <div className="mt-6">
          <Button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="w-full"
          >
            Выйти из аккаунта
          </Button>
        </div>
      </div>
    </div>
  );
}
