/**
 * YandexGPT API Client
 * Документация: https://cloud.yandex.ru/docs/yandexgpt/
 */

export interface YandexGPTMessage {
  role: "system" | "user" | "assistant";
  text: string;
}

export interface YandexGPTRequest {
  modelUri: string;
  completionOptions: {
    stream: boolean;
    temperature: number;
    maxTokens: string;
  };
  messages: YandexGPTMessage[];
}

export interface YandexGPTResponse {
  result: {
    alternatives: Array<{
      message: {
        role: string;
        text: string;
      };
      status: string;
    }>;
    usage: {
      inputTextTokens: string;
      completionTokens: string;
      totalTokens: string;
    };
    modelVersion: string;
  };
}

const YANDEX_GPT_URL =
  "https://llm.api.cloud.yandex.net/foundationModels/v1/completion";

export async function generateWithYandexGPT(
  prompt: string,
  systemPrompt?: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const apiKey = process.env.YANDEX_GPT_API_KEY;
  const folderId = process.env.YANDEX_FOLDER_ID;

  if (!apiKey || !folderId) {
    throw new Error("YANDEX_GPT_API_KEY and YANDEX_FOLDER_ID are required");
  }

  const messages: YandexGPTMessage[] = [];

  if (systemPrompt) {
    messages.push({ role: "system", text: systemPrompt });
  }

  messages.push({ role: "user", text: prompt });

  const request: YandexGPTRequest = {
    modelUri: `gpt://${folderId}/yandexgpt-lite`, // или yandexgpt для более мощной модели
    completionOptions: {
      stream: false,
      temperature: options?.temperature ?? 0.6,
      maxTokens: String(options?.maxTokens ?? 2000),
    },
    messages,
  };

  const response = await fetch(YANDEX_GPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Api-Key ${apiKey}`,
      "x-folder-id": folderId,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`YandexGPT API error: ${response.status} - ${error}`);
  }

  const data = (await response.json()) as YandexGPTResponse;
  return data.result.alternatives[0]?.message.text || "";
}

// Специализированные функции для фотостудий

/**
 * Генерация описания студии по ключевым данным
 */
export async function generateStudioDescription(data: {
  name: string;
  city: string;
  rooms: number;
  features: string[];
  priceRange: string;
}): Promise<string> {
  const systemPrompt = `Ты - копирайтер для сайта аренды фотостудий. 
Пиши живым, продающим языком. Максимум 3-4 предложения.
Не используй общие фразы типа "идеальный выбор".
Упоминай конкретные преимущества.`;

  const prompt = `Напиши описание для фотостудии:
Название: ${data.name}
Город: ${data.city}
Количество залов: ${data.rooms}
Особенности: ${data.features.join(", ")}
Цена: ${data.priceRange} руб/час

Описание должно быть кратким и привлекательным для фотографов.`;

  return generateWithYandexGPT(prompt, systemPrompt, { temperature: 0.7 });
}

/**
 * AI поиск - преобразование естественного запроса в фильтры
 */
export async function parseSearchQuery(query: string): Promise<{
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  hasNaturalLight?: boolean;
  style?: string;
  keywords: string[];
}> {
  const systemPrompt = `Ты - парсер поисковых запросов для сайта аренды фотостудий.
Твоя задача - извлечь структурированные данные из запроса пользователя.
Отвечай ТОЛЬКО в формате JSON без markdown.`;

  const prompt = `Проанализируй запрос пользователя и извлеки фильтры:
"${query}"

Верни JSON с полями:
- city: город (если указан)
- minPrice: минимальная цена (число)
- maxPrice: максимальная цена (число)
- minArea: минимальная площадь в м² (число)
- hasNaturalLight: нужен ли естественный свет (boolean)
- style: стиль студии (лофт, классика, минимализм и т.д.)
- keywords: массив ключевых слов для поиска

Пример: {"city": "Москва", "minArea": 50, "hasNaturalLight": true, "keywords": ["белые стены"]}`;

  const response = await generateWithYandexGPT(prompt, systemPrompt, {
    temperature: 0.1,
    maxTokens: 500,
  });

  try {
    // Пытаемся распарсить JSON из ответа
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { keywords: query.split(" ") };
  } catch {
    // Если не удалось распарсить, возвращаем базовые ключевые слова
    return { keywords: query.split(" ").filter((w) => w.length > 2) };
  }
}

/**
 * Генерация ответа на вопрос о студии
 */
export async function answerStudioQuestion(
  studioData: {
    name: string;
    description: string;
    address: string;
    rooms: Array<{
      name: string;
      pricePerHour: number;
      area: number;
      amenities: string[];
    }>;
  },
  question: string
): Promise<string> {
  const systemPrompt = `Ты - AI-ассистент фотостудии "${studioData.name}".
Отвечай кратко и по делу. Если информации нет - честно скажи об этом.
Предлагай связаться с администратором для уточнения деталей.`;

  const studioInfo = `
Название: ${studioData.name}
Описание: ${studioData.description}
Адрес: ${studioData.address}
Залы:
${studioData.rooms
  .map(
    (r) =>
      `- ${r.name}: ${r.pricePerHour} руб/час, ${
        r.area
      } м², оборудование: ${r.amenities.join(", ")}`
  )
  .join("\n")}
`;

  const prompt = `Информация о студии:
${studioInfo}

Вопрос клиента: ${question}`;

  return generateWithYandexGPT(prompt, systemPrompt, { temperature: 0.5 });
}

/**
 * Улучшение текста описания
 */
export async function improveDescription(text: string): Promise<string> {
  const systemPrompt = `Ты - редактор текстов для сайта фотостудий.
Улучши текст: исправь ошибки, сделай более читаемым, добавь эмодзи где уместно.
Сохрани смысл и длину примерно такой же.`;

  return generateWithYandexGPT(
    `Улучши это описание:\n\n${text}`,
    systemPrompt,
    { temperature: 0.6 }
  );
}

/**
 * Генерация тегов для студии
 */
export async function generateStudioTags(
  description: string
): Promise<string[]> {
  const systemPrompt = `Извлеки 5-10 тегов из описания фотостудии.
Теги должны быть короткими (1-2 слова).
Отвечай только списком через запятую.`;

  const response = await generateWithYandexGPT(description, systemPrompt, {
    temperature: 0.3,
    maxTokens: 200,
  });

  return response
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);
}
