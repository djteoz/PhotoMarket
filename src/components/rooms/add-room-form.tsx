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
import { Checkbox } from "@/components/ui/checkbox";
import { createRoom, updateRoom } from "@/app/actions/room";
import { useTransition, useState } from "react";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";
import { X } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Название должно быть не менее 2 символов.",
  }),
  description: z.string().optional(),
  pricePerHour: z.coerce.number().min(0, "Цена должна быть положительной"),
  area: z.coerce.number().min(1, "Площадь должна быть больше 0"),
  capacity: z.coerce
    .number()
    .min(1, "Вместимость должна быть больше 0")
    .optional(),
  hasNaturalLight: z.boolean().default(false),
  images: z.array(z.string()).optional(),
});

interface RoomFormProps {
  studioId: string;
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    pricePerHour: any; // Decimal
    area: number;
    capacity: number | null;
    hasNaturalLight: boolean;
    images: string[];
  };
}

export function AddRoomForm({ studioId, initialData }: RoomFormProps) {
  const [isPending, startTransition] = useTransition();
  const [images, setImages] = useState<string[]>(initialData?.images || []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      pricePerHour: initialData ? Number(initialData.pricePerHour) : 0,
      area: initialData?.area || 0,
      capacity: initialData?.capacity || 0,
      hasNaturalLight: initialData?.hasNaturalLight || false,
      images: initialData?.images || [],
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      if (initialData) {
        await updateRoom(initialData.id, { ...values, images });
      } else {
        await createRoom(studioId, { ...values, images });
      }
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
              <FormLabel>Фотографии зала</FormLabel>
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
                          alt={`Room image ${index + 1}`}
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
                      endpoint="roomImages"
                      onClientUploadComplete={(res) => {
                        if (res) {
                          setImages((prev) => [
                            ...prev,
                            ...res.map((r) => r.url),
                          ]);
                        }
                      }}
                      onUploadError={(error: Error) => {
                        alert(`ERROR! ${error.message}`);
                      }}
                    />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название зала</FormLabel>
              <FormControl>
                <Input placeholder="Зал 'Циклорама'" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="pricePerHour"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Цена (₽/час)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="area"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Площадь (м²)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Вместимость (чел)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="hasNaturalLight"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Естественный свет</FormLabel>
                <FormDescription>
                  Отметьте, если в зале есть большие окна и естественное
                  освещение.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Особенности зала, оборудование..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Сохранение..."
            : initialData
            ? "Сохранить изменения"
            : "Создать зал"}
        </Button>
      </form>
    </Form>
  );
}
