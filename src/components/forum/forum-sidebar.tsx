import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { MessageSquare, Hash } from "lucide-react";

export async function ForumSidebar() {
  const categories = await prisma.forumCategory.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="w-full md:w-64 space-y-4">
      <div className="bg-white p-4 rounded-lg border">
        <Link href="/community/create">
          <Button className="w-full">Создать тему</Button>
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Категории
        </h3>
        <nav className="space-y-1">
          <Link
            href="/community"
            className="block px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md"
          >
            Все темы
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/community?category=${cat.slug}`}
              className="block px-2 py-1.5 text-sm hover:bg-gray-100 rounded-md flex items-center gap-2"
            >
              <Hash className="w-3 h-3 text-muted-foreground" />
              {cat.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
