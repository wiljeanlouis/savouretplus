import { ArrowDown, ArrowRight, ClipboardList, RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { CatalogProduct } from "../../../domain/catalog";
import {
  decorationCategories,
  getDecorationCatalogTarget,
  getDecorationCategory,
  groupDecorationProducts,
  type DecorationCategoryDefinition,
} from "../../../domain/decoration";
import { Button } from "../../ui/button";
import { DecorationProductCard } from "../DecorationProductCard";
import { useCatalogProducts } from "../useCatalogProducts";

const DECORATION_CATEGORY = "decoration";

export function DecorationCatalogPage({ cart = null }) {
  const { products, loading, error, retry } = useCatalogProducts(DECORATION_CATEGORY);
  const [addedProductName, setAddedProductName] = useState("");
  const productGroups = useMemo(() => groupDecorationProducts(products), [products]);

  useEffect(() => {
    if (loading) return;

    function scrollToRequestedCategory() {
      const targetId = getDecorationCatalogTarget(window.location.hash, products);
      window.requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    scrollToRequestedCategory();
    window.addEventListener("hashchange", scrollToRequestedCategory);
    return () => window.removeEventListener("hashchange", scrollToRequestedCategory);
  }, [loading, products]);

  const populatedCategories = decorationCategories.filter(
    (category) => productGroups.groups.get(category.id)?.length,
  );
  const orderedProducts = [
    ...populatedCategories.flatMap(
      (category) => productGroups.groups.get(category.id) || [],
    ),
    ...productGroups.other,
  ];

  function selectDecoration(product: CatalogProduct) {
    cart?.addDecoration(product);
    setAddedProductName(product.name);
  }

  return (
    <>
      <DecorationHero />
      <section className="scroll-mt-24 bg-ivory py-16 sm:py-20 lg:py-24" id="decoration-catalogue">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">Notre collection</p>
            <h2 className="section-title mt-4">Explorez nos inspirations</h2>
            <p className="mt-5 text-base leading-7 text-espresso/65 sm:text-lg">
              Découvrez nos éléments de décoration et imaginez une ambiance qui vous ressemble.
            </p>
          </div>

          {!loading && !error && populatedCategories.length ? (
            <DecorationCategoryNavigation
              categories={populatedCategories}
              hasOther={Boolean(productGroups.other.length)}
            />
          ) : null}

          {addedProductName ? (
            <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-950 sm:flex-row sm:items-center sm:justify-between" role="status">
              <p className="text-sm font-semibold">{addedProductName} a été ajouté à votre sélection.</p>
              <Button asChild size="sm"><a href="#/panier">Voir ma sélection</a></Button>
            </div>
          ) : null}

          <div className="mt-12">
            {loading ? (
              <DecorationCatalogLoadingState />
            ) : error ? (
              <DecorationCatalogErrorState onRetry={retry} />
            ) : products.length === 0 ? (
              <DecorationCatalogEmptyState />
            ) : (
              <DecorationProductCollection
                products={orderedProducts}
                onSelect={cart ? selectDecoration : undefined}
              />
            )}
          </div>
        </div>
      </section>
      <CustomDecorationSection />
    </>
  );
}

export function DecorationCatalogLoadingState() {
  return (
    <div
      className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-busy="true"
      aria-label="Chargement des décorations"
    >
      {[0, 1, 2].map((item) => (
        <article
          className="animate-pulse overflow-hidden border border-blush/50 bg-white shadow-[0_18px_50px_rgba(53,42,43,0.06)]"
          key={item}
        >
          <div className="aspect-[4/3] bg-blush/35" />
          <div className="p-6">
            <div className="h-3 w-2/5 rounded bg-wine/20" />
            <div className="mt-4 h-8 w-3/4 rounded bg-espresso/15" />
            <div className="mt-5 space-y-3">
              <div className="h-4 w-full rounded bg-espresso/10" />
              <div className="h-4 w-5/6 rounded bg-espresso/10" />
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <div className="h-11 w-28 bg-wine/15" />
              <div className="h-11 w-36 bg-blush/35" />
            </div>
          </div>
        </article>
      ))}
      <span className="sr-only">Chargement du catalogue de décorations…</span>
    </div>
  );
}

function DecorationHero() {
  return (
    <section className="overflow-hidden bg-white">
      <div className="grid min-h-[38rem] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative z-10 flex items-center px-5 py-14 sm:px-8 sm:py-16 lg:px-[max(3rem,calc((100vw-90rem)/2+3rem))] lg:py-20">
          <div className="max-w-xl">
            <p className="eyebrow">L'art de sublimer vos événements</p>
            <h1 className="mt-5 font-serif text-5xl font-semibold leading-[0.92] tracking-[-0.035em] text-espresso sm:text-6xl lg:text-7xl">
              Des décors qui donnent vie à vos plus beaux moments
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-espresso/70 sm:text-lg">
              De l'inspiration à la réalisation, SavouretPlus imagine des ambiances personnalisées
              qui reflètent votre style et rendent chaque célébration unique.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="#/soumission?service=decoration">
                  Imaginer mon décor
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#/decoration?section=catalogue">
                  Explorer nos décorations
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative min-h-[25rem] overflow-hidden lg:min-h-full">
          <img
            className="absolute inset-0 h-full w-full object-cover object-center"
            src="./images/home/ambient-floral-decoration.jpg"
            alt="Photographie d'ambiance d'une réception avec décoration florale"
            width="1600"
            height="900"
            fetchPriority="high"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent lg:inset-y-0 lg:left-0 lg:right-auto lg:h-auto lg:w-32 lg:bg-gradient-to-r xl:w-40" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-espresso/25 to-transparent" aria-hidden="true" />
          <span className="absolute bottom-4 right-5 rounded-full bg-espresso/65 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm">
            Photographie d'ambiance
          </span>
        </div>
      </div>
    </section>
  );
}

function DecorationCategoryNavigation({
  categories,
  hasOther,
}: {
  categories: DecorationCategoryDefinition[];
  hasOther: boolean;
}) {
  return (
    <nav className="mt-9 flex flex-wrap justify-center gap-2" aria-label="Catégories de décoration">
      {categories.map((category) => (
        <a
          className="rounded-full border border-blush bg-white px-4 py-2 text-sm font-semibold text-espresso transition hover:border-wine hover:text-wine"
          href={`#/decoration?categorie=${category.slug}`}
          key={category.id}
        >
          {category.label}
        </a>
      ))}
      {hasOther ? (
        <a
          className="rounded-full border border-blush bg-white px-4 py-2 text-sm font-semibold text-espresso transition hover:border-wine hover:text-wine"
          href="#/decoration?section=autres"
        >
          Autres décorations
        </a>
      ) : null}
    </nav>
  );
}

export function DecorationCatalogEmptyState() {
  return (
    <div className="mx-auto max-w-3xl border border-blush/60 bg-white px-6 py-12 text-center shadow-[0_18px_50px_rgba(53,42,43,0.05)] sm:px-10">
      <Sparkles className="mx-auto h-9 w-9 stroke-[1.4] text-champagne" aria-hidden="true" />
      <p className="eyebrow mt-5">Collection en préparation</p>
      <h3 className="mt-3 font-serif text-4xl font-semibold text-espresso">
        Imaginons plutôt un décor qui vous ressemble.
      </h3>
      <p className="mx-auto mt-4 max-w-xl leading-7 text-espresso/65">
        Aucun article n'est publié pour le moment. Notre service de décoration sur mesure demeure disponible pour votre événement.
      </p>
      <Button className="mt-7" asChild>
        <a href="#/soumission?service=decoration">Demander une décoration sur mesure</a>
      </Button>
    </div>
  );
}

export function DecorationCatalogErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="mx-auto max-w-3xl border border-blush/60 bg-white px-6 py-12 text-center shadow-[0_18px_50px_rgba(53,42,43,0.05)]"
      role="alert"
    >
      <h3 className="font-serif text-3xl font-semibold text-espresso">
        La collection ne peut pas être chargée.
      </h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-espresso/65">
        Vérifiez votre connexion, puis réessayez. Aucun article de démonstration n'est affiché à la place du catalogue publié.
      </p>
      <Button className="mt-6" type="button" variant="outline" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Réessayer
      </Button>
    </div>
  );
}

function CustomDecorationSection() {
  return (
    <section
      className="scroll-mt-24 border-y border-blush/50 bg-blush/20 py-16 sm:py-20"
      id="decoration-sur-mesure"
    >
      <div className="container-page">
        <div className="relative overflow-hidden border border-blush/60 bg-white px-6 py-12 shadow-[0_18px_50px_rgba(53,42,43,0.06)] sm:px-10 lg:px-16 lg:py-16">
          <FloralGarland
            className="absolute right-8 top-7 hidden h-24 w-64 text-champagne/50 md:block lg:right-12 lg:w-72"
            aria-hidden="true"
          />
          <div
            className="absolute right-12 top-32 hidden w-72 text-center text-wine/90 xl:block"
            aria-label="Fait à la main avec amour"
          >
            <p
              className="rotate-[-3deg] font-signature text-[2.25rem] leading-[0.74]"
              aria-hidden="true"
            >
              Fait à la main
              <span className="mt-2 block">avec amour</span>
            </p>
            <span
              className="mx-auto mt-3 block h-px w-52 rotate-[-4deg] bg-wine/45"
              aria-hidden="true"
            />
          </div>
          <div className="relative max-w-3xl">
            <p className="eyebrow">Création personnalisée</p>
            <h2 className="section-title mt-4">Un décor imaginé pour vous</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-espresso/65">
              Vous avez une idée, un thème ou une ambiance particulière en tête ? Parlons de votre événement et créons ensemble une proposition adaptée à vos envies.
            </p>
            <Button className="mt-7" asChild>
              <a href="#/soumission?service=decoration">
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
                Demander une décoration sur mesure
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FloralGarland({ className = "", ...props }) {
  return (
    <svg
      className={className}
      viewBox="0 0 300 100"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M10 78C72 28 157 27 290 70" strokeWidth="1.6" />
      <path d="M44 56c-5-12-14-16-22-13 3 10 10 17 22 13ZM82 39c-1-12-8-20-17-21-1 11 5 20 17 21ZM167 35c5-11 14-16 23-13-3 10-11 17-23 13ZM236 53c7-9 17-11 25-6-5 9-13 13-25 6Z" strokeWidth="1.4" />
      <g strokeWidth="1.5">
        <path d="M54 48c-10-3-14-11-9-17 6-7 14-2 15 6 1-9 8-15 15-10 7 5 3 14-5 18 9-2 16 3 14 11-2 8-12 9-19 2-2 9-11 13-17 7-6-6-1-14 6-17Z" />
        <circle cx="62" cy="48" r="4" />
        <path d="M119 31c-9-5-11-14-5-19 7-5 14 1 13 10 3-9 11-13 17-7 6 6 0 14-8 16 9 0 15 7 11 14-4 7-14 5-19-3-4 8-13 10-18 3-4-7 2-13 9-14Z" />
        <circle cx="128" cy="32" r="4" />
        <path d="M188 40c-7-7-7-16 1-20 8-4 14 4 11 12 5-7 14-9 18-2 4 7-3 14-12 14 9 3 12 11 6 17-6 5-15 1-17-8-6 7-16 6-19-2-3-8 5-12 12-11Z" />
        <circle cx="197" cy="42" r="4" />
        <path d="M247 58c-6-8-4-17 4-20 9-2 13 6 8 14 7-6 16-6 19 2 2 8-6 13-15 11 8 4 9 13 2 17-7 4-15-2-15-11-7 6-16 3-18-5-1-8 7-11 15-8Z" />
        <circle cx="255" cy="62" r="4" />
      </g>
    </svg>
  );
}

export function DecorationProductCollection({
  products,
  onSelect,
}: {
  products: CatalogProduct[];
  onSelect?: (product: CatalogProduct) => void;
}) {
  if (products.length === 1) {
    return (
      <DecorationProductCard
        anchorId={getDecorationProductAnchor(products, 0)}
        onSelect={onSelect}
        product={products[0]}
        featured
      />
    );
  }

  return (
    <div
      className={`grid gap-6 ${products.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`}
    >
      {products.map((product, index) => (
        <DecorationProductCard
          anchorId={getDecorationProductAnchor(products, index)}
          key={product.id}
          onSelect={onSelect}
          product={product}
        />
      ))}
    </div>
  );
}

function getDecorationProductAnchor(products: CatalogProduct[], index: number) {
  const product = products[index];
  const category = getDecorationCategory(product.subcategory);

  if (category) {
    const isFirstInCategory = products.findIndex(
      (candidate) => candidate.subcategory === product.subcategory,
    ) === index;
    return isFirstInCategory ? `decoration-${category.slug}` : undefined;
  }

  const isFirstOther = products.findIndex(
    (candidate) => !getDecorationCategory(candidate.subcategory),
  ) === index;
  return isFirstOther ? "decoration-autres" : undefined;
}
