import { prisma } from "@/lib/prisma";
import SecurityPage from "./security-client";

export default async function Page() {
  const bannedIps = await prisma.bannedIp.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <SecurityPage initialBannedIps={bannedIps} />;
}
