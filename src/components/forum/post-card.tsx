import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { MessageCircle, Eye, ThumbsUp, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeletePostButton } from "./delete-post-button";
import Image from "next/image";

// Цвета для категорий
const categoryColors: Record<string, string> = {
  "общее-обсуждение": "bg-blue-100 text-blue-700 hover:bg-blue-200",
  "поиск-ассистентов-и-моделей": "bg-green-100 text-green-700 hover:bg-green-200",
  "техника-и-оборудование": "bg-orange-100 text-orange-700 hover:bg-orange-200",
  "отзывы-о-студиях": "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  барахолка: "bg-purple-100 text-purple-700 hover:bg-purple-200",
};

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

  const categoryColor =
    categoryColors[post.category.slug] ||
    "bg-slate-100 text-slate-700 hover:bg-slate-200";

  return (
    <div className="bg-white rounded-xl border hover:shadow-md transition-all duration-200 overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Author Avatar */}
          <div className="hidden sm:block flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center overflow-hidden">
              {post.author.image ? (
                <Image
                  src={post.author.image}
                  alt={post.author.name || "User"}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <Link
                  href={`/community/post/${post.id}`}
                  className="text-lg font-semibold text-slate-900 hover:text-purple-600 transition-colors line-clamp-1 block"
                >
                  {post.title}
                </Link>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Link
                    href={`/community?category=${post.category.slug}`}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${categoryColor}`}
                  >
                    {post.category.name}
                  </Link>
                </div>
              </div>
              {canDelete && (
                <div className="flex-shrink-0">
                  <DeletePostButton postId={post.id} />
                </div>
              )}
            </div>

            <p className="mt-3 text-slate-600 line-clamp-2 text-sm leading-relaxed">
              {post.content}
            </p>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <span className="font-medium text-slate-700">
                  {post.author.name || "Пользователь"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(post.createdAt, "d MMM", { locale: ru })}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1.5 hover:text-purple-600 transition-colors">
                  <Eye className="w-4 h-4" />
                  <span>{post.views}</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-purple-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post._count.comments}</span>
                </div>
                <div className="flex items-center gap-1.5 hover:text-purple-600 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{post._count.likes}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
