"use client";

import { useState, useTransition } from "react";
import { User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/app/actions/user";
import { toast } from "sonner";

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateProfile({ name, phone });
        toast.success("Профиль обновлен");
      } catch (error) {
        toast.error("Ошибка обновления профиля");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={user.email} disabled className="bg-gray-100" />
        <p className="text-xs text-gray-500">Email нельзя изменить</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Имя</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ваше имя"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Телефон</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+7 (999) 000-00-00"
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Сохранение..." : "Сохранить изменения"}
      </Button>
    </form>
  );
}
