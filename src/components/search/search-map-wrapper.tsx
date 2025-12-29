"use client";

import dynamic from "next/dynamic";

const SearchMap = dynamic(() => import("./search-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-gray-100 rounded-lg animate-pulse mb-6" />
  ),
});

export default SearchMap;
