import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function FixAdminPage() {
  const user = await currentUser();

  if (!user) {
    return <div>Please sign in first</div>;
  }

  const targetEmail = "1988realmadridcf1988@gmail.com";

  if (user.emailAddresses[0].emailAddress !== targetEmail) {
    return <div>Access denied. This page is only for the owner.</div>;
  }

  await prisma.user.update({
    where: { clerkId: user.id },
    data: { role: "OWNER" },
  });

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold text-green-600 mb-4">Success!</h1>
      <p>You are now an OWNER.</p>
      <p>Email: {user.emailAddresses[0].emailAddress}</p>
      <a href="/admin/users" className="text-blue-500 underline mt-4 block">
        Go to Users
      </a>
    </div>
  );
}
