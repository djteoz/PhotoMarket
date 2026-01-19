"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

/**
 * Custom hook for infinite scroll functionality
 * Uses Intersection Observer API for optimal performance
 */
export function useInfiniteScroll(
  onLoadMore: () => void,
  options: UseInfiniteScrollOptions = {}
) {
  const { threshold = 0, rootMargin = "100px", enabled = true } = options;
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      setIsIntersecting(target.isIntersecting);
      
      if (target.isIntersecting && enabled) {
        onLoadMore();
      }
    },
    [onLoadMore, enabled]
  );

  useEffect(() => {
    const element = observerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin,
      threshold,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver, rootMargin, threshold]);

  return {
    observerRef,
    isIntersecting,
  };
}
