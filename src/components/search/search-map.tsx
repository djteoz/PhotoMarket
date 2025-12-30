"use client";

import { YMaps, Map, Placemark, ZoomControl, Clusterer } from "@pbe/react-yandex-maps";
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
          <Clusterer
            options={{
              preset: "islands#invertedVioletClusterIcons",
              groupByCoordinates: false,
            }}
          >
            {validStudios.map((studio) => (
              <Placemark
                key={studio.id}
                geometry={[studio.lat!, studio.lng!]}
                properties={{
                  balloonContentHeader: `<div style="font-weight: bold; font-size: 16px;">${studio.name}</div>`,
                  balloonContentBody: `
                    <div style="display: flex; gap: 12px; align-items: flex-start; min-width: 250px;">
                      ${
                        studio.images[0]
                          ? `<div style="width: 100px; height: 75px; flex-shrink: 0; border-radius: 6px; overflow: hidden;">
                               <img src="${studio.images[0]}" style="width: 100%; height: 100%; object-fit: cover;" alt="${studio.name}" />
                             </div>`
                          : ""
                      }
                      <div style="flex: 1;">
                        <div style="margin-bottom: 8px; font-size: 13px; color: #555;">${studio.city}</div>
                        <a href="/studios/${studio.id}" style="
                          display: inline-block;
                          padding: 6px 12px;
                          background-color: #000;
                          color: #fff;
                          text-decoration: none;
                          border-radius: 4px;
                          font-size: 12px;
                          font-weight: 500;
                        ">Посмотреть</a>
                      </div>
                    </div>
                  `,
                }}
                modules={["geoObject.addon.balloon", "geoObject.addon.hint"]}
              />
            ))}
          </Clusterer>
        </Map>
      </YMaps>
    </div>
  );
}
