import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function checkBan() {
  const user = await currentUser();
  if (!user) return;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { isBanned: true, banReason: true },
  });

  if (dbUser?.isBanned) {
    redirect("/banned");
  }
}
