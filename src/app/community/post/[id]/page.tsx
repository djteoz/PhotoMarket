import { prisma } from "@/lib/prisma";
import { incrementView } from "@/app/actions/forum";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { CommentSection } from "@/components/forum/comment-section";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { DeletePostButton } from "@/components/forum/delete-post-button";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await currentUser();

  let dbUser = null;
  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, role: true },
    });
  }

  await incrementView(id);

  const post = await prisma.forumPost.findUnique({
    where: { id },
    include: {
      author: true,
      category: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!post) notFound();

  const canDeletePost =
    dbUser?.id === post.authorId ||
    ["ADMIN", "OWNER", "MODERATOR"].includes(dbUser?.role || "");

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary">{post.category.name}</Badge>
          {canDeletePost && <DeletePostButton postId={post.id} />}
        </div>
        <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <span>Автор: {post.author.name}</span>
          <span>•</span>
          <span>
            {format(post.createdAt, "d MMMM yyyy HH:mm", { locale: ru })}
          </span>
          <span>•</span>
          <span>Просмотров: {post.views}</span>
        </div>
      </div>

      <div className="prose max-w-none bg-white p-8 rounded-lg border mb-8">
        <div className="whitespace-pre-wrap">{post.content}</div>
      </div>

      <CommentSection
        postId={post.id}
        comments={post.comments}
        currentUserId={dbUser?.id}
        currentUserRole={dbUser?.role}
      />
    </div>
  );
}
