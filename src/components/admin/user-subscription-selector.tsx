"use client";

import { updateUserSubscription } from "@/app/actions/subscription";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { SubscriptionPlan } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export function UserSubscriptionSelector({
  userId,
  currentPlan,
  disabled,
}: {
  userId: string;
  currentPlan: SubscriptionPlan;
  disabled?: boolean;
}) {
  const [plan, setPlan] = useState<SubscriptionPlan>(currentPlan);
  const [loading, setLoading] = useState(false);

  const handlePlanChange = async (newPlan: SubscriptionPlan) => {
    setLoading(true);
    try {
      // Default to 12 months for manual assignment
      const result = await updateUserSubscription(userId, newPlan, 12);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setPlan(newPlan);
      toast.success(`Подписка изменена на ${newPlan}`);
    } catch (error) {
      toast.error("Ошибка при обновлении подписки");
    } finally {
      setLoading(false);
    }
  };

  const getBadgeVariant = (p: SubscriptionPlan) => {
    switch (p) {
      case "BUSINESS":
        return "default"; // Black (usually) or Primary
      case "PRO":
        return "secondary";
      case "FREE":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Select
      value={plan}
      onValueChange={(val) => handlePlanChange(val as SubscriptionPlan)}
      disabled={loading || disabled}
    >
      <SelectTrigger className="w-[120px] h-8">
        <div className="flex items-center gap-2">
          <SelectValue placeholder="План" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="FREE">Free</SelectItem>
        <SelectItem value="PRO">Pro</SelectItem>
        <SelectItem value="BUSINESS">Business</SelectItem>
      </SelectContent>
    </Select>
  );
}
