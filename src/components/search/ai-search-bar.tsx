"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, Loader2 } from "lucide-react";
import { aiSearch } from "@/app/actions/ai";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function AISearchBar() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAISearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const result = await aiSearch(query);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      // Construct URL with extracted filters
      const params = new URLSearchParams();
      if (result.filters?.city) params.set("city", result.filters.city);
      if (result.filters?.minPrice)
        params.set("minPrice", String(result.filters.minPrice));
      if (result.filters?.maxPrice)
        params.set("maxPrice", String(result.filters.maxPrice));
      if (result.filters?.minArea)
        params.set("minArea", String(result.filters.minArea));
      if (result.filters?.hasNaturalLight)
        params.set("hasNaturalLight", "true");
      if (result.filters?.keywords?.length)
        params.set("q", result.filters.keywords.join(" "));

      router.push(`/search?${params.toString()}`);
      toast.success(`Найдено ${result.studios?.length || 0} студий`);
    } catch {
      toast.error("Ошибка поиска");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-500" />
          <Input
            placeholder="Опишите, что ищете: 'студия с белыми стенами в Москве до 2000р'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAISearch()}
            className="pl-10 pr-4 py-6 text-lg"
            disabled={isLoading}
          />
        </div>
        <Button
          size="lg"
          onClick={handleAISearch}
          disabled={isLoading || !query.trim()}
          className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Search className="h-5 w-5" />
              AI Поиск
            </>
          )}
        </Button>
      </div>
      <p className="text-sm text-gray-400 mt-2 text-center">
        ✨ Powered by YandexGPT — понимает естественный язык
      </p>
    </div>
  );
}
