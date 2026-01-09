"use client";

import { createPost } from "@/app/actions/forum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreatePostForm({ categories }: { categories: any[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createPost(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Тема создана!");
      router.push(`/community/post/${result.postId}`);
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg border"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Заголовок</label>
        <Input name="title" required placeholder="О чем хотите поговорить?" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Категория</label>
        <Select name="categoryId" required>
          <SelectTrigger>
            <SelectValue placeholder="Выберите категорию" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Сообщение</label>
        <Textarea
          name="content"
          required
          placeholder="Опишите подробно..."
          className="min-h-[200px]"
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Отмена
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Публикация..." : "Создать тему"}
        </Button>
      </div>
    </form>
  );
}
