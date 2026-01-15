"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const popularCities = ["Москва", "Санкт-Петербург", "Казань", "Новосибирск"];

export function SearchHero() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("q", query);
    } else {
      params.delete("q");
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleCityClick = (city: string) => {
    router.push(`/search?city=${encodeURIComponent(city)}`);
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSearch}
        className="max-w-2xl mx-auto flex gap-2 bg-white/10 backdrop-blur-sm p-2 rounded-2xl border border-white/20"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Название студии или город..."
            className="pl-12 h-12 bg-white dark:bg-slate-800 border-0 focus-visible:ring-2 focus-visible:ring-purple-500 text-slate-900 dark:text-white rounded-xl"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button
          size="lg"
          type="submit"
          className="h-12 px-6 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 rounded-xl"
        >
          <Search className="w-5 h-5 mr-2" />
          Найти
        </Button>
      </form>

      {/* Quick City Links */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-slate-400 text-sm flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Популярные:
        </span>
        {popularCities.map((city) => (
          <button
            key={city}
            onClick={() => handleCityClick(city)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-sm text-white transition-colors flex items-center gap-1"
          >
            <MapPin className="w-3 h-3" />
            {city}
          </button>
        ))}
      </div>
    </div>
  );
}
