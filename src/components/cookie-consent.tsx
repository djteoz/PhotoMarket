"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Проверяем, было ли уже согласие
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Показываем баннер через 1 секунду после загрузки
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined");
    localStorage.setItem("cookie-consent-date", new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Icon & Text */}
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl shrink-0">
                <Cookie className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                  Мы используем cookies
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Для улучшения работы сайта и персонализации контента мы используем файлы cookie. 
                  Продолжая использовать сайт, вы соглашаетесь с{" "}
                  <Link 
                    href="/legal/privacy" 
                    className="text-purple-600 hover:underline"
                  >
                    политикой конфиденциальности
                  </Link>.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={declineCookies}
                className="flex-1 sm:flex-none"
              >
                Отклонить
              </Button>
              <Button
                size="sm"
                onClick={acceptCookies}
                className="flex-1 sm:flex-none bg-purple-600 hover:bg-purple-700"
              >
                Принять все
              </Button>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={declineCookies}
              className="absolute top-3 right-3 sm:hidden p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
