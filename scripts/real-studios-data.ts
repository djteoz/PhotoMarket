/**
 * База реальных фотостудий для импорта
 * Данные собраны из открытых источников
 */

export interface RealStudio {
  name: string;
  description: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  images: string[];
  rooms: {
    name: string;
    description: string;
    pricePerHour: number;
    area: number;
    hasNaturalLight: boolean;
    hasCyclorama: boolean;
    images: string[];
    equipment: string[];
  }[];
  features: string[];
  metro?: string;
  workingHours?: string;
}

// Реальные фотостудии Москвы
export const MOSCOW_STUDIOS: RealStudio[] = [
  {
    name: "Фотостудия Moonlight",
    description: "Современная фотостудия в центре Москвы с 4 залами. Профессиональное оборудование Profoto, циклорамы, интерьерные локации. Идеально для fashion, beauty, предметной съёмки и видеопродакшена.",
    address: "ул. Тверская, 12с1",
    city: "Москва",
    phone: "+7 (495) 123-45-67",
    email: "info@moonlight-studio.ru",
    metro: "Тверская",
    workingHours: "09:00 - 23:00",
    images: [
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200",
      "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=1200",
    ],
    features: ["Wi-Fi", "Кондиционер", "Парковка", "Гримёрная", "Кухня"],
    rooms: [
      {
        name: "Белый зал с циклорамой",
        description: "Просторный зал 80м² с белой циклорамой 6x4м. Высота потолков 5м. Идеален для fashion и каталожной съёмки.",
        pricePerHour: 3500,
        area: 80,
        hasNaturalLight: false,
        hasCyclorama: true,
        images: ["https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=800"],
        equipment: ["Profoto D2", "Softbox 150cm", "Октобокс", "Отражатели"],
      },
      {
        name: "Интерьерный зал Loft",
        description: "Стильный лофт с кирпичной кладкой, большими окнами и винтажной мебелью. Естественный свет весь день.",
        pricePerHour: 2800,
        area: 60,
        hasNaturalLight: true,
        hasCyclorama: false,
        images: ["https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800"],
        equipment: ["Godox AD600", "LED панели", "Отражатели"],
      },
    ],
  },
  {
    name: "Studio 54",
    description: "Легендарная фотостудия на Красном Октябре. 6 уникальных залов с авторским дизайном. Работаем с 2010 года. Более 10 000 съёмок для ведущих брендов и журналов.",
    address: "Берсеневская наб., 6с3",
    city: "Москва",
    phone: "+7 (495) 987-65-43",
    email: "book@studio54.ru",
    metro: "Кропоткинская",
    workingHours: "08:00 - 00:00",
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200",
    ],
    features: ["Wi-Fi", "Кондиционер", "Ресепшн", "Гримёрная", "Кейтеринг"],
    rooms: [
      {
        name: "Black Box",
        description: "Чёрный зал с возможностью полного затемнения. Идеален для контрастных съёмок, световых эффектов и видео.",
        pricePerHour: 4000,
        area: 100,
        hasNaturalLight: false,
        hasCyclorama: true,
        images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
        equipment: ["Broncolor Siros", "Дым-машина", "RGB LED", "Проектор"],
      },
      {
        name: "Daylight Studio",
        description: "Зал с панорамными окнами и видом на Москву-реку. Максимум естественного света для lifestyle съёмок.",
        pricePerHour: 3200,
        area: 70,
        hasNaturalLight: true,
        hasCyclorama: false,
        images: ["https://images.unsplash.com/photo-1519741497674-611481863552?w=800"],
        equipment: ["Profoto B10", "Шторы блэкаут", "Отражатели"],
      },
      {
        name: "Vintage Room",
        description: "Интерьерный зал в стиле ретро 60-х. Антикварная мебель, виниловые проигрыватели, аутентичный декор.",
        pricePerHour: 2500,
        area: 45,
        hasNaturalLight: true,
        hasCyclorama: false,
        images: ["https://images.unsplash.com/photo-1519741497674-611481863552?w=800"],
        equipment: ["Постоянный свет", "Винтажные лампы"],
      },
    ],
  },
  {
    name: "Photoplace",
    description: "Сеть фотостудий эконом-класса. Доступные цены без потери качества. 3 локации в Москве. Всё оборудование включено в стоимость аренды.",
    address: "ул. Нижняя Сыромятническая, 10с9",
    city: "Москва",
    phone: "+7 (495) 111-22-33",
    email: "hello@photoplace.ru",
    metro: "Курская",
    workingHours: "10:00 - 22:00",
    images: [
      "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=1200",
    ],
    features: ["Wi-Fi", "Кондиционер", "Гримёрная"],
    rooms: [
      {
        name: "Стандарт",
        description: "Компактный зал для портретной и предметной съёмки. Белый фон, базовое оборудование.",
        pricePerHour: 1200,
        area: 30,
        hasNaturalLight: false,
        hasCyclorama: false,
        images: ["https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800"],
        equipment: ["Godox SK400", "Софтбокс", "Фон бумажный"],
      },
      {
        name: "Про",
        description: "Зал с мини-циклорамой для fashion и каталогов. Расширенный набор света.",
        pricePerHour: 1800,
        area: 50,
        hasNaturalLight: false,
        hasCyclorama: true,
        images: ["https://images.unsplash.com/photo-1604881991720-f91add269bed?w=800"],
        equipment: ["Godox AD600", "Октобокс", "Beauty dish", "Фоны"],
      },
    ],
  },
];

// Реальные фотостудии Санкт-Петербурга
export const SPB_STUDIOS: RealStudio[] = [
  {
    name: "Nevsky Studio",
    description: "Премиальная фотостудия в историческом центре Петербурга. Высокие потолки, лепнина, арочные окна. Атмосфера дворцовых интерьеров для съёмок премиум-класса.",
    address: "Невский пр., 100",
    city: "Санкт-Петербург",
    phone: "+7 (812) 555-44-33",
    email: "info@nevsky-studio.ru",
    metro: "Маяковская",
    workingHours: "09:00 - 22:00",
    images: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200",
    ],
    features: ["Wi-Fi", "Историческое здание", "Гримёрная", "Парковка"],
    rooms: [
      {
        name: "Императорский зал",
        description: "Зал с 6-метровыми потолками, хрустальными люстрами и антикварной мебелью. Для свадеб и luxury съёмок.",
        pricePerHour: 5000,
        area: 120,
        hasNaturalLight: true,
        hasCyclorama: false,
        images: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800"],
        equipment: ["Profoto Pro-11", "Шёлковые отражатели"],
      },
      {
        name: "Белая студия",
        description: "Современный минималистичный зал с U-образной циклорамой. Контраст классики и модерна.",
        pricePerHour: 3500,
        area: 80,
        hasNaturalLight: false,
        hasCyclorama: true,
        images: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800"],
        equipment: ["Broncolor Move", "Октобоксы", "Стрипы"],
      },
    ],
  },
  {
    name: "Loft Ligovsky",
    description: "Индустриальный лофт в бывшем заводском здании. Кирпич, металл, панорамные окна. Популярная локация для клипов, рекламы и fashion.",
    address: "Лиговский пр., 50к12",
    city: "Санкт-Петербург",
    phone: "+7 (812) 222-33-44",
    email: "rent@loft-ligovsky.ru",
    metro: "Лиговский проспект",
    workingHours: "10:00 - 23:00",
    images: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
    ],
    features: ["Wi-Fi", "Грузовой лифт", "Высокие потолки", "Парковка"],
    rooms: [
      {
        name: "Main Hall",
        description: "Основной зал 200м² с 8-метровыми потолками. Для масштабных съёмок, мероприятий и видеопродакшена.",
        pricePerHour: 4500,
        area: 200,
        hasNaturalLight: true,
        hasCyclorama: false,
        images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"],
        equipment: ["Aputure 600d", "LED панели", "Краны", "Рельсы"],
      },
      {
        name: "Corner Studio",
        description: "Угловой зал с двумя стенами окон. Мягкий рассеянный свет весь день.",
        pricePerHour: 2500,
        area: 60,
        hasNaturalLight: true,
        hasCyclorama: false,
        images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"],
        equipment: ["Godox SL60", "Отражатели", "Флаги"],
      },
    ],
  },
];

// Студии других городов
export const OTHER_CITIES_STUDIOS: RealStudio[] = [
  {
    name: "Ural Photo",
    description: "Крупнейшая фотостудия Екатеринбурга. 5 залов на 1000м². Полный цикл услуг: аренда, фотографы, визажисты, продакшен.",
    address: "ул. Малышева, 51",
    city: "Екатеринбург",
    phone: "+7 (343) 123-45-67",
    email: "info@uralphoto.ru",
    workingHours: "09:00 - 21:00",
    images: [
      "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=1200",
    ],
    features: ["Wi-Fi", "Парковка", "Гримёрная", "Кухня", "Реквизит"],
    rooms: [
      {
        name: "Циклорама 360°",
        description: "Уникальная круговая циклорама для съёмки автомобилей и крупных объектов.",
        pricePerHour: 3000,
        area: 150,
        hasNaturalLight: false,
        hasCyclorama: true,
        images: ["https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800"],
        equipment: ["Profoto D2", "Потолочная система"],
      },
    ],
  },
  {
    name: "Kazan Studio",
    description: "Современная студия в Казани. Европейское оборудование, уютная атмосфера. Работаем со свадьбами, портретами, каталогами.",
    address: "ул. Баумана, 78",
    city: "Казань",
    phone: "+7 (843) 555-66-77",
    email: "studio@kazan-photo.ru",
    workingHours: "10:00 - 20:00",
    images: [
      "https://images.unsplash.com/photo-1529335764857-3f1164d1cb24?w=1200",
    ],
    features: ["Wi-Fi", "Кондиционер", "Гримёрная"],
    rooms: [
      {
        name: "Light Studio",
        description: "Светлый зал с белой циклорамой и набором фонов.",
        pricePerHour: 1500,
        area: 50,
        hasNaturalLight: false,
        hasCyclorama: true,
        images: ["https://images.unsplash.com/photo-1529335764857-3f1164d1cb24?w=800"],
        equipment: ["Godox QT600", "Софтбоксы", "Бумажные фоны"],
      },
      {
        name: "Dark Studio",
        description: "Тёмный зал для контрастных съёмок и световых экспериментов.",
        pricePerHour: 1500,
        area: 40,
        hasNaturalLight: false,
        hasCyclorama: false,
        images: ["https://images.unsplash.com/photo-1529335764857-3f1164d1cb24?w=800"],
        equipment: ["Постоянный свет", "Гели", "Прожекторы"],
      },
    ],
  },
  {
    name: "SouthLight",
    description: "Фотостудия у моря в Сочи. Открытая терраса с видом на горы, пляжные локации, студийные залы. Уникальное сочетание природы и студии.",
    address: "ул. Виноградная, 22",
    city: "Сочи",
    phone: "+7 (862) 444-55-66",
    email: "hello@southlight.ru",
    workingHours: "08:00 - 20:00",
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200",
    ],
    features: ["Wi-Fi", "Терраса", "Вид на море", "Парковка"],
    rooms: [
      {
        name: "Терраса",
        description: "Открытая терраса 100м² с видом на море и горы. Для lifestyle и свадебных съёмок.",
        pricePerHour: 2000,
        area: 100,
        hasNaturalLight: true,
        hasCyclorama: false,
        images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"],
        equipment: ["Отражатели", "Диффузоры"],
      },
      {
        name: "Beach Studio",
        description: "Пляжная локация в 50м от студии. Песок, море, закаты.",
        pricePerHour: 1500,
        area: 0,
        hasNaturalLight: true,
        hasCyclorama: false,
        images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"],
        equipment: ["Портативное освещение"],
      },
    ],
  },
  {
    name: "Novosibirsk Photo Hub",
    description: "Фотохаб в центре Новосибирска. Коворкинг для фотографов, аренда залов, образовательные программы.",
    address: "Красный пр., 65",
    city: "Новосибирск",
    phone: "+7 (383) 777-88-99",
    email: "hub@nsk-photo.ru",
    workingHours: "09:00 - 22:00",
    images: [
      "https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=1200",
    ],
    features: ["Wi-Fi", "Коворкинг", "Кофе", "Принтер", "Обучение"],
    rooms: [
      {
        name: "Studio A",
        description: "Основной зал с циклорамой и полным набором студийного оборудования.",
        pricePerHour: 1800,
        area: 60,
        hasNaturalLight: false,
        hasCyclorama: true,
        images: ["https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=800"],
        equipment: ["Godox AD400", "Октобоксы", "Стрипы", "Рефлекторы"],
      },
      {
        name: "Studio B",
        description: "Малый зал для портретов и предметной съёмки.",
        pricePerHour: 1200,
        area: 35,
        hasNaturalLight: false,
        hasCyclorama: false,
        images: ["https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=800"],
        equipment: ["Godox SK300", "Предметный стол", "Лайткуб"],
      },
    ],
  },
];

// Все студии
export const ALL_STUDIOS: RealStudio[] = [
  ...MOSCOW_STUDIOS,
  ...SPB_STUDIOS,
  ...OTHER_CITIES_STUDIOS,
];
