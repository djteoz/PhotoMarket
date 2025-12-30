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

  // Clear existing studios to avoid duplicates if running multiple times
  // Note: In a real prod env, be careful with deleteMany!
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.studio.deleteMany();
  console.log("Cleared previous data");

  const studios = [
    {
      name: "Cross Studio City",
      description: "Крупнейший комплекс фотостудий в Москве. Профессиональное оборудование Profoto, разнообразные интерьеры, циклорамы. Идеально для fashion-съемок и масштабных проектов.",
      address: "ул. Правды, 24, стр. 3",
      city: "Москва",
      lat: 55.7896,
      lng: 37.5834,
      phone: "+7 (495) 123-45-67",
      email: "info@cross-studio.ru",
      images: [
        "https://images.unsplash.com/photo-1534349762913-961129fdebe2?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80"
      ],
      rooms: [
        {
          name: "Зал Янтарь",
          pricePerHour: 2200,
          area: 85,
          hasNaturalLight: true,
          images: ["https://images.unsplash.com/photo-1534349762913-961129fdebe2?auto=format&fit=crop&w=1200&q=80"],
        },
        {
          name: "Зал Авангард",
          pricePerHour: 1900,
          area: 60,
          hasNaturalLight: false,
          images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"],
        },
        {
          name: "Циклорама Белая",
          pricePerHour: 1500,
          area: 50,
          hasNaturalLight: false,
          images: ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80"],
        }
      ],
    },
    {
      name: "White Studios на Хохловке",
      description: "Атмосферные лофты в историческом центре Москвы. Кирпичные стены, высокие потолки, винтажная мебель. Прекрасный выбор для свадебных и семейных фотосессий.",
      address: "Хохловский пер., 7-9",
      city: "Москва",
      lat: 55.7552,
      lng: 37.6428,
      phone: "+7 (495) 987-65-43",
      email: "booking@whitestudios.ru",
      images: [
        "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80"
      ],
      rooms: [
        {
          name: "Лофт 1905",
          pricePerHour: 3500,
          area: 120,
          hasNaturalLight: true,
          images: ["https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=1200&q=80"],
        },
        {
          name: "Мансарда",
          pricePerHour: 2800,
          area: 90,
          hasNaturalLight: true,
          images: ["https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80"],
        }
      ],
    },
    {
      name: "The Museum Studio",
      description: "Интерьерная фотостудия с уникальными декорациями в стиле барокко и классицизма. Идеально для портретной съемки и love-story.",
      address: "Кутузовский проспект, 36",
      city: "Москва",
      lat: 55.7415,
      lng: 37.5312,
      phone: "+7 (999) 333-22-11",
      email: "hello@museum-studio.ru",
      images: [
        "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"
      ],
      rooms: [
        {
          name: "Зал Классика",
          pricePerHour: 3000,
          area: 70,
          hasNaturalLight: true,
          images: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"],
        }
      ],
    },
    {
      name: "Zavod Photo",
      description: "Индастриал пространство на территории бывшего завода. Огромные окна, бетонные стены, грузовой лифт. Подходит для видеопродакшна.",
      address: "ул. Электрозаводская, 21",
      city: "Москва",
      lat: 55.7905,
      lng: 37.7065,
      phone: "+7 (903) 555-77-88",
      email: "rent@zavod.ru",
      images: [
        "https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80"
      ],
      rooms: [
        {
          name: "Цех №1",
          pricePerHour: 2000,
          area: 150,
          hasNaturalLight: true,
          images: ["https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&w=1200&q=80"],
        },
        {
          name: "Цех №2 (Темный)",
          pricePerHour: 1800,
          area: 100,
          hasNaturalLight: false,
          images: ["https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80"],
        }
      ],
    },
    {
      name: "Apriori Photo",
      description: "Современная студия с большим выбором бумажных фонов и профессиональным светом Profoto D2. Удобное расположение, гримерные места.",
      address: "Звенигородское шоссе, 3",
      city: "Москва",
      lat: 55.7635,
      lng: 37.5580,
      phone: "+7 (495) 222-33-44",
      email: "admin@apriori.photo",
      images: [
        "https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=1200&q=80"
      ],
      rooms: [
        {
          name: "Зал Фон",
          pricePerHour: 1200,
          area: 40,
          hasNaturalLight: false,
          images: ["https://images.unsplash.com/photo-1527011046414-4781f1f94f8c?auto=format&fit=crop&w=1200&q=80"],
        },
        {
          name: "Зал Циклорама",
          pricePerHour: 1600,
          area: 55,
          hasNaturalLight: false,
          images: ["https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=1200&q=80"],
        }
      ],
    },
    {
      name: "Sunlight Studio",
      description: "Светлая студия с огромными окнами в пол. Минималистичный интерьер, много воздуха и света. Идеально для контент-съемки.",
      address: "Дмитровское шоссе, 9",
      city: "Москва",
      lat: 55.8150,
      lng: 37.5750,
      phone: "+7 (926) 111-00-22",
      email: "sun@light.ru",
      images: [
        "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=1200&q=80"
      ],
      rooms: [
        {
          name: "Зал Air",
          pricePerHour: 2100,
          area: 65,
          hasNaturalLight: true,
          images: ["https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1200&q=80"],
        }
      ],
    }
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
