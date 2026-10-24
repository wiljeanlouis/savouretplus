import { ArrowRight, Maximize2, PlayCircle } from "lucide-react";
import { useRef, useState } from "react";
import { publishedRealisations } from "../../content/realisations";
import { RealisationLightbox } from "../realisations/RealisationLightbox";
import { youtubeChannelUrl, youtubeEmbedUrl } from "./homeContent";

const previewRealisations = publishedRealisations.slice(0, 4);
const previewImages = previewRealisations.map(
  (realisation) =>
    realisation.images.find((image) => image.src === realisation.coverImage) || realisation.images[0],
);

export function RealisationsSection() {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const galleryTriggerRef = useRef(null);
  const activeRealisation = previewRealisations[activePhotoIndex];

  function showRelativePhoto(offset) {
    setActivePhotoIndex((current) => (current + offset + previewRealisations.length) % previewRealisations.length);
  }

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
            {previewRealisations.map((realisation, index) => (
              <button
                className={`group relative overflow-hidden bg-white text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-4 ${
                  index === 0 ? "col-span-2 row-span-2" : index === 3 ? "col-span-2" : ""
                }`}
                type="button"
                onClick={(event) => openPhoto(index, event.currentTarget)}
                aria-label={`Agrandir ${realisation.title}`}
                key={realisation.id}
              >
                <img
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                  src={realisation.coverImage}
                  alt={previewImages[index].alt}
                  width="530"
                  height="480"
                  loading="lazy"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-espresso/65 via-transparent to-transparent opacity-70 transition group-hover:opacity-90" />
                <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-xs font-bold text-white">
                  {realisation.title}
                  <Maximize2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center lg:justify-end">
          <a className="editorial-link" href="#/realisations">
            Voir toutes nos réalisations
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
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
        <RealisationLightbox
          images={previewImages}
          activeIndex={activePhotoIndex}
          title={activeRealisation.title}
          onClose={() => setLightboxOpen(false)}
          onNavigate={showRelativePhoto}
          returnFocusRef={galleryTriggerRef}
        />
      ) : null}
    </section>
  );
}
