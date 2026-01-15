// Утилита для транслитерации городов
export const cityTranslitMap: Record<string, string> = {
  // Русский -> URL slug
  москва: "moscow",
  "санкт-петербург": "saint-petersburg",
  екатеринбург: "ekaterinburg",
  новосибирск: "novosibirsk",
  казань: "kazan",
  "нижний новгород": "nizhny-novgorod",
  челябинск: "chelyabinsk",
  самара: "samara",
  омск: "omsk",
  "ростов-на-дону": "rostov-on-don",
  уфа: "ufa",
  красноярск: "krasnoyarsk",
  воронеж: "voronezh",
  пермь: "perm",
  волгоград: "volgograd",
  краснодар: "krasnodar",
  саратов: "saratov",
  тюмень: "tyumen",
  тольятти: "tolyatti",
  ижевск: "izhevsk",
  барнаул: "barnaul",
  ульяновск: "ulyanovsk",
  иркутск: "irkutsk",
  хабаровск: "khabarovsk",
  ярославль: "yaroslavl",
  владивосток: "vladivostok",
  махачкала: "makhachkala",
  томск: "tomsk",
  оренбург: "orenburg",
  кемерово: "kemerovo",
  новокузнецк: "novokuznetsk",
  рязань: "ryazan",
  астрахань: "astrakhan",
  "набережные челны": "naberezhnye-chelny",
  пенза: "penza",
  липецк: "lipetsk",
  тула: "tula",
  киров: "kirov",
  чебоксары: "cheboksary",
  калининград: "kaliningrad",
  курск: "kursk",
  сочи: "sochi",
};

// Обратная карта: URL slug -> Русский
export const slugToCityMap: Record<string, string> = Object.fromEntries(
  Object.entries(cityTranslitMap).map(([ru, en]) => [en, ru])
);

// Функция для получения slug из названия города
export function getCitySlug(cityName: string): string {
  const normalized = cityName.toLowerCase().trim();
  return cityTranslitMap[normalized] || transliterate(normalized);
}

// Функция для получения названия города из slug
export function getCityName(slug: string): string | null {
  return slugToCityMap[slug.toLowerCase()] || null;
}

// Простая транслитерация для неизвестных городов
function transliterate(text: string): string {
  const map: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "yo",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
    " ": "-",
    "-": "-",
  };

  return text
    .toLowerCase()
    .split("")
    .map((char) => map[char] || char)
    .join("");
}

// Падежи для городов (предложный падеж для "в городе")
export const cityPrepositional: Record<string, string> = {
  москва: "Москве",
  "санкт-петербург": "Санкт-Петербурге",
  екатеринбург: "Екатеринбурге",
  новосибирск: "Новосибирске",
  казань: "Казани",
  "нижний новгород": "Нижнем Новгороде",
  сочи: "Сочи",
  ярославль: "Ярославле",
  краснодар: "Краснодаре",
  воронеж: "Воронеже",
  пермь: "Перми",
  калининград: "Калининграде",
};

export function getCityPrepositional(cityName: string): string {
  const normalized = cityName.toLowerCase().trim();
  return cityPrepositional[normalized] || cityName + "е";
}
