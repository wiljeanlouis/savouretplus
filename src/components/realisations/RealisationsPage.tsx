import { ArrowRight, Camera, ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";
import { publishedRealisations } from "../../content/realisations";
import {
  filterRealisations,
  getAvailableRealisationCategories,
  getPublishedRealisations,
  REALISATION_CATEGORIES,
  type Realisation,
  type RealisationCategory,
} from "../../domain/realisation";
import { Button } from "../ui/button";

type RealisationsPageProps = {
  realisations?: Realisation[];
};

export function RealisationsPage({ realisations = publishedRealisations }: RealisationsPageProps) {
  const [activeCategory, setActiveCategory] = useState<RealisationCategory | "all">("all");
  const publishedItems = useMemo(() => getPublishedRealisations(realisations), [realisations]);
  const categories = useMemo(() => getAvailableRealisationCategories(publishedItems), [publishedItems]);
  const visibleRealisations = useMemo(
    () => filterRealisations(publishedItems, activeCategory),
    [activeCategory, publishedItems],
  );

  return (
    <>
      <section className="overflow-hidden border-b border-blush/50 bg-ivory" aria-labelledby="realisations-title">
        <div className="container-page relative py-9 text-center sm:py-10 lg:py-11">
          <div className="pointer-events-none absolute left-8 top-8 h-40 w-40 rounded-full border border-champagne/25" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-20 right-4 h-56 w-56 rounded-full bg-blush/20 blur-3xl" aria-hidden="true" />
          <Camera className="relative mx-auto h-7 w-7 stroke-[1.35] text-champagne" aria-hidden="true" />
          <p className="eyebrow relative mt-3">Portfolio SavouretPlus</p>
          <h1 className="relative mx-auto mt-2 max-w-4xl font-serif text-4xl font-semibold leading-[0.92] tracking-[-0.035em] text-espresso sm:text-5xl lg:text-6xl" id="realisations-title">
            Nos réalisations
          </h1>
          <p className="relative mx-auto mt-3 max-w-2xl text-base leading-7 text-espresso/65 sm:text-lg">
            Découvrez une sélection de décors et de tables gourmandes réalisés par SavouretPlus.
          </p>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16 lg:py-20" aria-labelledby="portfolio-grid-title">
        <div className="container-page">
          <h2 className="sr-only" id="portfolio-grid-title">Portfolio des réalisations publiées</h2>
          {publishedItems.length > 0 ? (
            <>
              {categories.length > 1 ? (
                <div className="mb-10 flex flex-wrap justify-center gap-2" aria-label="Filtrer les réalisations">
                  <FilterButton active={activeCategory === "all"} onClick={() => setActiveCategory("all")}>Toutes</FilterButton>
                  {categories.map((category) => (
                    <FilterButton
                      active={activeCategory === category.id}
                      onClick={() => setActiveCategory(category.id)}
                      key={category.id}
                    >
                      {category.label}
                    </FilterButton>
                  ))}
                </div>
              ) : null}

              <div className="grid items-start gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-live="polite">
                {visibleRealisations.map((realisation) => (
                  <RealisationCard realisation={realisation} key={realisation.id} />
                ))}
              </div>
            </>
          ) : (
            <RealisationEmptyState />
          )}
        </div>
      </section>

      <section className="bg-espresso py-14 text-white sm:py-16" aria-labelledby="realisations-cta-title">
        <div className="container-page flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-champagne">Votre prochain événement</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl" id="realisations-cta-title">
              Imaginons une ambiance qui vous ressemble
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/70">
              Présentez-nous votre projet, vos envies et le contexte de votre célébration.
            </p>
          </div>
          <Button asChild className="shrink-0 bg-white text-wine hover:bg-ivory" size="lg">
            <a href="#/soumission">
              Demander une soumission
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </section>
    </>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine ${
        active
          ? "border-wine bg-wine text-white"
          : "border-blush bg-ivory text-espresso/70 hover:border-wine/50 hover:text-wine"
      }`}
      type="button"
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function RealisationCard({ realisation }: { realisation: Realisation }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden border border-blush/55 bg-ivory shadow-[0_18px_50px_rgba(53,42,43,0.06)]">
      <a aria-label={`Voir ${realisation.title}`} className="relative block aspect-[4/3] overflow-hidden bg-blush/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-wine" href={`#/realisations/${realisation.slug}`}>
        <img
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
          src={realisation.coverImage}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-espresso/25 to-transparent opacity-60" aria-hidden="true" />
      </a>
      <div className="flex flex-1 flex-col p-6">
        <p className="eyebrow">{REALISATION_CATEGORIES[realisation.category]}</p>
        <p className="mt-2 text-xs tracking-wide text-espresso/55">Réf. {realisation.reference}</p>
        <h3 className="mt-3 font-serif text-3xl font-semibold leading-none text-espresso">
          <a className="rounded-sm hover:text-wine focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine" href={`#/realisations/${realisation.slug}`}>
            {realisation.title}
          </a>
        </h3>
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-espresso/60">{realisation.description}</p>
        <a className="editorial-link mt-6 pt-1" href={`#/realisations/${realisation.slug}`}>
          Voir la réalisation
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

export function RealisationEmptyState() {
  return (
    <div className="mx-auto max-w-2xl border border-blush/60 bg-ivory px-6 py-12 text-center sm:px-10">
      <ClipboardList className="mx-auto h-9 w-9 stroke-[1.4] text-champagne" aria-hidden="true" />
      <h2 className="mt-4 font-serif text-3xl font-semibold text-espresso">De nouvelles réalisations seront ajoutées prochainement</h2>
      <p className="mt-3 leading-7 text-espresso/60">
        Vous pouvez dès maintenant nous parler de votre projet et de l'ambiance recherchée.
      </p>
      <a className="editorial-link mt-6" href="#/soumission">
        Demander une soumission
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </a>
    </div>
  );
}
