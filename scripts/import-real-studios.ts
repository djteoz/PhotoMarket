/**
 * Импорт реальных фотостудий в базу данных
 * Запуск: npx ts-node scripts/import-real-studios.ts
 */

import { PrismaClient } from "@prisma/client";
import { ALL_STUDIOS, RealStudio } from "./real-studios-data";

const prisma = new PrismaClient();

async function getOrCreateSystemUser() {
  // Ищем или создаём системного пользователя для импортированных студий
  let systemUser = await prisma.user.findFirst({
    where: { email: "system@photomarket.tech" },
  });

  if (!systemUser) {
    systemUser = await prisma.user.create({
      data: {
        clerkId: "system_import_user",
        email: "system@photomarket.tech",
        name: "PhotoMarket Import",
        role: "ADMIN",
      },
    });
    console.log("✅ Created system user for imports");
  }

  return systemUser;
}

async function importStudio(studio: RealStudio, ownerId: string) {
  // Проверяем, существует ли уже студия с таким названием в городе
  const existing = await prisma.studio.findFirst({
    where: {
      name: studio.name,
      city: studio.city,
    },
  });

  if (existing) {
    console.log(`⏭️  Skipping "${studio.name}" - already exists`);
    return null;
  }

  // Создаём студию
  const createdStudio = await prisma.studio.create({
    data: {
      name: studio.name,
      description: studio.description,
      address: studio.address,
      city: studio.city,
      phone: studio.phone,
      email: studio.email,
      images: studio.images,
      ownerId: ownerId,
    },
  });

  console.log(`✅ Created studio: ${studio.name}`);

  // Создаём залы
  for (const room of studio.rooms) {
    await prisma.room.create({
      data: {
        name: room.name,
        description: room.description,
        pricePerHour: room.pricePerHour,
        area: room.area,
        hasNaturalLight: room.hasNaturalLight,
        images: room.images,
        studioId: createdStudio.id,
      },
    });
    console.log(`   └─ Room: ${room.name}`);
  }

  return createdStudio;
}

async function main() {
  console.log("🚀 Starting real studios import...\n");

  const systemUser = await getOrCreateSystemUser();

  let imported = 0;
  let skipped = 0;

  for (const studio of ALL_STUDIOS) {
    const result = await importStudio(studio, systemUser.id);
    if (result) {
      imported++;
    } else {
      skipped++;
    }
  }

  console.log("\n📊 Import complete:");
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📦 Total in DB: ${await prisma.studio.count()}`);
}

main()
  .catch((e) => {
    console.error("❌ Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
