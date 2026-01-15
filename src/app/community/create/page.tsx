import { prisma } from "@/lib/prisma";
import CreatePostForm from "@/components/forum/create-post-form";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles, Lightbulb } from "lucide-react";

export const metadata: Metadata = {
  title: "Создать тему — Сообщество PhotoMarket",
  description: "Создайте новую тему для обсуждения в сообществе фотографов",
};

export default async function CreatePostPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const categories = await prisma.forumCategory.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к сообществу
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Создать тему</h1>
              <p className="text-white/80">
                Поделитесь мыслями с сообществом фотографов
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Form */}
            <div className="lg:col-span-2">
              <CreatePostForm categories={categories} />
            </div>

            {/* Tips Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Советы</h3>
                </div>
                <ul className="space-y-3 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <span className="text-purple-500">•</span>
                    <span>
                      Напишите понятный заголовок, чтобы привлечь внимание
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-500">•</span>
                    <span>Выберите подходящую категорию для вашей темы</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-500">•</span>
                    <span>Опишите вопрос подробно — так легче получить ответ</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-500">•</span>
                    <span>Будьте вежливы и уважайте других участников</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-5">
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-900">Нужна помощь?</strong>
                  <br />
                  Загляните в{" "}
                  <Link href="/faq" className="text-purple-600 hover:underline">
                    FAQ
                  </Link>{" "}
                  или напишите в{" "}
                  <Link
                    href="/contacts"
                    className="text-purple-600 hover:underline"
                  >
                    поддержку
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
