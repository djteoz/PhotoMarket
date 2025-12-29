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

export default async function EditRoomPage({
  params,
}: {
  params: Promise<{ id: string; roomId: string }>;
}) {
  const user = await currentUser();
  const { id, roomId } = await params;

  if (!user) {
    redirect("/sign-in");
  }

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { studio: { include: { owner: true } } },
  });

  if (!room) {
    notFound();
  }

  if (room.studioId !== id) {
    notFound();
  }

  if (room.studio.owner.clerkId !== user.id) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Редактировать зал "{room.name}"</CardTitle>
            <CardDescription>
              Измените информацию о зале.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddRoomForm studioId={id} initialData={room} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
