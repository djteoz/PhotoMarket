"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GA_ID) return;

    const url = pathname + (searchParams.toString() ? `?${searchParams}` : "");

    // @ts-expect-error gtag is loaded externally
    if (typeof window.gtag !== "undefined") {
      // @ts-expect-error gtag is loaded externally
      window.gtag("config", process.env.NEXT_PUBLIC_GA_ID, {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  if (!process.env.NEXT_PUBLIC_GA_ID) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// Утилита для отслеживания событий
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
) {
  if (typeof window !== "undefined") {
    // @ts-expect-error gtag is loaded externally
    if (typeof window.gtag !== "undefined") {
      // @ts-expect-error gtag is loaded externally
      window.gtag("event", action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
    // Также отправляем в Яндекс.Метрику
    // @ts-expect-error ym is loaded externally
    if (
      typeof window.ym !== "undefined" &&
      process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
    ) {
      // @ts-expect-error ym is loaded externally
      window.ym(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID, "reachGoal", action);
    }
  }
}
