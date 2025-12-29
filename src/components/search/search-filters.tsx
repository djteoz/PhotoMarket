"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minArea, setMinArea] = useState(searchParams.get("minArea") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [hasNaturalLight, setHasNaturalLight] = useState(
    searchParams.get("hasNaturalLight") === "true"
  );

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    if (minArea) params.set("minArea", minArea);
    else params.delete("minArea");

    if (city) params.set("city", city);
    else params.delete("city");

    if (hasNaturalLight) params.set("hasNaturalLight", "true");
    else params.delete("hasNaturalLight");

    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setMinArea("");
    setCity("");
    setHasNaturalLight(false);

    const params = new URLSearchParams();
    if (searchParams.get("q")) {
      params.set("q", searchParams.get("q")!);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-white h-fit sticky top-4">
      <div>
        <h3 className="font-semibold mb-4">Фильтры</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Город</Label>
            <Input
              placeholder="Москва"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Цена (₽/час)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="От"
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <Input
                placeholder="До"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Площадь (м²)</Label>
            <Input
              placeholder="От"
              type="number"
              value={minArea}
              onChange={(e) => setMinArea(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="natural-light"
              checked={hasNaturalLight}
              onCheckedChange={(checked) =>
                setHasNaturalLight(checked as boolean)
              }
            />
            <Label htmlFor="natural-light">Естественный свет</Label>
          </div>

          <div className="pt-4 flex flex-col gap-2">
            <Button onClick={applyFilters} className="w-full">
              Применить
            </Button>
            <Button variant="outline" onClick={clearFilters} className="w-full">
              Сбросить
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
