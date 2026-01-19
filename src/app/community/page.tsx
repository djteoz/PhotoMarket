import { prisma } from "@/lib/prisma";
import { ForumSidebar } from "@/components/forum/forum-sidebar";
import { PostCard } from "@/components/forum/post-card";
import { currentUser } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { Users, MessageSquare, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Сообщество фотографов — PhotoMarket",
  description:
    "Присоединяйтесь к сообществу фотографов. Обсуждайте студии, делитесь опытом, находите ассистентов и моделей.",
  keywords: [
    "сообщество фотографов",
    "форум фотографов",
    "фотографы России",
    "обсуждение фотостудий",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const user = await currentUser();

  let dbUser = null;
  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, role: true },
    });
  }

  const where = category ? { category: { slug: category } } : {};

  const posts = await prisma.forumPost.findMany({
    where,
    include: {
      author: true,
      category: true,
      _count: {
        select: { comments: true, likes: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Статистика сообщества
  const [totalPosts, totalComments, totalUsers] = await Promise.all([
    prisma.forumPost.count(),
    prisma.forumComment.count(),
    prisma.user.count(),
  ]);

  // Получаем категорию для заголовка
  const categoryData = category
    ? await prisma.forumCategory.findUnique({ where: { slug: category } })
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-6">
              <Users className="w-4 h-4 text-purple-400" />
              <span>{totalUsers.toLocaleString("ru-RU")} участников</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Сообщество фотографов
            </h1>
            <p className="text-xl text-slate-300 mb-8">
              Обсуждайте студии, делитесь опытом, находите ассистентов и моделей
              для съёмок
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                <span>{totalPosts} тем</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span>{totalComments} комментариев</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 bg-slate-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <ForumSidebar activeCategory={category} />

            {/* Posts */}
            <div className="flex-1 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {categoryData ? categoryData.name : "Последние обсуждения"}
                  </h2>
                  {categoryData?.description && (
                    <p className="text-slate-600 mt-1">
                      {categoryData.description}
                    </p>
                  )}
                </div>
                <Link href="/community/create" className="hidden md:block">
                  <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                    <Sparkles className="w-4 h-4" />
                    Создать тему
                  </Button>
                </Link>
              </div>

              {/* Posts List */}
              <div className="space-y-4">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={dbUser?.id}
                      currentUserRole={dbUser?.role}
                    />
                  ))
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                    <MessageSquare className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      В этой категории пока нет тем
                    </h3>
                    <p className="text-slate-500 mb-6">
                      Станьте первым, кто начнёт обсуждение!
                    </p>
                    <Link href="/community/create">
                      <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                        <Sparkles className="w-4 h-4" />
                        Создать тему
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
