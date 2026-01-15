"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Banknote,
  Maximize2,
  Sun,
  SlidersHorizontal,
  X,
  Sparkles,
} from "lucide-react";

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

  const hasActiveFilters = !!(
    city ||
    minPrice ||
    maxPrice ||
    minArea ||
    hasNaturalLight
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sticky top-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-purple-600" />
          Фильтры
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-slate-500 hover:text-red-500 flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Сбросить
          </button>
        )}
      </div>

      {/* City Filter */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="w-4 h-4 text-purple-500" />
          Город
        </Label>
        <Input
          placeholder="Москва, Санкт-Петербург..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 rounded-xl"
        />
      </div>

      {/* Price Filter */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Banknote className="w-4 h-4 text-green-500" />
          Цена (₽/час)
        </Label>
        <div className="flex gap-2">
          <Input
            placeholder="От"
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 rounded-xl"
          />
          <span className="flex items-center text-slate-400">—</span>
          <Input
            placeholder="До"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 rounded-xl"
          />
        </div>
      </div>

      {/* Area Filter */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Maximize2 className="w-4 h-4 text-blue-500" />
          Площадь (м²)
        </Label>
        <Input
          placeholder="Минимальная площадь"
          type="number"
          value={minArea}
          onChange={(e) => setMinArea(e.target.value)}
          className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-purple-500 rounded-xl"
        />
      </div>

      {/* Natural Light Checkbox */}
      <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
        <Checkbox
          id="natural-light"
          checked={hasNaturalLight}
          onCheckedChange={(checked) => setHasNaturalLight(checked as boolean)}
          className="border-yellow-400 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
        />
        <Label
          htmlFor="natural-light"
          className="flex items-center gap-2 cursor-pointer"
        >
          <Sun className="w-4 h-4 text-yellow-500" />
          <span className="text-sm">Естественный свет</span>
        </Label>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 space-y-3">
        <Button
          onClick={applyFilters}
          className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 rounded-xl h-11 gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Применить фильтры
        </Button>
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full rounded-xl h-11"
          >
            Сбросить фильтры
          </Button>
        )}
      </div>

      {/* Tips */}
      <div className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700 pt-4">
        <p>
          💡 Совет: используйте фильтры для более точного поиска идеальной
          студии
        </p>
      </div>
    </div>
  );
}
