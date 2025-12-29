"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const contactFormSchema = z.object({
  name: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  email: z.string().email("Введите корректный email"),
  subject: z.string().min(5, "Тема должна содержать минимум 5 символов"),
  message: z.string().min(10, "Сообщение должно содержать минимум 10 символов"),
});

export async function submitContactForm(prevState: any, formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    const validatedData = contactFormSchema.parse(rawData);

    await prisma.supportTicket.create({
      data: validatedData,
    });

    revalidatePath("/contacts");

    return {
      success: true,
      message:
        "Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Пожалуйста, проверьте правильность заполнения полей.",
        errors: error.flatten().fieldErrors,
      };
    }

    return {
      success: false,
      message: "Произошла ошибка при отправке сообщения. Попробуйте позже.",
    };
  }
}
