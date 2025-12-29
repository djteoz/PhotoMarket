"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="max-w-2xl mx-auto flex gap-2 bg-white p-2 rounded-lg shadow-lg"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Название студии или город..."
          className="pl-10 border-0 focus-visible:ring-0 text-black"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Button size="lg" type="submit">
        Найти
      </Button>
    </form>
  );
}
