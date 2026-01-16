import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { YandexMetrika } from "@/components/analytics/yandex-metrika";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { OrganizationJsonLd } from "@/components/seo/json-ld";
import { CookieConsent } from "@/components/cookie-consent";
import { TRPCProvider } from "@/components/providers/trpc-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://www.photomarket.tech";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "PhotoMarket — агрегатор фотостудий России",
    template: "%s | PhotoMarket",
  },
  description:
    "Найдите и забронируйте идеальную фотостудию для съёмки в Москве, Санкт-Петербурге и других городах России. Сравнивайте цены, читайте отзывы, бронируйте онлайн.",
  keywords: [
    "фотостудия",
    "аренда фотостудии",
    "фотостудия москва",
    "фотостудия спб",
    "бронирование фотостудии",
    "съёмка в студии",
    "фотосессия",
    "циклорама",
    "фотозал",
  ],
  authors: [{ name: "PhotoMarket" }],
  creator: "PhotoMarket",
  publisher: "PhotoMarket",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PhotoMarket",
  },
  verification: {
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: baseUrl,
    siteName: "PhotoMarket",
    title: "PhotoMarket — агрегатор фотостудий России",
    description:
      "Найдите и забронируйте идеальную фотостудию для съёмки. Сравнивайте цены, читайте отзывы, бронируйте онлайн.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PhotoMarket — агрегатор фотостудий",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PhotoMarket — агрегатор фотостудий России",
    description: "Найдите и забронируйте идеальную фотостудию для съёмки.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ru">
        <head>
          <OrganizationJsonLd />
        </head>
        <body
          className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}
        >
          <TRPCProvider>
            <Suspense fallback={null}>
              <YandexMetrika />
              <GoogleAnalytics />
            </Suspense>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
            <CookieConsent />
            <ServiceWorkerRegister />
            <PWAInstallPrompt />
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
