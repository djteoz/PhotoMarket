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
import {
  Type,
  FolderOpen,
  FileText,
  Loader2,
  Send,
  Users,
  ShoppingBag,
  Wrench,
  Star,
  MessagesSquare,
} from "lucide-react";

// Иконки для категорий
const categoryIcons: Record<string, React.ReactNode> = {
  "общее-обсуждение": <MessagesSquare className="w-4 h-4" />,
  "поиск-ассистентов-и-моделей": <Users className="w-4 h-4" />,
  "техника-и-оборудование": <Wrench className="w-4 h-4" />,
  "отзывы-о-студиях": <Star className="w-4 h-4" />,
  барахолка: <ShoppingBag className="w-4 h-4" />,
};

export default function CreatePostForm({
  categories,
}: {
  categories: { id: string; name: string; slug: string }[];
}) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
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

  const titleLength = title.length;
  const contentLength = content.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b bg-slate-50 flex items-center gap-2">
          <Type className="w-4 h-4 text-purple-600" />
          <label className="text-sm font-medium text-slate-700">
            Заголовок темы
          </label>
        </div>
        <div className="p-5">
          <Input
            name="title"
            required
            placeholder="О чем хотите поговорить?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={150}
            className="border-0 text-lg font-medium placeholder:text-slate-400 focus-visible:ring-0 px-0"
          />
          <div className="mt-2 flex justify-end">
            <span
              className={`text-xs ${
                titleLength > 120
                  ? "text-amber-600"
                  : titleLength > 0
                  ? "text-slate-400"
                  : "text-slate-300"
              }`}
            >
              {titleLength}/150
            </span>
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b bg-slate-50 flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-purple-600" />
          <label className="text-sm font-medium text-slate-700">
            Категория
          </label>
        </div>
        <div className="p-5">
          <Select name="categoryId" required>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Выберите категорию" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  <div className="flex items-center gap-2">
                    {categoryIcons[cat.slug] || (
                      <FolderOpen className="w-4 h-4" />
                    )}
                    {cat.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b bg-slate-50 flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-600" />
          <label className="text-sm font-medium text-slate-700">
            Сообщение
          </label>
        </div>
        <div className="p-5">
          <Textarea
            name="content"
            required
            placeholder="Опишите подробно вашу тему, вопрос или предложение..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[250px] border-0 resize-none placeholder:text-slate-400 focus-visible:ring-0 px-0"
          />
          <div className="mt-2 flex justify-end">
            <span
              className={`text-xs ${
                contentLength > 0 ? "text-slate-400" : "text-slate-300"
              }`}
            >
              {contentLength} символов
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="text-slate-600"
        >
          Отмена
        </Button>
        <Button
          type="submit"
          disabled={loading || !title.trim() || !content.trim()}
          className="bg-purple-600 hover:bg-purple-700 gap-2 px-6"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Публикация...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Создать тему
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
