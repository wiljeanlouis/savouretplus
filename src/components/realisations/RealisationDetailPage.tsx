import { ArrowLeft, ArrowRight, Maximize2 } from "lucide-react";
import { useRef, useState } from "react";
import { realisationsManifest } from "../../content/realisations";
import {
  findPublishedRealisationBySlug,
  getOrderedRealisationImages,
  getRealisationQuoteHref,
  REALISATION_CATEGORIES,
  type Realisation,
} from "../../domain/realisation";
import { Button } from "../ui/button";
import { RealisationLightbox } from "./RealisationLightbox";

type RealisationDetailPageProps = {
  slug?: string | null;
  realisations?: Realisation[];
};

export function RealisationDetailPage({ slug, realisations = realisationsManifest }: RealisationDetailPageProps) {
  const realisation = findPublishedRealisationBySlug(realisations, slug);

  if (!realisation) return <UnknownRealisation />;
  return <RealisationDetail realisation={realisation} />;
}

export function RealisationDetail({ realisation }: { realisation: Realisation }) {
  const images = getOrderedRealisationImages(realisation);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const lightboxTriggerRef = useRef<HTMLElement | null>(null);

  function showRelativeImage(offset: number) {
    setActiveIndex((current) => (current + offset + images.length) % images.length);
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

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
          <RealisationGallery
            images={images}
            activeIndex={activeIndex}
            title={realisation.title}
            onSelect={setActiveIndex}
            onOpen={openLightbox}
          />

          <div className="lg:sticky lg:top-28">
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
            <Button asChild className="mt-8 w-full sm:w-auto" size="lg">
              <a href={getRealisationQuoteHref(realisation)}>
                Demander une soumission
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
            <p className="mt-3 max-w-md text-xs leading-5 text-espresso/50">
              Cette réalisation sert d'inspiration; votre demande sera adaptée à votre événement.
            </p>
          </div>
        </div>
      </div>

      {lightboxOpen ? (
        <RealisationLightbox
          images={images}
          activeIndex={activeIndex}
          title={realisation.title}
          onClose={() => setLightboxOpen(false)}
          onNavigate={showRelativeImage}
          returnFocusRef={lightboxTriggerRef}
        />
      ) : null}
    </article>
  );
}

function RealisationGallery({ images, activeIndex, title, onSelect, onOpen }) {
  const activeImage = images[activeIndex];

  return (
    <div>
      <button
        className="group relative grid min-h-[22rem] w-full place-items-center overflow-hidden border border-blush/60 bg-white p-3 shadow-[0_18px_50px_rgba(53,42,43,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine sm:min-h-[30rem] lg:min-h-[38rem]"
        type="button"
        onClick={(event) => onOpen(event.currentTarget)}
        aria-label={`Agrandir ${activeImage.alt}`}
      >
        <img
          className="max-h-[72svh] h-auto w-auto max-w-full object-contain"
          src={activeImage.src}
          alt={activeImage.alt}
          decoding="async"
        />
        <span className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-wine shadow-md transition group-hover:bg-wine group-hover:text-white" aria-hidden="true">
          <Maximize2 className="h-4 w-4" />
        </span>
      </button>

      {images.length > 1 ? (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4" aria-label={`Photographies de ${title}`}>
          {images.map((image, index) => (
            <button
              className={`aspect-square overflow-hidden border bg-white p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine ${
                index === activeIndex ? "border-wine" : "border-blush/60 hover:border-wine/50"
              }`}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Afficher la photographie ${index + 1}`}
              aria-pressed={index === activeIndex}
              key={`${image.src}-${index}`}
            >
              <img className="h-full w-full object-cover" src={image.src} alt="" loading="lazy" decoding="async" />
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
