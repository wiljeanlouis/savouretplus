import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { useEffect, useState } from "react";

type ProductGalleryProps = {
  images?: string[];
  fallbackImage?: string;
  productName: string;
  fit?: "contain" | "cover";
  priority?: boolean;
  className?: string;
};

export function ProductGallery({
  images = [],
  fallbackImage = "",
  productName,
  fit = "contain",
  priority = false,
  className = "",
}: ProductGalleryProps) {
  const gallery = uniqueImages(images, fallbackImage);
  const [activeImage, setActiveImage] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);

  useEffect(() => {
    setActiveImage(0);
    setFailedImages([]);
  }, [productName, images, fallbackImage]);

  const availableImages = gallery.filter((image) => !failedImages.includes(image));
  const safeIndex = availableImages.length ? activeImage % availableImages.length : 0;
  const currentImage = availableImages[safeIndex];

  function showPreviousImage() {
    setActiveImage((current) =>
      availableImages.length ? (current - 1 + availableImages.length) % availableImages.length : 0,
    );
  }

  function showNextImage() {
    setActiveImage((current) =>
      availableImages.length ? (current + 1) % availableImages.length : 0,
    );
  }

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50 ${className}`}>
      <div className="grid h-full min-h-52 place-items-center overflow-hidden rounded-xl bg-white/70">
        {currentImage ? (
          <img
            className={`h-full w-full transition duration-500 group-hover:scale-[1.025] ${
              fit === "cover" ? "object-cover" : "object-contain drop-shadow-sm"
            }`}
            src={currentImage}
            alt={`${productName} — image ${safeIndex + 1} sur ${availableImages.length}`}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            onError={() => setFailedImages((current) => [...current, currentImage])}
          />
        ) : (
          <div className="grid place-items-center gap-2 px-5 py-12 text-center text-zinc-500" role="img" aria-label={`Photographie de ${productName} non disponible`}>
            <ImageOff className="h-8 w-8 text-rose-300" aria-hidden="true" />
            <span className="text-sm font-semibold">Photographie à venir</span>
          </div>
        )}
      </div>

      {availableImages.length > 1 ? (
        <>
          <button
            className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-zinc-700 shadow-md transition hover:bg-white hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            type="button"
            onClick={showPreviousImage}
            aria-label={`Image précédente de ${productName}`}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-zinc-700 shadow-md transition hover:bg-white hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            type="button"
            onClick={showNextImage}
            aria-label={`Image suivante de ${productName}`}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2" aria-label="Choisir une photographie">
            {availableImages.map((image, index) => (
              <button
                className={`h-2.5 rounded-full shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 ${
                  safeIndex === index ? "w-8 bg-rose-600" : "w-2.5 bg-zinc-400 hover:bg-zinc-600"
                }`}
                key={image}
                type="button"
                onClick={() => setActiveImage(index)}
                aria-label={`Voir l'image ${index + 1} de ${productName}`}
                aria-current={safeIndex === index ? "true" : undefined}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function uniqueImages(images: string[], fallbackImage: string) {
  return [...new Set([...images, fallbackImage].filter(Boolean))];
}
