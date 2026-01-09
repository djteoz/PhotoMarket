import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { MessageCircle, Eye, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeletePostButton } from "./delete-post-button";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function PostCard({
  post,
  currentUserId,
  currentUserRole,
}: {
  post: any;
  currentUserId?: string;
  currentUserRole?: string;
}) {
  const canDelete =
    currentUserId === post.authorId ||
    ["ADMIN", "OWNER", "MODERATOR"].includes(currentUserRole || "");

  return (
    <div className="bg-white p-6 rounded-lg border hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link
            href={`/community/post/${post.id}`}
            className="text-lg font-semibold hover:text-primary transition-colors"
          >
            {post.title}
          </Link>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>{post.author.name}</span>
            <span>•</span>
            <span>{format(post.createdAt, "d MMM yyyy", { locale: ru })}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{post.category.name}</Badge>
          {canDelete && <DeletePostButton postId={post.id} />}
        </div>
      </div>

      <p className="mt-2 text-gray-600 line-clamp-2">{post.content}</p>

      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          {post.views}
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          {post._count.comments}
        </div>
        <div className="flex items-center gap-1">
          <ThumbsUp className="w-4 h-4" />
          {post._count.likes}
        </div>
      </div>
    </div>
  );
}
