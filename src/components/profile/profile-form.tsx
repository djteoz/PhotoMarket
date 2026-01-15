"use client";

import { useState, useTransition } from "react";
import { User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/app/actions/user";
import { toast } from "sonner";
import {
  Mail,
  User as UserIcon,
  Phone,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    startTransition(async () => {
      try {
        await updateProfile({ name, phone });
        toast.success("Профиль обновлен");
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch {
        toast.error("Ошибка обновления профиля");
      }
    });
  };

  const formatPhone = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // Format as +7 (XXX) XXX-XX-XX
    if (digits.length <= 1) return digits.length === 1 ? "+7" : "";
    if (digits.length <= 4) return `+7 (${digits.slice(1)}`;
    if (digits.length <= 7)
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9)
      return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(
        7
      )}`;
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(
      7,
      9
    )}-${digits.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Mail className="w-4 h-4 text-muted-foreground" />
          Email
        </Label>
        <Input
          id="email"
          value={user.email}
          disabled
          className="bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">
          Email привязан к аккаунту Clerk и не может быть изменён
        </p>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="name"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <UserIcon className="w-4 h-4 text-muted-foreground" />
          Имя
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введите ваше имя"
          className="focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-muted-foreground">
          Отображается в профиле и сообщениях
        </p>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="phone"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Phone className="w-4 h-4 text-muted-foreground" />
          Телефон
        </Label>
        <Input
          id="phone"
          value={phone}
          onChange={handlePhoneChange}
          placeholder="+7 (999) 000-00-00"
          className="focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-muted-foreground">
          Для связи с клиентами и уведомлений
        </p>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Сохранение...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Сохранено
            </>
          ) : (
            "Сохранить изменения"
          )}
        </Button>
      </div>
    </form>
  );
}
