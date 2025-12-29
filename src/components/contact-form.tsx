"use client";

import { useActionState } from "react";
import { submitContactForm } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

const initialState = {
  success: false,
  message: "",
  errors: {},
};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast.success(state.message);
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Ваше имя</Label>
        <Input
          id="name"
          name="name"
          placeholder="Иван Иванов"
          required
          disabled={isPending}
        />
        {state.errors?.name && (
          <p className="text-sm text-red-500">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="ivan@example.com"
          required
          disabled={isPending}
        />
        {state.errors?.email && (
          <p className="text-sm text-red-500">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Тема обращения</Label>
        <Input
          id="subject"
          name="subject"
          placeholder="Вопрос по бронированию"
          required
          disabled={isPending}
        />
        {state.errors?.subject && (
          <p className="text-sm text-red-500">{state.errors.subject[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Сообщение</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Опишите ваш вопрос подробно..."
          className="min-h-[120px]"
          required
          disabled={isPending}
        />
        {state.errors?.message && (
          <p className="text-sm text-red-500">{state.errors.message[0]}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Отправка...
          </>
        ) : (
          "Отправить сообщение"
        )}
      </Button>
    </form>
  );
}
