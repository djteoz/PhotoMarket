"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function CatalogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [city, setCity] = useState(searchParams.get("city") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    router.push(`/catalog?${params.toString()}`);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
      <h3 className="font-bold text-lg">Фильтры</h3>
      
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

      <Button className="w-full" onClick={handleSearch}>
        Применить
      </Button>
      
      {(city || minPrice || maxPrice) && (
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => {
            setCity("");
            setMinPrice("");
            setMaxPrice("");
            router.push("/catalog");
          }}
        >
          Сбросить
        </Button>
      )}
    </div>
  );
}
