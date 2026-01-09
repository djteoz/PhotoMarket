import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      name: "Общее обсуждение",
      slug: "general",
      description: "Все обо всем, что касается фотографии и студий.",
      order: 1,
    },
    {
      name: "Поиск ассистентов и моделей",
      slug: "jobs",
      description: "Вакансии, поиск команды для съемок.",
      order: 2,
    },
    {
      name: "Техника и оборудование",
      slug: "equipment",
      description: "Обсуждение камер, света, объективов.",
      order: 3,
    },
    {
      name: "Отзывы о студиях",
      slug: "studio-reviews",
      description: "Делимся впечатлениями о разных локациях.",
      order: 4,
    },
    {
      name: "Барахолка",
      slug: "market",
      description: "Купля-продажа фототехники (частные объявления).",
      order: 5,
    },
  ];

  for (const cat of categories) {
    await prisma.forumCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    console.log(`Updated category: ${cat.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
