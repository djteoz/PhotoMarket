import { Crown, Rocket, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface PromotedBadgeProps {
  type: string | null;
  className?: string;
}

export function PromotedBadge({ type, className }: PromotedBadgeProps) {
  if (!type) return null;

  const config = {
    TOP: {
      icon: Rocket,
      label: "ТОП",
      className: "bg-gradient-to-r from-orange-500 to-red-500",
    },
    FEATURED: {
      icon: Star,
      label: "Рекомендуем",
      className: "bg-gradient-to-r from-blue-500 to-purple-500",
    },
    HIGHLIGHT: {
      icon: Crown,
      label: "Премиум",
      className: "bg-gradient-to-r from-yellow-500 to-orange-500",
    },
  }[type];

  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white",
        config.className,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </div>
  );
}

interface PromotedCardWrapperProps {
  isPromoted: boolean;
  promotionType: string | null;
  children: React.ReactNode;
  className?: string;
}

export function PromotedCardWrapper({
  isPromoted,
  promotionType,
  children,
  className,
}: PromotedCardWrapperProps) {
  if (!isPromoted) {
    return <div className={className}>{children}</div>;
  }

  const borderColor =
    {
      TOP: "ring-2 ring-orange-500 ring-offset-2",
      FEATURED: "ring-2 ring-blue-500 ring-offset-2",
      HIGHLIGHT: "ring-2 ring-yellow-500 ring-offset-2",
    }[promotionType || ""] || "";

  return (
    <div className={cn("relative", borderColor, className)}>
      {children}
      <div className="absolute -top-3 left-4">
        <PromotedBadge type={promotionType} />
      </div>
    </div>
  );
}
