"use client";

import Image from "next/image";
import { useState } from "react";
import { Camera, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StudioGalleryProps {
  images: string[];
  studioName: string;
}

export function StudioGallery({ images, studioName }: StudioGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const validImages = images.filter((_, index) => !failedImages.has(index));

  const handleImageError = (index: number) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  const openLightbox = (index: number) => {
    // Пересчитываем индекс с учётом пропущенных битых изображений
    const validIndex =
      images.slice(0, index + 1).filter((_, i) => !failedImages.has(i)).length -
      1;
    setCurrentIndex(Math.max(0, validIndex));
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + validImages.length) % validImages.length
    );
  };

  // Нет изображений
  if (images.length === 0 || validImages.length === 0) {
    return (
      <div className="h-[300px] mb-12 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Фотографии пока не добавлены</p>
        </div>
      </div>
    );
  }

  // Рендер картинки с обработкой ошибок
  const renderImage = (
    src: string,
    index: number,
    alt: string,
    priority = false
  ) => {
    if (failedImages.has(index)) return null;

    return (
      <div
        className="h-full relative cursor-pointer group"
        onClick={() => openLightbox(index)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          priority={priority}
          onError={() => handleImageError(index)}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>
    );
  };

  // 1 изображение
  if (validImages.length === 1) {
    const index = images.findIndex((_, i) => !failedImages.has(i));
    return (
      <>
        <div className="h-[400px] mb-12 rounded-xl overflow-hidden">
          {renderImage(images[index], index, studioName, true)}
        </div>
        <Lightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          images={validImages}
          currentIndex={currentIndex}
          onNext={nextImage}
          onPrev={prevImage}
          studioName={studioName}
        />
      </>
    );
  }

  // 2 изображения
  if (validImages.length === 2) {
    const indices = images.map((_, i) => i).filter((i) => !failedImages.has(i));
    return (
      <>
        <div className="grid grid-cols-2 gap-4 h-[400px] mb-12 rounded-xl overflow-hidden">
          {renderImage(images[indices[0]], indices[0], studioName, true)}
          {renderImage(images[indices[1]], indices[1], `${studioName} 2`)}
        </div>
        <Lightbox
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          images={validImages}
          currentIndex={currentIndex}
          onNext={nextImage}
          onPrev={prevImage}
          studioName={studioName}
        />
      </>
    );
  }

  // 3+ изображений - сложная сетка
  const visibleIndices = images
    .map((_, i) => i)
    .filter((i) => !failedImages.has(i));

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[400px] mb-12 rounded-xl overflow-hidden">
        {/* Главное большое фото */}
        <div className="col-span-2 row-span-2">
          {renderImage(
            images[visibleIndices[0]],
            visibleIndices[0],
            studioName,
            true
          )}
        </div>

        {/* Дополнительные фото */}
        {visibleIndices.slice(1, 5).map((imgIndex, i) => (
          <div key={imgIndex} className="hidden md:block relative">
            {renderImage(images[imgIndex], imgIndex, `${studioName} ${i + 2}`)}
            {/* Показываем оверлей на последнем фото если есть ещё */}
            {i === 3 && validImages.length > 5 && (
              <div
                className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl cursor-pointer hover:bg-black/60 transition-colors"
                onClick={() => openLightbox(imgIndex)}
              >
                +{validImages.length - 5}
              </div>
            )}
          </div>
        ))}
      </div>

      <Lightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={validImages}
        currentIndex={currentIndex}
        onNext={nextImage}
        onPrev={prevImage}
        studioName={studioName}
      />
    </>
  );
}

// Компонент лайтбокса
function Lightbox({
  open,
  onClose,
  images,
  currentIndex,
  onNext,
  onPrev,
  studioName,
}: {
  open: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
  studioName: string;
}) {
  if (!open || images.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
        <div className="relative w-full h-[90vh] flex items-center justify-center">
          {/* Закрыть */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Счётчик */}
          <div className="absolute top-4 left-4 z-50 text-white/80 text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Навигация влево */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-50 text-white hover:bg-white/20 h-12 w-12"
              onClick={onPrev}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* Изображение */}
          <div className="relative w-full h-full p-12">
            <Image
              src={images[currentIndex]}
              alt={`${studioName} - фото ${currentIndex + 1}`}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Навигация вправо */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-50 text-white hover:bg-white/20 h-12 w-12"
              onClick={onNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {/* Миниатюры внизу */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`w-16 h-12 relative rounded overflow-hidden border-2 transition-all ${
                    i === currentIndex
                      ? "border-white"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                  onClick={() => {
                    // Нужно правильно установить currentIndex через внешнюю функцию
                    // Для простоты используем прямой клик несколько раз
                    const diff = i - currentIndex;
                    if (diff > 0) {
                      for (let j = 0; j < diff; j++) onNext();
                    } else {
                      for (let j = 0; j < -diff; j++) onPrev();
                    }
                  }}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
