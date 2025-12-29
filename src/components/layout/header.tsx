import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Camera } from "lucide-react";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Camera className="h-6 w-6" />
          <span>PhotoMarket</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/studios" className="text-sm font-medium hover:underline">
            Каталог студий
          </Link>
          <Link href="/about" className="text-sm font-medium hover:underline">
            О нас
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline">Войти</Button>
            </SignInButton>
            <Link href="/sign-up">
              <Button>Регистрация</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Личный кабинет</Link>
            </Button>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
