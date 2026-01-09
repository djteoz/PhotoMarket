"use client";

import { createComment } from "@/app/actions/forum";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { DeleteCommentButton } from "./delete-comment-button";

export function CommentSection({
  postId,
  comments,
  currentUserId,
  currentUserRole,
}: {
  postId: string;
  comments: any[];
  currentUserId?: string;
  currentUserRole?: string;
}) {
  const { isSignedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) return toast.error("Войдите, чтобы комментировать");

    setLoading(true);
    const formData = new FormData();
    formData.append("content", replyContent);
    formData.append("postId", postId);

    const res = await createComment(formData);
    if (res.error) toast.error(res.error);
    else {
      toast.success("Комментарий добавлен");
      setReplyContent("");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 mt-8">
      <h3 className="text-xl font-bold">Комментарии ({comments.length})</h3>

      {isSignedIn ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Ваш комментарий..."
            required
          />
          <Button type="submit" disabled={loading}>
            Отправить
          </Button>
        </form>
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          Войдите, чтобы оставить комментарий
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => {
          const canDelete =
            currentUserId === comment.authorId ||
            ["ADMIN", "OWNER", "MODERATOR"].includes(currentUserRole || "");

          return (
            <div
              key={comment.id}
              className="bg-white p-4 rounded-lg border group relative"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{comment.author.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {canDelete && <DeleteCommentButton commentId={comment.id} />}
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
