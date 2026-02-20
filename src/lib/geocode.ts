/**
 * Геокодирование адреса через Yandex Geocoder API.
 * Возвращает координаты { lat, lng } или null, если адрес не найден.
 */

interface GeocoderResult {
  lat: number;
  lng: number;
}

export async function geocodeAddress(
  city: string,
  address: string,
): Promise<GeocoderResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAP_KEY;

  if (!apiKey) {
    console.warn("NEXT_PUBLIC_YANDEX_MAP_KEY is not set, skipping geocoding");
    return null;
  }

  const fullAddress = `${city}, ${address}`;
  const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${encodeURIComponent(fullAddress)}&format=json&results=1`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(
        "Geocoder API error:",
        response.status,
        response.statusText,
      );
      return null;
    }

    const data = await response.json();

    const featureMember = data?.response?.GeoObjectCollection?.featureMember;

    if (!featureMember || featureMember.length === 0) {
      console.warn(`Geocoding failed: no results for "${fullAddress}"`);
      return null;
    }

    const point = featureMember[0]?.GeoObject?.Point?.pos;

    if (!point) {
      console.warn(`Geocoding failed: no point in result for "${fullAddress}"`);
      return null;
    }

    // Yandex возвращает "lng lat" (долгота пробел широта)
    const [lngStr, latStr] = point.split(" ");
    const lng = parseFloat(lngStr);
    const lat = parseFloat(latStr);

    if (isNaN(lat) || isNaN(lng)) {
      console.warn(
        `Geocoding failed: invalid coordinates for "${fullAddress}"`,
      );
      return null;
    }

    return { lat, lng };
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}
