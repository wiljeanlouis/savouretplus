import { ArrowRight, ChevronLeft, ChevronRight, PlayCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { realizationPhotos, youtubeChannelUrl, youtubeEmbedUrl } from "./homeContent";

export function RealisationsSection() {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activePhoto = realizationPhotos[activePhotoIndex];

  function showPreviousPhoto() {
    setActivePhotoIndex((current) => (current - 1 + realizationPhotos.length) % realizationPhotos.length);
  }

  function showNextPhoto() {
    setActivePhotoIndex((current) => (current + 1) % realizationPhotos.length);
  }

  useEffect(() => {
    if (!lightboxOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") showPreviousPhoto();
      if (event.key === "ArrowRight") showNextPhoto();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen]);

  return (
    <section className="bg-zinc-950 py-20 text-white">
      <div className="container-page grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="eyebrow text-rose-300">Réalisations</p>
          <h2 className="mt-3 max-w-3xl font-serif text-4xl font-extrabold tracking-tight sm:text-5xl">
            Voyez l'ambiance que nous pouvons créer.
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-300">
            Décoration, mise en place, présentations traiteur et moments de fête: parcourez quelques réalisations et
            découvrez nos vidéos directement depuis YouTube.
          </p>

          <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-3">
            <button
              className="group relative block w-full overflow-hidden rounded-2xl bg-zinc-900 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              type="button"
              onClick={() => setLightboxOpen(true)}
              aria-label={`Voir ${activePhoto.label} en grand`}
            >
              <img
                className="h-[28rem] w-full object-cover transition duration-500 group-hover:scale-105"
                src={activePhoto.src}
                alt={activePhoto.alt}
              />
              <span className="absolute inset-x-4 bottom-4 rounded-xl bg-zinc-950/80 px-4 py-3 backdrop-blur">
                <span className="block text-sm font-extrabold">{activePhoto.label}</span>
                <span className="mt-1 block text-xs font-semibold text-zinc-300">
                  {activePhotoIndex + 1} / {realizationPhotos.length}
                </span>
              </span>
            </button>

            <div className="mt-4 flex items-center justify-between gap-4 px-1 pb-1">
              <div className="flex gap-2">
                {realizationPhotos.map((photo, index) => (
                  <button
                    className={`h-2.5 rounded-full transition-all ${
                      activePhotoIndex === index ? "w-8 bg-rose-500" : "w-2.5 bg-white/35 hover:bg-white/60"
                    }`}
                    key={photo.src}
                    type="button"
                    onClick={() => setActivePhotoIndex(index)}
                    aria-label={`Afficher ${photo.label}`}
                    aria-current={activePhotoIndex === index ? "true" : undefined}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-zinc-950 transition hover:bg-zinc-100"
                  type="button"
                  onClick={showPreviousPhoto}
                  aria-label="Photo précédente"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-zinc-950 transition hover:bg-zinc-100"
                  type="button"
                  onClick={showNextPhoto}
                  aria-label="Photo suivante"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <YoutubeFeature />
      </div>

      {lightboxOpen ? (
        <GalleryLightbox
          photo={activePhoto}
          photoIndex={activePhotoIndex}
          onClose={() => setLightboxOpen(false)}
          onPrevious={showPreviousPhoto}
          onNext={showNextPhoto}
          onSelect={setActivePhotoIndex}
        />
      ) : null}
    </section>
  );
}

function YoutubeFeature() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-3 shadow-2xl">
      <div className="overflow-hidden rounded-2xl bg-black">
        <iframe
          className="aspect-video w-full"
          src={youtubeEmbedUrl}
          title="Vidéos YouTube Savour Et Plus"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-600 text-white">
            <PlayCircle className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-xl font-extrabold">Nos vidéos sur YouTube</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Retrouvez les décors, préparations et moments partagés par Savour Et Plus.
            </p>
          </div>
        </div>
        <Button asChild className="mt-5 w-full bg-white text-zinc-950 hover:bg-zinc-100">
          <a href={youtubeChannelUrl} target="_blank" rel="noreferrer">
            Voir la chaîne YouTube <ArrowRight className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
}

function GalleryLightbox({ photo, photoIndex, onClose, onPrevious, onNext, onSelect }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/92 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Galerie de réalisations"
    >
      <button className="absolute inset-0 cursor-default" type="button" onClick={onClose} aria-label="Fermer" />
      <div className="relative z-10 w-full max-w-5xl">
        <div className="mb-3 flex items-center justify-between gap-3 text-white">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-300">{photo.label}</p>
            <p className="mt-1 text-sm text-zinc-300">
              {photoIndex + 1} / {realizationPhotos.length}
            </p>
          </div>
          <Button variant="ghost" size="icon" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-black shadow-2xl">
          <img className="max-h-[75svh] w-full object-contain" src={photo.src} alt={photo.alt} />
          <button
            className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-zinc-900 shadow-md transition hover:bg-white"
            type="button"
            onClick={onPrevious}
            aria-label="Photo précédente"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-zinc-900 shadow-md transition hover:bg-white"
            type="button"
            onClick={onNext}
            aria-label="Photo suivante"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {realizationPhotos.map((galleryPhoto, index) => (
            <button
              className={`h-2.5 rounded-full transition-all ${
                photoIndex === index ? "w-8 bg-rose-500" : "w-2.5 bg-white/35 hover:bg-white/60"
              }`}
              key={galleryPhoto.src}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Afficher ${galleryPhoto.label}`}
              aria-current={photoIndex === index ? "true" : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
