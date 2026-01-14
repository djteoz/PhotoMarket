import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { YandexMetrika } from "@/components/analytics/yandex-metrika";
import { Suspense } from "react";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PhotoMarket - Агрегатор фотостудий",
  description: "Найдите и забронируйте лучшую фотостудию для вашей съемки",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon",
    apple: "/icons/icon-192x192.png",
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
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        >
          <Suspense fallback={null}>
            <YandexMetrika />
          </Suspense>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
          <ServiceWorkerRegister />
          <PWAInstallPrompt />
        </body>
      </html>
    </ClerkProvider>
  );
}
