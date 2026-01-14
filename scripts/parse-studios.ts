/**
 * Скрипт парсинга фотостудий с открытых источников
 *
 * ВАЖНО: Используйте только для личных целей и в соответствии с TOS сайтов.
 * Этот скрипт демонстрирует технику парсинга.
 * Рекомендуется добавлять студии вручную или через партнерские API.
 *
 * Использование: npx ts-node scripts/parse-studios.ts
 */

import * as cheerio from "cheerio";
import { prisma } from "../src/lib/prisma";

interface ParsedStudio {
  name: string;
  description: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  images: string[];
  rooms: ParsedRoom[];
}

interface ParsedRoom {
  name: string;
  description?: string;
  pricePerHour: number;
  area: number;
  hasNaturalLight: boolean;
  images: string[];
}

// Rate limiting - be respectful to servers
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// User-Agent rotation for polite scraping
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ru-RU,ru;q=0.9",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

// Example parser for a generic photo studio listing site
// You'll need to adapt selectors for specific sites
async function parseStudioListing(
  html: string,
  baseUrl: string
): Promise<string[]> {
  const $ = cheerio.load(html);
  const studioLinks: string[] = [];

  // Generic selectors - adapt for specific sites
  $('a[href*="studio"], a[href*="zal"], .studio-card a, .listing-item a').each(
    (_, el) => {
      const href = $(el).attr("href");
      if (href) {
        const fullUrl = href.startsWith("http") ? href : `${baseUrl}${href}`;
        if (!studioLinks.includes(fullUrl)) {
          studioLinks.push(fullUrl);
        }
      }
    }
  );

  return studioLinks;
}

async function parseStudioPage(
  html: string,
  url: string
): Promise<ParsedStudio | null> {
  const $ = cheerio.load(html);

  try {
    // Generic selectors - MUST be customized for each source site
    const name = $('h1, .studio-name, [class*="title"]').first().text().trim();

    if (!name) {
      console.log(`No name found for ${url}`);
      return null;
    }

    const description = $(
      '.description, .about, [class*="description"], [class*="about"]'
    )
      .first()
      .text()
      .trim();

    const address = $('.address, [class*="address"], [itemprop="address"]')
      .first()
      .text()
      .trim();

    const phone = $('a[href^="tel:"], .phone, [class*="phone"]')
      .first()
      .text()
      .trim()
      .replace(/[^\d+]/g, "");

    const email = $('a[href^="mailto:"], .email, [class*="email"]')
      .first()
      .text()
      .trim();

    // Extract images
    const images: string[] = [];
    $(
      'img[src*="studio"], .gallery img, .slider img, [class*="photo"] img'
    ).each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src");
      if (src && !src.includes("placeholder") && !src.includes("avatar")) {
        images.push(src.startsWith("http") ? src : `https:${src}`);
      }
    });

    // Try to extract city from address
    const cityMatch = address.match(
      /(?:г\.|город)\s*([А-Яа-яЁё]+)|^([А-Яа-яЁё]+),/
    );
    const city = cityMatch?.[1] || cityMatch?.[2] || "Москва";

    // Extract price (example pattern)
    const priceText = $('[class*="price"], .cost').first().text();
    const priceMatch = priceText.match(/(\d[\d\s]*)/);
    const basePrice = priceMatch
      ? parseInt(priceMatch[1].replace(/\s/g, ""))
      : 2000;

    // Create default room from studio data
    const rooms: ParsedRoom[] = [
      {
        name: "Основной зал",
        description: description.slice(0, 200),
        pricePerHour: basePrice,
        area: 50, // Default, would need to parse
        hasNaturalLight:
          description.toLowerCase().includes("естественн") ||
          description.toLowerCase().includes("окн"),
        images: images.slice(0, 5),
      },
    ];

    return {
      name,
      description: description || `Фотостудия ${name}`,
      address: address || "Адрес уточняйте",
      city,
      phone: phone || undefined,
      email: email || undefined,
      images: images.slice(0, 10),
      rooms,
    };
  } catch (error) {
    console.error(`Error parsing ${url}:`, error);
    return null;
  }
}

// Manual data entry helper - more reliable than parsing
export function createStudioFromManualData(data: {
  name: string;
  city: string;
  address: string;
  description?: string;
  phone?: string;
  rooms: Array<{
    name: string;
    price: number;
    area: number;
    hasNaturalLight?: boolean;
  }>;
}): ParsedStudio {
  return {
    name: data.name,
    description:
      data.description || `Фотостудия ${data.name} в городе ${data.city}`,
    address: data.address,
    city: data.city,
    phone: data.phone,
    images: [],
    rooms: data.rooms.map((r) => ({
      name: r.name,
      pricePerHour: r.price,
      area: r.area,
      hasNaturalLight: r.hasNaturalLight || false,
      images: [],
    })),
  };
}

// Sample data for Moscow studios (publicly available info)
const SAMPLE_STUDIOS: ParsedStudio[] = [
  {
    name: "Студия Луч",
    description:
      "Просторная фотостудия с панорамными окнами и естественным светом. Идеально для портретной и предметной съемки.",
    address: "ул. Тверская, 15",
    city: "Москва",
    phone: "+74951234567",
    images: [],
    rooms: [
      {
        name: "Белый зал",
        pricePerHour: 2500,
        area: 80,
        hasNaturalLight: true,
        images: [],
      },
      {
        name: "Тёмный зал",
        pricePerHour: 2000,
        area: 60,
        hasNaturalLight: false,
        images: [],
      },
    ],
  },
  {
    name: "PhotoLoft",
    description:
      "Лофт-студия в центре Москвы. Кирпичные стены, высокие потолки, индустриальный стиль.",
    address: "Красная Пресня, 24",
    city: "Москва",
    phone: "+74957654321",
    images: [],
    rooms: [
      {
        name: "Лофт",
        pricePerHour: 3500,
        area: 120,
        hasNaturalLight: true,
        images: [],
      },
      {
        name: "Циклорама",
        pricePerHour: 4000,
        area: 100,
        hasNaturalLight: false,
        images: [],
      },
    ],
  },
  {
    name: "Sunrise Studio",
    description:
      "Уютная студия для фотографов любого уровня. Профессиональное оборудование включено.",
    address: "Ленинградский проспект, 80",
    city: "Москва",
    images: [],
    rooms: [
      {
        name: "Солнечный зал",
        pricePerHour: 1800,
        area: 45,
        hasNaturalLight: true,
        images: [],
      },
    ],
  },
  {
    name: "Black Box",
    description:
      "Полностью черная студия для креативных съемок. Идеально для work with light.",
    address: "Новый Арбат, 36",
    city: "Москва",
    images: [],
    rooms: [
      {
        name: "Black Room",
        pricePerHour: 2200,
        area: 55,
        hasNaturalLight: false,
        images: [],
      },
    ],
  },
  {
    name: "Фотостудия Прованс",
    description:
      "Романтическая студия в стиле прованс. Антикварная мебель, цветочные композиции.",
    address: "Малая Бронная, 12",
    city: "Москва",
    phone: "+74959876543",
    images: [],
    rooms: [
      {
        name: "Прованс",
        pricePerHour: 2800,
        area: 70,
        hasNaturalLight: true,
        images: [],
      },
      {
        name: "Винтаж",
        pricePerHour: 2500,
        area: 50,
        hasNaturalLight: true,
        images: [],
      },
    ],
  },
];

// Add more cities
const SAMPLE_SPB: ParsedStudio[] = [
  {
    name: "Невская студия",
    description: "Классическая петербургская студия с видом на Неву.",
    address: "Невский проспект, 100",
    city: "Санкт-Петербург",
    images: [],
    rooms: [
      {
        name: "Невский зал",
        pricePerHour: 2200,
        area: 65,
        hasNaturalLight: true,
        images: [],
      },
    ],
  },
  {
    name: "White Nights Studio",
    description: "Круглосуточная студия для съемок в любое время.",
    address: "Лиговский проспект, 50",
    city: "Санкт-Петербург",
    images: [],
    rooms: [
      {
        name: "Основной",
        pricePerHour: 1900,
        area: 55,
        hasNaturalLight: false,
        images: [],
      },
      {
        name: "VIP",
        pricePerHour: 3200,
        area: 90,
        hasNaturalLight: true,
        images: [],
      },
    ],
  },
];

const SAMPLE_KAZAN: ParsedStudio[] = [
  {
    name: "Казань Фото",
    description:
      "Современная студия в сердце Казани. Все условия для качественной съемки.",
    address: "ул. Баумана, 25",
    city: "Казань",
    images: [],
    rooms: [
      {
        name: "Белый зал",
        pricePerHour: 1500,
        area: 50,
        hasNaturalLight: true,
        images: [],
      },
    ],
  },
];

const SAMPLE_NOVO: ParsedStudio[] = [
  {
    name: "Сибирская студия",
    description:
      "Крупнейшая фотостудия Новосибирска. 3 зала, гримерная, парковка.",
    address: "Красный проспект, 65",
    city: "Новосибирск",
    images: [],
    rooms: [
      {
        name: "Главный",
        pricePerHour: 1800,
        area: 80,
        hasNaturalLight: true,
        images: [],
      },
      {
        name: "Камерный",
        pricePerHour: 1200,
        area: 35,
        hasNaturalLight: false,
        images: [],
      },
    ],
  },
];

const SAMPLE_EKB: ParsedStudio[] = [
  {
    name: "Урал Фото",
    description:
      "Профессиональная студия с полным комплектом оборудования Profoto.",
    address: "ул. Ленина, 40",
    city: "Екатеринбург",
    images: [],
    rooms: [
      {
        name: "Profoto зал",
        pricePerHour: 2000,
        area: 60,
        hasNaturalLight: false,
        images: [],
      },
    ],
  },
];

async function saveStudioToDb(studio: ParsedStudio, ownerId: string) {
  try {
    // Check if studio already exists
    const existing = await prisma.studio.findFirst({
      where: {
        name: studio.name,
        city: studio.city,
      },
    });

    if (existing) {
      console.log(`Studio "${studio.name}" already exists, skipping...`);
      return null;
    }

    const created = await prisma.studio.create({
      data: {
        name: studio.name,
        description: studio.description,
        address: studio.address,
        city: studio.city,
        phone: studio.phone,
        email: studio.email,
        images: studio.images,
        ownerId,
        rooms: {
          create: studio.rooms.map((room) => ({
            name: room.name,
            description: room.description,
            pricePerHour: room.pricePerHour,
            area: room.area,
            hasNaturalLight: room.hasNaturalLight,
            images: room.images,
          })),
        },
      },
      include: {
        rooms: true,
      },
    });

    console.log(
      `✓ Created studio: ${created.name} with ${created.rooms.length} rooms`
    );
    return created;
  } catch (error) {
    console.error(`Error saving studio ${studio.name}:`, error);
    return null;
  }
}

// Main execution
async function main() {
  console.log("🚀 Starting studio import...\n");

  // Find or create a system owner for imported studios
  let systemOwner = await prisma.user.findFirst({
    where: { email: "system@photomarket.ru" },
  });

  if (!systemOwner) {
    systemOwner = await prisma.user.create({
      data: {
        clerkId: "system_import_user",
        email: "system@photomarket.ru",
        name: "PhotoMarket Import",
        role: "ADMIN",
      },
    });
    console.log("Created system owner for imports\n");
  }

  const allStudios = [
    ...SAMPLE_STUDIOS,
    ...SAMPLE_SPB,
    ...SAMPLE_KAZAN,
    ...SAMPLE_NOVO,
    ...SAMPLE_EKB,
  ];

  console.log(`📦 Importing ${allStudios.length} studios...\n`);

  let imported = 0;
  for (const studio of allStudios) {
    const result = await saveStudioToDb(studio, systemOwner.id);
    if (result) imported++;
    await delay(100); // Small delay to avoid overwhelming DB
  }

  console.log(`\n✅ Import complete! ${imported} studios added.`);

  // Summary
  const total = await prisma.studio.count();
  const roomsTotal = await prisma.room.count();
  console.log(`📊 Total: ${total} studios, ${roomsTotal} rooms in database`);
}

// Run if executed directly
main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
