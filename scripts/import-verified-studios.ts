/**
 * Импорт верифицированных реальных фотостудий
 *
 * Этот скрипт:
 * 1. Удаляет все тестовые студии
 * 2. Создаёт системного пользователя-владельца
 * 3. Импортирует реальные студии из 6 городов
 *
 * Запуск: npx ts-node scripts/import-verified-studios.ts
 */

import { PrismaClient } from "@prisma/client";
import {
  ALL_VERIFIED_STUDIOS,
  VerifiedStudio,
} from "./verified-real-studios.js";

const prisma = new PrismaClient();

async function clearOldData() {
  console.log("🗑️  Удаление старых тестовых данных...");

  // Удаляем в правильном порядке (от зависимых к независимым)
  await prisma.studioAnalytics.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.studio.deleteMany();

  console.log("✅ Старые данные удалены");
}

async function getOrCreateSystemOwner() {
  // Системный пользователь для импортированных студий
  // Позже можно будет передать права реальным владельцам
  let owner = await prisma.user.findFirst({
    where: { email: "import@photomarket.tech" },
  });

  if (!owner) {
    owner = await prisma.user.create({
      data: {
        clerkId: "system_import_owner_" + Date.now(),
        email: "import@photomarket.tech",
        name: "PhotoMarket (ожидает владельца)",
        role: "OWNER",
      },
    });
    console.log("✅ Создан системный пользователь для импорта");
  }

  return owner;
}

async function importStudio(studio: VerifiedStudio, ownerId: string) {
  // Проверяем, нет ли уже такой студии
  const existing = await prisma.studio.findFirst({
    where: {
      name: studio.name,
      city: studio.city,
    },
  });

  if (existing) {
    console.log(`⏭️  "${studio.name}" уже существует, пропускаем`);
    return null;
  }

  // Создаём студию
  const created = await prisma.studio.create({
    data: {
      name: studio.name,
      description: studio.description,
      address: studio.address,
      city: studio.city,
      lat: studio.lat,
      lng: studio.lng,
      phone: studio.phone,
      email: studio.email || null,
      images: studio.images, // Пустой массив - владельцы загрузят свои фото
      ownerId: ownerId,
    },
  });

  // Создаём залы
  for (const room of studio.rooms) {
    await prisma.room.create({
      data: {
        name: room.name,
        pricePerHour: room.pricePerHour,
        area: room.area,
        hasNaturalLight: room.hasNaturalLight,
        images: [],
        studioId: created.id,
      },
    });
  }

  return created;
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║    ИМПОРТ РЕАЛЬНЫХ ФОТОСТУДИЙ В PHOTOMARKET              ║
╠══════════════════════════════════════════════════════════╣
║  Студии из 6 городов России:                             ║
║  • Москва                                                ║
║  • Санкт-Петербург                                       ║
║  • Екатеринбург                                          ║
║  • Казань                                                ║
║  • Новосибирск                                           ║
║  • Нижний Новгород                                       ║
╚══════════════════════════════════════════════════════════╝
  `);

  // 1. Очищаем старые данные
  await clearOldData();

  // 2. Создаём системного владельца
  const owner = await getOrCreateSystemOwner();
  console.log(`\n👤 Владелец студий: ${owner.email}\n`);

  // 3. Импортируем студии по городам
  let imported = 0;
  let skipped = 0;

  const cityCounts: Record<string, number> = {};

  for (const studio of ALL_VERIFIED_STUDIOS) {
    const result = await importStudio(studio, owner.id);

    if (result) {
      imported++;
      cityCounts[studio.city] = (cityCounts[studio.city] || 0) + 1;
      console.log(
        `✅ ${studio.city}: ${studio.name} (${studio.rooms.length} залов)`
      );
    } else {
      skipped++;
    }
  }

  // 4. Итоги
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                    ИМПОРТ ЗАВЕРШЁН                       ║
╠══════════════════════════════════════════════════════════╣`);

  for (const [city, count] of Object.entries(cityCounts)) {
    console.log(
      `║  ${city.padEnd(25)} ${String(count).padStart(3)} студий          ║`
    );
  }

  console.log(`╠══════════════════════════════════════════════════════════╣
║  Всего импортировано: ${String(imported).padStart(
    3
  )} студий                        ║
║  Пропущено:           ${String(skipped).padStart(
    3
  )}                               ║
╚══════════════════════════════════════════════════════════╝

📝 Следующие шаги:
   1. Связаться с владельцами студий
   2. Верифицировать данные  
   3. Передать им доступ к аккаунтам
   4. Владельцы загрузят свои фотографии
  `);
}

main()
  .catch((e) => {
    console.error("❌ Ошибка:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
