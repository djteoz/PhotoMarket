"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createStudio } from "@/app/actions/studio";
import { useTransition } from "react";

import { UploadButton } from "@/lib/uploadthing";
import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Название должно быть не менее 2 символов.",
  }),
  description: z.string().optional(),
  city: z.string().min(2, {
    message: "Город должен быть не менее 2 символов.",
  }),
  address: z.string().min(5, {
    message: "Адрес должен быть не менее 5 символов.",
  }),
  images: z.array(z.string()).optional(),
});

export function AddStudioForm() {
  const [isPending, startTransition] = useTransition();
  const [images, setImages] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      city: "",
      address: "",
      images: [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      await createStudio({ ...values, images });
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="images"
          render={() => (
            <FormItem>
              <FormLabel>Фотографии студии</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    {images.map((url, index) => (
                      <div
                        key={url}
                        className="relative w-32 h-32 rounded-lg overflow-hidden border"
                      >
                        <Image
                          src={url}
                          alt={`Studio image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setImages(images.filter((_, i) => i !== index))
                          }
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <UploadButton
                      endpoint="studioImage"
                      onClientUploadComplete={(res) => {
                        if (res) {
                          setImages((prev) => [...prev, res[0].url]);
                        }
                      }}
                      onUploadError={(error: Error) => {
                        alert(`ERROR! ${error.message}`);
                      }}
                    />
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                Загрузите фотографии вашей студии. Первая фотография будет
                главной.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название студии</FormLabel>
              <FormControl>
                <Input placeholder="Lumina Studio" {...field} />
              </FormControl>
              <FormDescription>
                Публичное название вашей фотостудии.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Город</FormLabel>
                <FormControl>
                  <Input placeholder="Москва" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Адрес</FormLabel>
                <FormControl>
                  <Input placeholder="ул. Пушкина, д. 10" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Расскажите о вашей студии..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Создание..." : "Добавить студию"}
        </Button>
      </form>
    </Form>
  );
}
