"use client";

import { YMaps, Map, Placemark, ZoomControl } from "@pbe/react-yandex-maps";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Studio {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  images: string[];
  city: string;
  description: string | null;
}

interface SearchMapProps {
  studios: Studio[];
}

export default function SearchMap({ studios }: SearchMapProps) {
  const validStudios = studios.filter((s) => s.lat && s.lng);
  const defaultCenter = [55.751574, 37.573856]; // Moscow

  if (validStudios.length === 0) {
    return null;
  }

  // Calculate center based on studios if available
  const center =
    validStudios.length > 0
      ? [
          validStudios.reduce((sum, s) => sum + s.lat!, 0) /
            validStudios.length,
          validStudios.reduce((sum, s) => sum + s.lng!, 0) /
            validStudios.length,
        ]
      : defaultCenter;

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border shadow-sm mb-6 relative z-0">
      <YMaps query={{ apikey: process.env.NEXT_PUBLIC_YANDEX_MAP_KEY }}>
        <Map
          defaultState={{ center: center, zoom: 10 }}
          width="100%"
          height="100%"
        >
          <ZoomControl options={{ position: { right: 10, top: 10 } }} />
          {validStudios.map((studio) => (
            <Placemark
              key={studio.id}
              geometry={[studio.lat!, studio.lng!]}
              properties={{
                balloonContentHeader: studio.name,
                balloonContentBody: `${studio.city}<br/><a href="/studios/${studio.id}">Перейти к студии</a>`,
              }}
              modules={["geoObject.addon.balloon", "geoObject.addon.hint"]}
            />
          ))}
        </Map>
      </YMaps>
    </div>
  );
}
