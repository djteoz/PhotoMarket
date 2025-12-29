import { AddStudioForm } from "@/components/studios/add-studio-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

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
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Редактировать студию</CardTitle>
            <CardDescription>
              Измените информацию о вашей студии.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddStudioForm initialData={studio} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
