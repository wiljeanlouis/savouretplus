import { ArrowLeft, Copy, Maximize2, PlayCircle, Video } from "lucide-react";
import { useRef, useState } from "react";
import { realisationsManifest } from "../../content/realisations";
import {
  findPublishedRealisationBySlug,
  getOrderedRealisationMedia,
  isRealisationVideoUrl,
  REALISATION_CATEGORIES,
  type Realisation,
  type RealisationMedia,
  type RealisationVideo,
} from "../../domain/realisation";
import { Button } from "../ui/button";
import { RealisationTestimonials } from "./RealisationTestimonials";
import { RealisationLightbox } from "./RealisationLightbox";

type RealisationDetailPageProps = {
  slug?: string | null;
  realisations?: Realisation[];
};

export function RealisationDetailPage({ slug, realisations = realisationsManifest }: RealisationDetailPageProps) {
  const realisation = findPublishedRealisationBySlug(realisations, slug);

  if (!realisation) return <UnknownRealisation />;
  return <RealisationDetail key={realisation.id} realisation={realisation} />;
}

export function RealisationDetail({ realisation }: { realisation: Realisation }) {
  const media = getOrderedRealisationMedia(realisation);
  const images = media.filter((item) => item.type === "image");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copyStatus, setCopyStatus] = useState("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxTriggerRef = useRef<HTMLElement | null>(null);

  function showRelativeImage(offset: number) {
    setActiveIndex((current) => {
      const photoIndex = images.indexOf(media[current] as typeof images[number]);
      return media.indexOf(images[(photoIndex + offset + images.length) % images.length]);
    });
  }

  function openLightbox(trigger: HTMLElement) {
    lightboxTriggerRef.current = trigger;
    setLightboxOpen(true);
  }

  return (
    <article className="bg-ivory">
      <div className="container-page py-10 sm:py-14 lg:py-16">
        <a className="editorial-link" href="#/realisations">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour aux réalisations
        </a>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-16">
          <RealisationGallery
            media={media}
            activeIndex={activeIndex}
            title={realisation.title}
            onSelect={setActiveIndex}
            onOpen={openLightbox}
          />

          <div className="min-w-0 lg:sticky lg:top-28">
            <p className="eyebrow">{REALISATION_CATEGORIES[realisation.category]}</p>
            <h1 className="mt-4 font-serif text-5xl font-semibold leading-[0.92] tracking-[-0.03em] text-espresso sm:text-6xl">
              {realisation.title}
            </h1>
            <p className="mt-6 text-base leading-7 text-espresso/65 sm:text-lg">{realisation.description}</p>
            {realisation.date || realisation.location ? (
              <dl className="mt-7 grid gap-3 border-y border-blush/60 py-5 text-sm">
                {realisation.date ? <DetailMeta label="Date" value={realisation.date} /> : null}
                {realisation.location ? <DetailMeta label="Lieu" value={realisation.location} /> : null}
              </dl>
            ) : null}
            <div className="mt-6 border-t border-blush/60 pt-5">
              <div className="flex flex-wrap items-center gap-1">
                <p className="text-sm font-semibold tracking-wide text-wine">Référence : {realisation.reference}</p>
                <Button
                  className="h-11 w-11 shrink-0"
                  variant="ghost"
                  size="icon"
                  type="button"
                  aria-label={`Copier la référence ${realisation.reference}`}
                  onClick={async () => {
                    setCopyStatus("");
                    try {
                      await navigator.clipboard.writeText(realisation.reference);
                      setCopyStatus(`Référence ${realisation.reference} copiée.`);
                    } catch {
                      setCopyStatus(`Copie impossible. Sélectionnez et copiez la référence ${realisation.reference} manuellement.`);
                    }
                  }}
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              <p className="mt-1 max-w-md text-sm leading-6 text-espresso/65">
                Mentionnez cette référence lors de votre commande ou de votre demande de soumission.
              </p>
              <p className={copyStatus ? "mt-2 text-xs leading-5 text-espresso/65" : "sr-only"} role="status" aria-live="polite" aria-atomic="true">
                {copyStatus}
              </p>
            </div>
            <RealisationTestimonials testimonials={realisation.testimonials} />
          </div>
        </div>
      </div>

      {lightboxOpen && media[activeIndex].type === "image" ? (
        <RealisationLightbox
          images={images}
          activeIndex={images.indexOf(media[activeIndex] as typeof images[number])}
          title={realisation.title}
          onClose={() => setLightboxOpen(false)}
          onNavigate={showRelativeImage}
          returnFocusRef={lightboxTriggerRef}
        />
      ) : null}
    </article>
  );
}

type RealisationGalleryProps = {
  media: RealisationMedia[];
  activeIndex: number;
  title: string;
  onSelect: (index: number) => void;
  onOpen: (trigger: HTMLElement) => void;
};

const platformLabels = { youtube: "YouTube", tiktok: "TikTok" } as const;
const previewClass = "group relative grid h-[22rem] w-full place-items-center overflow-hidden border border-blush/60 bg-white p-3 shadow-[0_18px_50px_rgba(53,42,43,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine sm:h-[30rem] lg:h-[38rem]";

function VideoThumbnail({ video, compact = false }: { video: RealisationVideo; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  return video.thumbnail && !failed ? (
    <img className="h-full min-h-0 w-full object-contain" src={video.thumbnail} alt={compact ? "" : video.thumbnailAlt} loading="lazy" decoding="async" onError={() => setFailed(true)} />
  ) : (
    <span className="flex h-full flex-col items-center justify-center gap-2 p-2 text-center text-wine">
      <Video className="h-7 w-7" aria-hidden="true" />
      <span className={compact ? "sr-only" : "text-xs"}>Aperçu indisponible</span>
    </span>
  );
}

export function RealisationGallery({ media, activeIndex, title, onSelect, onOpen }: RealisationGalleryProps) {
  const activeMedia = media[activeIndex];

  return (
    <div className="min-w-0">
      <figure>
        {activeMedia.type === "image" ? (
          <button className={previewClass} type="button" onClick={(event) => onOpen(event.currentTarget)} aria-label={`Agrandir ${activeMedia.alt}`}>
            <img className="h-full min-h-0 w-full object-contain" src={activeMedia.src} alt={activeMedia.alt} decoding="async" />
            <span className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-wine shadow-md transition group-hover:bg-wine group-hover:text-white" aria-hidden="true">
              <Maximize2 className="h-4 w-4" />
            </span>
          </button>
        ) : (
          <div className={previewClass}>
            <VideoThumbnail key={activeMedia.url} video={activeMedia} />
            <span className="absolute left-4 top-4 bg-white/95 px-3 py-1 text-xs font-semibold text-wine">{platformLabels[activeMedia.platform]}</span>
            {isRealisationVideoUrl(activeMedia.url, activeMedia.platform) ? (
              <a className="absolute bottom-4 left-4 right-4 flex min-h-11 items-center justify-center gap-2 bg-white/95 px-3 py-3 text-center text-sm font-semibold text-wine shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine" href={activeMedia.url} target="_blank" rel="noopener noreferrer">
                <PlayCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                Voir la vidéo sur {platformLabels[activeMedia.platform]}
                <span className="sr-only"> : {activeMedia.title} (nouvel onglet)</span>
              </a>
            ) : null}
          </div>
        )}
        <figcaption className="mt-3 text-sm leading-6 text-espresso/60" aria-live="polite" aria-atomic="true">
          {activeMedia.caption?.trim() || (activeMedia.type === "image" ? activeMedia.alt : activeMedia.title)}
        </figcaption>
      </figure>

      {media.length > 1 ? (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4" role="group" aria-label={`Médias de ${title}`}>
          {media.map((item, index) => (
            <button
              className={`relative aspect-square min-w-0 overflow-hidden border bg-white p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine ${index === activeIndex ? "border-wine" : "border-blush/60 hover:border-wine/50"}`}
              type="button"
              onClick={() => onSelect(index)}
              onKeyDown={(event) => {
                const offset = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
                const next = event.key === "Home" ? 0 : event.key === "End" ? media.length - 1 : (index + offset + media.length) % media.length;
                if (!offset && event.key !== "Home" && event.key !== "End") return;
                event.preventDefault();
                onSelect(next);
                const controls = event.currentTarget.parentElement?.querySelectorAll("button");
                controls?.[next]?.focus();
              }}
              aria-label={item.type === "image" ? `Afficher la photographie ${media.slice(0, index + 1).filter((entry) => entry.type === "image").length}` : `Afficher la vidéo ${platformLabels[item.platform]} : ${item.title}`}
              aria-pressed={index === activeIndex}
              key={item.type === "image" ? `${item.src}-${index}` : `${item.url}-${index}`}
            >
              {item.type === "image" ? (
                <img className="h-full w-full object-cover" src={item.src} alt="" loading="lazy" decoding="async" />
              ) : (
                <>
                  <VideoThumbnail video={item} compact />
                  <span className="absolute right-2 top-2" aria-hidden="true"><PlayCircle className="h-6 w-6 rounded-full bg-white/90 text-wine" /></span>
                  <span className="absolute bottom-0 left-0 right-0 bg-white/95 px-1 py-1 text-xs font-semibold text-wine">{platformLabels[item.platform]}</span>
                </>
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DetailMeta({ label, value }) {
  return (
    <div className="grid grid-cols-[5rem_1fr] gap-3">
      <dt className="font-semibold text-wine">{label}</dt>
      <dd className="text-espresso/65">{value}</dd>
    </div>
  );
}

export function UnknownRealisation() {
  return (
    <section className="bg-ivory py-20 sm:py-28" aria-labelledby="unknown-realisation-title">
      <div className="container-page text-center">
        <p className="eyebrow">Réalisation introuvable</p>
        <h1 className="mx-auto mt-4 max-w-2xl font-serif text-5xl font-semibold text-espresso" id="unknown-realisation-title">
          Cette réalisation n'est pas disponible
        </h1>
        <p className="mx-auto mt-5 max-w-xl leading-7 text-espresso/60">
          Elle a peut-être été masquée ou son adresse n'est plus valide.
        </p>
        <Button asChild className="mt-7" variant="outline">
          <a href="#/realisations">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Voir les réalisations publiées
          </a>
        </Button>
      </div>
    </section>
  );
}
