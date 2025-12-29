import { AddRoomForm } from "@/components/rooms/add-room-form";
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

export default async function AddRoomPage({
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
            <CardTitle>Добавить зал в студию "{studio.name}"</CardTitle>
            <CardDescription>
              Заполните информацию о зале, чтобы клиенты могли его бронировать.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddRoomForm studioId={studio.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
