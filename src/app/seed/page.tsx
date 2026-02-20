import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SeedPage() {
  const user = await currentUser();
  if (!user) return <div>Auth required</div>;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
  });

  if (dbUser?.role !== "ADMIN" && dbUser?.role !== "OWNER") {
    return <div>Admin access required</div>;
  }

  // Check if we already have studios to avoid duplicates on refresh
  const count = await prisma.studio.count();
  if (count > 0) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Database already seeded</h1>
        <p>Found {count} studios.</p>
        <Button asChild className="mt-4">
          <Link href="/catalog">Go to Catalog</Link>
        </Button>
      </div>
    );
  }

  // Seed Data
  const studios = [
    {
      name: "White Space Studio",
      description:
        "Просторная светлая студия с циклорамой и большими окнами. Идеально подходит для fashion-съемок и портретов.",
      city: "Москва",
      address: "ул. Правды, 24, стр. 3",
      lat: 55.789,
      lng: 37.585,
      images: [
        "https://images.unsplash.com/photo-1596163740269-df427a1c4b9d?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1596163740269-df427a1c4b9d?auto=format&fit=crop&q=80&w=1000",
      ],
      rooms: [
        {
          name: "Зал Циклорама",
          pricePerHour: 1500,
          area: 60,
          hasNaturalLight: true,
          images: [
            "https://images.unsplash.com/photo-1520699049698-acd2fcc51056?auto=format&fit=crop&q=80&w=1000",
          ],
        },
        {
          name: "Зал Интерьер",
          pricePerHour: 1800,
          area: 45,
          hasNaturalLight: true,
          images: [
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1000",
          ],
        },
      ],
    },
    {
      name: "Loft Factory",
      description:
        "Атмосферный лофт с кирпичными стенами и винтажной мебелью. Отлично подходит для контент-съемки.",
      city: "Москва",
      address: "Берсеневская наб., 6",
      lat: 55.741,
      lng: 37.61,
      images: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000",
      ],
      rooms: [
        {
          name: "Основной зал",
          pricePerHour: 2200,
          area: 80,
          hasNaturalLight: false,
          images: [
            "https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&q=80&w=1000",
          ],
        },
      ],
    },
    {
      name: "Neon Vibes",
      description:
        "Креативное пространство с множеством неоновых вывесок и цветным светом.",
      city: "Санкт-Петербург",
      address: "Лиговский пр., 74",
      lat: 59.924,
      lng: 30.358,
      images: [
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000",
      ],
      rooms: [
        {
          name: "Cyber Room",
          pricePerHour: 2500,
          area: 35,
          hasNaturalLight: false,
          images: [
            "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=1000",
          ],
        },
      ],
    },
  ];

  for (const studioData of studios) {
    const { rooms, ...studioInfo } = studioData;
    await prisma.studio.create({
      data: {
        ...studioInfo,
        ownerId: dbUser.id,
        rooms: {
          create: rooms,
        },
      },
    });
  }

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold text-green-600 mb-4">
        Seeding Complete!
      </h1>
      <p>Added 3 studios with rooms.</p>
      <Button asChild className="mt-4">
        <Link href="/catalog">Go to Catalog</Link>
      </Button>
    </div>
  );
}
