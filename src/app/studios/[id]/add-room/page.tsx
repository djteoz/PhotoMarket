import { AddRoomForm } from "@/components/rooms/add-room-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function AddRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const studio = await prisma.studio.findUnique({
    where: { id },
  });

  if (!studio) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Добавить зал в {studio.name}</CardTitle>
            <CardDescription>
              Заполните информацию о новом зале.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddRoomForm studioId={id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
