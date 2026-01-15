import { AddStudioForm } from "@/components/studios/add-studio-form";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Edit } from "lucide-react";

export default async function EditStudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  const { id } = await params;

  if (!user) {
    redirect("/sign-in");
  }

  const studio = await prisma.studio.findUnique({
    where: { id },
    include: { owner: true },
  });

  if (!studio) {
    notFound();
  }

  if (studio.owner.clerkId !== user.id) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <Link
            href={`/studios/${id}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад к студии
          </Link>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Edit className="w-8 h-8 text-purple-400" />
            Редактировать студию
          </h1>
          <p className="text-slate-300">{studio.name}</p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Информация о студии
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Обновите данные вашей фотостудии
              </p>
            </div>
            <div className="p-6">
              <AddStudioForm initialData={studio} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
