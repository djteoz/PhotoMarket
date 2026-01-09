"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) throw new Error("User not found");
  if (dbUser.isBanned) throw new Error("User is banned");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const categoryId = formData.get("categoryId") as string;

  if (!title || !content || !categoryId) {
    return { error: "Missing required fields" };
  }

  try {
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
    return { error: "Failed to create post" };
  }
}

export async function createComment(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) throw new Error("User not found");
  if (dbUser.isBanned) throw new Error("User is banned");

  const content = formData.get("content") as string;
  const postId = formData.get("postId") as string;
  const parentId = formData.get("parentId") as string | null;

  if (!content || !postId) {
    return { error: "Missing content or post ID" };
  }

  try {
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
    return { error: "Failed to create comment" };
  }
}

export async function togglePostLike(postId: string) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized" };

  const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return { error: "User not found" };

  try {
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
    return { error: "Failed to update like" };
  }
}

export async function incrementView(postId: string) {
  await prisma.forumPost.update({
    where: { id: postId },
    data: { views: { increment: 1 } },
  });
}

export async function deletePost(postId: string) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized" };
  const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return { error: "User not found" };

  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (!post) return { error: "Post not found" };

  const canDelete =
    dbUser.id === post.authorId ||
    ["ADMIN", "OWNER", "MODERATOR"].includes(dbUser.role);

  if (!canDelete) return { error: "Permission denied" };

  await prisma.forumPost.delete({ where: { id: postId } });
  revalidatePath("/community");
  return { success: true };
}

export async function deleteComment(commentId: string) {
  const user = await currentUser();
  if (!user) return { error: "Unauthorized" };
  const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
  if (!dbUser) return { error: "User not found" };

  const comment = await prisma.forumComment.findUnique({
    where: { id: commentId },
  });
  if (!comment) return { error: "Comment not found" };

  const canDelete =
    dbUser.id === comment.authorId ||
    ["ADMIN", "OWNER", "MODERATOR"].includes(dbUser.role);

  if (!canDelete) return { error: "Permission denied" };

  await prisma.forumComment.delete({ where: { id: commentId } });
  revalidatePath(`/community/post/${comment.postId}`);
  return { success: true };
}
