"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ensureDbUser } from "@/lib/ensure-db-user";

export async function createPost(formData: FormData) {
  try {
    const { dbUser } = await ensureDbUser();
    if (!dbUser) return { error: "Необходимо авторизоваться" };
    if (dbUser.isBanned) return { error: "Пользователь заблокирован" };

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const categoryId = formData.get("categoryId") as string;

    if (!title || !content || !categoryId) {
      return { error: "Заполните все обязательные поля" };
    }

    const post = await prisma.forumPost.create({
      data: {
        title,
        content,
        categoryId,
        authorId: dbUser.id,
      },
    });

    revalidatePath("/community");
    revalidatePath(`/community/${categoryId}`);
    return { success: true, postId: post.id };
  } catch (error) {
    console.error("Error creating post:", error);
    return { error: "Не удалось создать пост" };
  }
}

export async function createComment(formData: FormData) {
  try {
    const { dbUser } = await ensureDbUser();
    if (!dbUser) return { error: "Необходимо авторизоваться" };
    if (dbUser.isBanned) return { error: "Пользователь заблокирован" };

    const content = formData.get("content") as string;
    const postId = formData.get("postId") as string;
    const parentId = formData.get("parentId") as string | null;

    if (!content || !postId) {
      return { error: "Заполните все обязательные поля" };
    }

    await prisma.forumComment.create({
      data: {
        content,
        postId,
        parentId: parentId || null,
        authorId: dbUser.id,
      },
    });

    revalidatePath(`/community/post/${postId}`);
    return { success: true };
  } catch (error) {
    console.error("Error creating comment:", error);
    return { error: "Не удалось создать комментарий" };
  }
}

export async function togglePostLike(postId: string) {
  try {
    const { dbUser } = await ensureDbUser();
    if (!dbUser) return { error: "Необходимо авторизоваться" };

    const existingLike = await prisma.forumLike.findUnique({
      where: {
        userId_postId: {
          userId: dbUser.id,
          postId,
        },
      },
    });

    if (existingLike) {
      await prisma.forumLike.delete({ where: { id: existingLike.id } });
    } else {
      await prisma.forumLike.create({
        data: {
          userId: dbUser.id,
          postId,
        },
      });
    }

    revalidatePath(`/community/post/${postId}`);
    return { success: true };
  } catch (error) {
    console.error("Error toggling like:", error);
    return { error: "Не удалось обновить лайк" };
  }
}

export async function incrementView(postId: string) {
  try {
    await prisma.forumPost.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });
  } catch (error) {
    // silently fail
  }
}

export async function deletePost(postId: string) {
  try {
    const { dbUser } = await ensureDbUser();
    if (!dbUser) return { error: "Необходимо авторизоваться" };

    const post = await prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) return { error: "Пост не найден" };

    const canDelete =
      dbUser.id === post.authorId ||
      ["ADMIN", "OWNER", "MODERATOR"].includes(dbUser.role);

    if (!canDelete) return { error: "Нет прав для удаления" };

    await prisma.forumPost.delete({ where: { id: postId } });
    revalidatePath("/community");
    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { error: "Не удалось удалить пост" };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const { dbUser } = await ensureDbUser();
    if (!dbUser) return { error: "Необходимо авторизоваться" };

    const comment = await prisma.forumComment.findUnique({
      where: { id: commentId },
    });
    if (!comment) return { error: "Комментарий не найден" };

    const canDelete =
      dbUser.id === comment.authorId ||
      ["ADMIN", "OWNER", "MODERATOR"].includes(dbUser.role);

    if (!canDelete) return { error: "Нет прав для удаления" };

    await prisma.forumComment.delete({ where: { id: commentId } });
    revalidatePath(`/community/post/${comment.postId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { error: "Не удалось удалить комментарий" };
  }
}
