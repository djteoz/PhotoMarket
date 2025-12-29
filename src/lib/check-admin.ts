import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function checkAdmin() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  let user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
  });

  if (!user) {
    // Sync user if not found
    user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        image: clerkUser.imageUrl,
      },
    });
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}

