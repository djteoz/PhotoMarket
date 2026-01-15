"use client";

import { useEffect, useRef } from "react";
import { trackStudioView, trackBookingClick } from "@/app/actions/analytics";

interface ViewTrackerProps {
  studioId: string;
}

export function ViewTracker({ studioId }: ViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    // Track view only once per page load
    if (!tracked.current) {
      tracked.current = true;
      trackStudioView(studioId);
    }
  }, [studioId]);

  return null;
}

interface ClickTrackerProps {
  studioId: string;
  children: React.ReactNode;
  className?: string;
}

export function BookingClickTracker({
  studioId,
  children,
  className,
}: ClickTrackerProps) {
  const handleClick = () => {
    trackBookingClick(studioId);
  };

  return (
    <div onClick={handleClick} className={className}>
      {children}
    </div>
  );
}
