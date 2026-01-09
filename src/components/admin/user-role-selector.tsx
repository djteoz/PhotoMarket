"use client";

import { updateUserRole } from "@/app/actions/admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { Role } from "@prisma/client";

export function UserRoleSelector({
  userId,
  currentRole,
  viewerRole,
  disabled,
}: {
  userId: string;
  currentRole: Role;
  viewerRole?: Role;
  disabled?: boolean;
}) {
  const [role, setRole] = useState<Role>(currentRole);
  const [loading, setLoading] = useState(false);

  // Define allowed roles based on viewer's role
  const canPromoteToAdmin = viewerRole === "OWNER";
  const canPromoteToOwner = viewerRole === "OWNER";
  const canManageModerators = viewerRole === "ADMIN" || viewerRole === "OWNER";

  // Check if the current user has permission to change this specific role
  // e.g., Admin cannot change Owner's role
  const isTargetHigherOrEqual =
    currentRole === "OWNER" ||
    (currentRole === "ADMIN" && viewerRole !== "OWNER");

  const isDisabled = disabled || isTargetHigherOrEqual || loading;

  const handleRoleChange = async (newRole: Role) => {
    setLoading(true);
    try {
      const result = await updateUserRole(userId, newRole);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setRole(newRole);
      toast.success("Роль обновлена");
    } catch (error) {
      toast.error("Ошибка при обновлении роли");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      value={role}
      onValueChange={(val) => handleRoleChange(val as Role)}
      disabled={isDisabled}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Роль" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="USER">Пользователь</SelectItem>
        {canManageModerators && (
          <SelectItem value="MODERATOR">Модератор</SelectItem>
        )}
        {canPromoteToAdmin && <SelectItem value="ADMIN">Админ</SelectItem>}
        {canPromoteToOwner && <SelectItem value="OWNER">Владелец</SelectItem>}
      </SelectContent>
    </Select>
  );
}
