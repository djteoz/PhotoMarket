import { prisma } from "@/lib/prisma";
import { ForumSidebar } from "@/components/forum/forum-sidebar";
import { PostCard } from "@/components/forum/post-card";
import { currentUser } from "@clerk/nextjs/server";

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
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-8">
        <ForumSidebar />

        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">
              {category ? "Темы: " + category : "Последние обсуждения"}
            </h1>
          </div>

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
              <div className="text-center py-12 bg-white rounded-lg border text-muted-foreground">
                В этой категории пока нет тем. Будьте первым!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
