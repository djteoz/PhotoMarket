"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Fix Leaflet default icon
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

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

function MapUpdater({ studios }: { studios: Studio[] }) {
  const map = useMap();

  useEffect(() => {
    if (studios.length > 0) {
      const bounds = L.latLngBounds(
        studios
          .filter((s) => s.lat && s.lng)
          .map((s) => [s.lat!, s.lng!])
      );
      
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [studios, map]);

  return null;
}

export default function SearchMap({ studios }: SearchMapProps) {
  const validStudios = studios.filter((s) => s.lat && s.lng);
  const defaultCenter: [number, number] = [55.7558, 37.6173]; // Moscow

  if (validStudios.length === 0) {
    return null;
  }

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border shadow-sm mb-6 relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={10}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater studios={validStudios} />
        {validStudios.map((studio) => (
          <Marker key={studio.id} position={[studio.lat!, studio.lng!]}>
            <Popup>
              <div className="min-w-[200px]">
                <h3 className="font-bold text-sm mb-1">{studio.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{studio.city}</p>
                <Link href={`/studios/${studio.id}`}>
                  <Button size="sm" className="w-full h-8 text-xs">
                    Подробнее
                  </Button>
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
