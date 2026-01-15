// JSON-LD структурированные данные для SEO

interface StudioJsonLdProps {
  studio: {
    id: string;
    name: string;
    description: string | null;
    address: string;
    city: string;
    images: string[];
    phone: string | null;
    email: string | null;
  };
  rooms?: {
    name: string;
    pricePerHour: number;
  }[];
  reviews?: {
    rating: number;
    comment: string | null;
    user: { name: string | null };
    createdAt: Date;
  }[];
  averageRating?: number;
  reviewCount?: number;
}

export function StudioJsonLd({
  studio,
  rooms = [],
  reviews = [],
  averageRating = 0,
  reviewCount = 0,
}: StudioJsonLdProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://www.photomarket.tech";

  // Минимальная и максимальная цена
  const prices = rooms.map((r) => Number(r.pricePerHour)).filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}/studios/${studio.id}`,
    name: studio.name,
    description:
      studio.description || `Фотостудия ${studio.name} в городе ${studio.city}`,
    url: `${baseUrl}/studios/${studio.id}`,
    image:
      studio.images.length > 0 ? studio.images : [`${baseUrl}/og-image.jpg`],
    address: {
      "@type": "PostalAddress",
      streetAddress: studio.address,
      addressLocality: studio.city,
      addressCountry: "RU",
    },
    geo: {
      "@type": "GeoCoordinates",
      // Можно добавить реальные координаты если есть
    },
    telephone: studio.phone,
    email: studio.email,
    priceRange: minPrice > 0 ? `${minPrice}₽ - ${maxPrice}₽/час` : undefined,

    // Агрегированный рейтинг
    ...(reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: averageRating.toFixed(1),
        reviewCount: reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),

    // Отзывы
    ...(reviews.length > 0 && {
      review: reviews.slice(0, 5).map((review) => ({
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
        author: {
          "@type": "Person",
          name: review.user.name || "Аноним",
        },
        reviewBody: review.comment,
        datePublished: review.createdAt.toISOString().split("T")[0],
      })),
    }),

    // Услуги (залы)
    ...(rooms.length > 0 && {
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Залы для аренды",
        itemListElement: rooms.map((room, index) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: room.name,
          },
          price: room.pricePerHour,
          priceCurrency: "RUB",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: room.pricePerHour,
            priceCurrency: "RUB",
            unitText: "час",
          },
          position: index + 1,
        })),
      },
    }),

    // Часы работы (типичные для фотостудий)
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "22:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "10:00",
        closes: "20:00",
      },
    ],

    // Дополнительные свойства
    additionalType: "https://schema.org/PhotographyBusiness",
    amenityFeature: [
      {
        "@type": "LocationFeatureSpecification",
        name: "Профессиональное освещение",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Циклорама",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Гримёрная",
        value: true,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 0) }}
    />
  );
}

// JSON-LD для главной страницы (организация)
export function OrganizationJsonLd() {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://www.photomarket.tech";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    url: baseUrl,
    name: "PhotoMarket",
    description:
      "Агрегатор фотостудий России. Найдите и забронируйте идеальную фотостудию для вашей съемки.",
    publisher: {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "PhotoMarket",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icons/icon-512x512.png`,
        width: 512,
        height: 512,
      },
      sameAs: [
        // Можно добавить соцсети
      ],
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 0) }}
    />
  );
}

// JSON-LD для списка студий (каталог)
interface StudiosListJsonLdProps {
  studios: {
    id: string;
    name: string;
    city: string;
    images: string[];
  }[];
  city?: string;
}

export function StudiosListJsonLd({ studios, city }: StudiosListJsonLdProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://www.photomarket.tech";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: city ? `Фотостудии в городе ${city}` : "Все фотостудии",
    description: city
      ? `Список фотостудий для аренды в городе ${city}`
      : "Полный каталог фотостудий для аренды",
    numberOfItems: studios.length,
    itemListElement: studios.map((studio, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "LocalBusiness",
        "@id": `${baseUrl}/studios/${studio.id}`,
        name: studio.name,
        url: `${baseUrl}/studios/${studio.id}`,
        image: studio.images[0] || `${baseUrl}/og-image.jpg`,
        address: {
          "@type": "PostalAddress",
          addressLocality: studio.city,
          addressCountry: "RU",
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 0) }}
    />
  );
}

// JSON-LD для хлебных крошек
interface BreadcrumbJsonLdProps {
  items: {
    name: string;
    url: string;
  }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 0) }}
    />
  );
}

// FAQ Schema для страницы "О нас" или FAQ
interface FAQJsonLdProps {
  questions: {
    question: string;
    answer: string;
  }[];
}

export function FAQJsonLd({ questions }: FAQJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd, null, 0) }}
    />
  );
}
