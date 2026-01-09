import { prisma } from "@/lib/prisma";
import CreatePostForm from "@/components/forum/create-post-form";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function CreatePostPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const categories = await prisma.forumCategory.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Новая тема</h1>
      <CreatePostForm categories={categories} />
    </div>
  );
}
