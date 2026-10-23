import { ArrowRight, ChevronLeft, ChevronRight, Maximize2, PlayCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { realizationPhotos, youtubeChannelUrl, youtubeEmbedUrl } from "./homeContent";

export function RealisationsSection() {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const galleryTriggerRef = useRef(null);
  const lightboxCloseRef = useRef(null);
  const activePhoto = realizationPhotos[activePhotoIndex];

  function showRelativePhoto(offset) {
    setActivePhotoIndex((current) => (current + offset + realizationPhotos.length) % realizationPhotos.length);
  }

  useEffect(() => {
    if (!lightboxOpen) return;

    lightboxCloseRef.current?.focus();
    function onKeyDown(event) {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") showRelativePhoto(-1);
      if (event.key === "ArrowRight") showRelativePhoto(1);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      galleryTriggerRef.current?.focus();
    };
  }, [lightboxOpen]);

  function openPhoto(index, trigger) {
    setActivePhotoIndex(index);
    galleryTriggerRef.current = trigger;
    setLightboxOpen(true);
  }

  return (
    <section className="scroll-mt-24 bg-blush/25 py-16 lg:py-24" id="realisations">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:items-center">
          <div className="max-w-lg">
            <p className="eyebrow">Nos réalisations</p>
            <h2 className="mt-4 font-serif text-5xl font-semibold leading-[0.93] tracking-[-0.025em] text-espresso sm:text-6xl">
              Des événements qui racontent une histoire
            </h2>
            <p className="mt-6 text-base leading-7 text-espresso/65">
              Chaque célébration est unique. Découvrez quelques ambiances qui témoignent de notre
              savoir-faire et du soin apporté à chaque détail.
            </p>
          </div>

          <div className="grid auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[11rem] lg:grid-cols-4 lg:auto-rows-[12rem]">
            {realizationPhotos.map((photo, index) => (
              <button
                className={`group relative overflow-hidden bg-white text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-4 ${
                  index === 0 ? "col-span-2 row-span-2" : index === 3 ? "col-span-2" : ""
                }`}
                type="button"
                onClick={(event) => openPhoto(index, event.currentTarget)}
                aria-label={`Agrandir ${photo.label}`}
                key={photo.src}
              >
                <img
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                  src={photo.src}
                  alt={photo.alt}
                  width="530"
                  height="480"
                  loading="lazy"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-espresso/65 via-transparent to-transparent opacity-70 transition group-hover:opacity-90" />
                <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-xs font-bold text-white">
                  {photo.label}
                  <Maximize2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid max-w-5xl overflow-hidden border border-espresso/10 bg-white text-espresso shadow-[0_16px_40px_rgba(53,42,43,0.06)] sm:grid-cols-[16rem_1fr] lg:ml-auto lg:grid-cols-[19rem_1fr]">
          <iframe
            className="aspect-video h-full min-h-40 w-full bg-black"
            src={youtubeEmbedUrl}
            title="Vidéos YouTube Savour Et Plus"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          <div className="flex items-center p-6 sm:p-7">
            <div>
              <div className="flex items-center gap-3">
                <PlayCircle className="h-6 w-6 text-wine" aria-hidden="true" />
                <h3 className="font-serif text-2xl font-semibold">Dans les coulisses</h3>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-6 text-espresso/60">
                Retrouvez les décors, les préparations et les moments partagés par Savour Et Plus.
              </p>
              <a className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-wine hover:text-espresso" href={youtubeChannelUrl} target="_blank" rel="noreferrer">
                Voir la chaîne YouTube
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-espresso/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Galerie de réalisations"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setLightboxOpen(false);
          }}
        >
          <div className="relative w-full max-w-5xl">
            <div className="mb-3 flex items-center justify-between gap-3 text-white">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-champagne">{activePhoto.label}</p>
                <p className="mt-1 text-sm text-white/60">{activePhotoIndex + 1} / {realizationPhotos.length}</p>
              </div>
              <button
                ref={lightboxCloseRef}
                className="grid h-10 w-10 place-items-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
                type="button"
                onClick={() => setLightboxOpen(false)}
                aria-label="Fermer la galerie"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative overflow-hidden bg-black shadow-2xl">
              <img className="max-h-[75svh] w-full object-contain" src={activePhoto.src} alt={activePhoto.alt} />
              <GalleryButton side="left" label="Photo précédente" onClick={() => showRelativePhoto(-1)}>
                <ChevronLeft className="h-5 w-5" />
              </GalleryButton>
              <GalleryButton side="right" label="Photo suivante" onClick={() => showRelativePhoto(1)}>
                <ChevronRight className="h-5 w-5" />
              </GalleryButton>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function GalleryButton({ side, label, onClick, children }) {
  return (
    <button
      className={`absolute top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-espresso shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine ${side === "left" ? "left-3" : "right-3"}`}
      type="button"
      onClick={onClick}
      aria-label={label}
    >
      {children}
    </button>
  );
}
