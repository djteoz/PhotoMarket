"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Check, RefreshCw } from "lucide-react";
import { generateDescription, improveText } from "@/app/actions/ai";
import { toast } from "sonner";

interface AIDescriptionGeneratorProps {
  studioId: string;
  currentDescription?: string;
  onGenerated: (description: string) => void;
}

export function AIDescriptionGenerator({
  studioId,
  currentDescription,
  onGenerated,
}: AIDescriptionGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [mode, setMode] = useState<"generate" | "improve">("generate");

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateDescription(studioId);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      setGeneratedText(result.description || null);
      toast.success("Описание сгенерировано!");
    } catch {
      toast.error("Ошибка генерации");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImprove = async () => {
    if (!currentDescription) {
      toast.error("Нет текста для улучшения");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await improveText(currentDescription);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      setGeneratedText(result.text || null);
      toast.success("Текст улучшен!");
    } catch {
      toast.error("Ошибка улучшения");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedText) {
      onGenerated(generatedText);
      setGeneratedText(null);
      toast.success("Описание применено");
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-600" />
        <h3 className="font-medium">AI Помощник</h3>
      </div>

      <div className="flex gap-2">
        <Button
          variant={mode === "generate" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("generate")}
        >
          Сгенерировать
        </Button>
        <Button
          variant={mode === "improve" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("improve")}
          disabled={!currentDescription}
        >
          Улучшить текст
        </Button>
      </div>

      {generatedText && (
        <div className="space-y-2">
          <Textarea
            value={generatedText}
            onChange={(e) => setGeneratedText(e.target.value)}
            rows={4}
            className="bg-white"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleApply} className="gap-1">
              <Check className="h-4 w-4" />
              Применить
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setGeneratedText(null)}
            >
              Отмена
            </Button>
          </div>
        </div>
      )}

      {!generatedText && (
        <Button
          onClick={mode === "generate" ? handleGenerate : handleImprove}
          disabled={isGenerating}
          className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {mode === "generate" ? "Генерация..." : "Улучшение..."}
            </>
          ) : (
            <>
              {mode === "generate" ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  Сгенерировать описание
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Улучшить текущий текст
                </>
              )}
            </>
          )}
        </Button>
      )}

      <p className="text-xs text-gray-500">
        Powered by YandexGPT • Результат можно редактировать
      </p>
    </div>
  );
}
