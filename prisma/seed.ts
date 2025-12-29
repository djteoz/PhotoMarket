import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Create a dummy owner
  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      email: "owner@example.com",
      clerkId: "user_2q3w4e5r6t7y8u9i0o", // Dummy Clerk ID
      name: "Studio Owner",
      role: "OWNER",
    },
  });

  console.log(`Created owner: ${owner.id}`);

  const studios = [
    {
      name: "Loft Moscow Center",
      description: "Стильный лофт в самом центре Москвы с панорамными окнами.",
      address: "ул. Никольская, 10",
      city: "Москва",
      lat: 55.7585,
      lng: 37.6230,
      phone: "+7 (999) 111-22-33",
      email: "loft@moscow.ru",
      images: [
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
      ],
      rooms: [
        {
          name: "Зал White",
          pricePerHour: 2500,
          area: 60,
          hasNaturalLight: true,
          images: ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"],
        },
        {
          name: "Зал Black",
          pricePerHour: 2000,
          area: 45,
          hasNaturalLight: false,
          images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"],
        },
      ],
    },
    {
      name: "Art Space Gorky",
      description: "Творческое пространство рядом с Парком Горького.",
      address: "Крымский вал, 9",
      city: "Москва",
      lat: 55.7315,
      lng: 37.6035,
      phone: "+7 (999) 444-55-66",
      email: "art@gorky.ru",
      images: [
        "https://images.unsplash.com/photo-1534349762913-961129fdebe2?auto=format&fit=crop&w=800&q=80",
      ],
      rooms: [
        {
          name: "Циклорама",
          pricePerHour: 1800,
          area: 50,
          hasNaturalLight: true,
          images: ["https://images.unsplash.com/photo-1534349762913-961129fdebe2?auto=format&fit=crop&w=800&q=80"],
        },
      ],
    },
    {
      name: "VDNH Photo Lab",
      description: "Просторная студия с профессиональным оборудованием.",
      address: "Проспект Мира, 119",
      city: "Москва",
      lat: 55.8265,
      lng: 37.6375,
      phone: "+7 (999) 777-88-99",
      email: "lab@vdnh.ru",
      images: [
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      ],
      rooms: [
        {
          name: "Большой зал",
          pricePerHour: 3000,
          area: 100,
          hasNaturalLight: true,
          images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"],
        },
      ],
    },
  ];

  for (const studioData of studios) {
    const { rooms, ...studioInfo } = studioData;
    const studio = await prisma.studio.create({
      data: {
        ...studioInfo,
        ownerId: owner.id,
        rooms: {
          create: rooms,
        },
      },
    });
    console.log(`Created studio: ${studio.name}`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
