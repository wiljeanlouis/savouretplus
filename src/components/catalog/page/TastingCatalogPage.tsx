import { useEffect, useState } from "react";
import { CatalogLoadingState } from "../CatalogLoadingState";
import { Button } from "../../ui/button";
import { ProductCard } from "../ProductCard";
import { ProductConfigurator } from "../ProductConfigurator";
import { useCatalogProducts } from "../useCatalogProducts";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ClipboardList,
  RefreshCw,
  ShoppingBag,
  X,
} from "lucide-react";

const TASTING_CATEGORY = "tasting";
const cateringHighlights = [
  {
    label: "Service pour événements",
    image: "./images/catalog/tasting/traiteur-1.png",
  },
  {
    label: "Plateaux à partager",
    image: "./images/catalog/tasting/plateau-sucre-1.png",
  },
  {
    label: "Spécialités maison",
    image: "./images/catalog/tasting/shareable-pates.png",
  },
];

export function TastingCatalogPage({ cart }) {
  const { products, loading, error, retry } = useCatalogProducts(TASTING_CATEGORY);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addedItem, setAddedItem] = useState(null);

  useEffect(() => {
    function scrollToRequestedSection() {
      const query = window.location.hash.split("?")[1] || "";
      if (new URLSearchParams(query).get("section") !== "catalogue-degustation") return;

      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      window.requestAnimationFrame(() => {
        document.getElementById("catalogue-degustation")?.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    }

    scrollToRequestedSection();
    window.addEventListener("hashchange", scrollToRequestedSection);
    return () => window.removeEventListener("hashchange", scrollToRequestedSection);
  }, []);

  function addConfiguredProduct(product, options) {
    cart.add(product, options);
    setAddedItem({ name: product.name, quantity: Number(options.quantity) || 1 });
    setSelectedProduct(null);
  }

  return (
    <>
      <TastingHero />
      <section
        className="scroll-mt-24 bg-ivory py-16 sm:py-20 lg:py-24"
        id="catalogue-degustation"
        aria-labelledby="tasting-catalog-title"
      >
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">Nos spécialités</p>
            <h2 className="section-title mt-4" id="tasting-catalog-title">
              Choisissez vos gourmandises
            </h2>
            <p className="mt-5 text-base leading-7 text-espresso/65 sm:text-lg">
              Retrouvez nos pâtés, plateaux et créations à commander, avec leurs formats et options disponibles.
            </p>
          </div>

          {addedItem ? (
            <div className="mt-9">
              <AddedToCartNotice item={addedItem} onDismiss={() => setAddedItem(null)} />
            </div>
          ) : null}

          <div className="mt-12">
            {loading ? (
              <CatalogLoadingState />
            ) : error ? (
              <CatalogErrorState onRetry={retry} />
            ) : products.length === 0 ? (
              <CatalogEmptyState />
            ) : (
              <div className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    action="order"
                    onCustomize={() => setSelectedProduct(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <CateringServiceSection />
      <CombinedServicesSection />

      <ProductConfigurator
        product={selectedProduct}
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onAdd={addConfiguredProduct}
      />
    </>
  );
}

export function TastingHero() {
  return (
    <section className="overflow-hidden bg-white" aria-labelledby="tasting-hero-title">
      <div className="grid min-h-[38rem] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative z-10 flex items-center px-5 py-14 sm:px-8 sm:py-16 lg:px-[max(3rem,calc((100vw-90rem)/2+3rem))] lg:py-20">
          <div className="max-w-xl">
            <p className="eyebrow">Gourmandises et service traiteur</p>
            <h1
              className="mt-5 font-serif text-5xl font-semibold leading-[0.92] tracking-[-0.035em] text-espresso sm:text-6xl lg:text-7xl"
              id="tasting-hero-title"
            >
              Des saveurs à partager, des moments à célébrer.
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-espresso/70 sm:text-lg">
              Commandez nos spécialités pour vos tables et vos proches, ou confiez-nous le service gourmand de votre prochain événement.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg">
                <a href="#/degustation?section=catalogue-degustation">
                  Commander nos spécialités
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#/soumission?service=traiteur">
                  Demander un service traiteur
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative min-h-[25rem] overflow-hidden lg:min-h-full">
          <img
            className="absolute inset-0 h-full w-full object-cover object-center"
            src="./images/catalog/tasting/traiteur-1.png"
            alt="Buffet traiteur préparé par SavouretPlus pour un événement"
            width="3300"
            height="1856"
            fetchPriority="high"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent lg:inset-y-0 lg:left-0 lg:right-auto lg:h-auto lg:w-32 lg:bg-gradient-to-r xl:w-40"
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-espresso/35 to-transparent" aria-hidden="true" />
          <span className="absolute bottom-4 right-5 rounded-full bg-espresso/70 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm">
            Photographie SavouretPlus
          </span>
        </div>
      </div>
    </section>
  );
}

export function CateringServiceSection() {
  return (
    <section className="border-y border-blush/50 bg-blush/20 py-16 sm:py-20 lg:py-24" aria-labelledby="catering-title">
      <div className="container-page grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-14">
        <div className="max-w-xl">
          <p className="eyebrow">Service traiteur événementiel</p>
          <h2 className="section-title mt-4" id="catering-title">
            Une expérience gourmande pensée pour votre réception
          </h2>
          <p className="mt-5 text-base leading-7 text-espresso/65 sm:text-lg">
            SavouretPlus accompagne vos célébrations avec un service traiteur adapté au format, au nombre d'invités et à l'ambiance de votre événement.
          </p>
          <p className="mt-4 text-sm leading-6 text-espresso/55">
            Décrivez-nous votre projet afin que nous puissions préparer une proposition selon vos besoins.
          </p>
          <Button asChild className="mt-7 w-full sm:w-auto" size="lg">
            <a href="#/soumission?service=traiteur">
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              Demander une soumission traiteur
            </a>
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr] sm:grid-rows-2">
          {cateringHighlights.map((highlight, index) => (
            <figure
              className={`relative min-h-44 overflow-hidden bg-white shadow-[0_18px_50px_rgba(53,42,43,0.08)] ${
                index === 0 ? "sm:row-span-2 sm:min-h-[29rem]" : ""
              }`}
              key={highlight.label}
            >
              <img
                className="absolute inset-0 h-full w-full object-cover"
                src={highlight.image}
                alt={highlight.label}
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-espresso/75 to-transparent" aria-hidden="true" />
              <figcaption className="absolute inset-x-4 bottom-4 text-sm font-semibold text-white">
                {highlight.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CombinedServicesSection() {
  return (
    <section className="bg-espresso py-14 text-white sm:py-16" aria-labelledby="combined-services-title">
      <div className="container-page flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-champagne">Une célébration, une seule demande</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl" id="combined-services-title">
            Réunissez Dégustation et Décoration dans votre projet
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-white/70">
            Ajoutez vos choix à Ma sélection ou démarrez une demande mixte afin de nous présenter votre événement dans son ensemble.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
          <Button asChild className="bg-white text-wine hover:bg-ivory" size="lg">
            <a href="#/soumission?service=traiteur-decoration">
              Planifier une demande mixte
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
          <Button asChild className="border-white/45 text-white hover:bg-white/10 hover:text-white" size="lg" variant="outline">
            <a href="#/panier">
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Voir ma sélection
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function AddedToCartNotice({ item, onDismiss }) {
  return (
    <div
      className="mb-7 flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 shadow-sm sm:flex-row sm:items-center sm:justify-between"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
          <Check className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-extrabold">Ajouté à ma sélection</p>
          <p className="mt-0.5 text-sm text-emerald-800">
            {item.quantity} × {item.name}. Vous pouvez continuer vos achats ou finaliser la commande.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:shrink-0">
        <Button asChild size="sm">
          <a href="#/panier">
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Voir ma sélection
          </a>
        </Button>
        <Button variant="ghost" size="icon" type="button" onClick={onDismiss} aria-label="Fermer la confirmation">
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

export function CatalogErrorState({ onRetry }) {
  return (
    <div className="border border-blush/60 bg-white px-6 py-12 text-center shadow-[0_18px_50px_rgba(53,42,43,0.05)]" role="alert">
      <p className="font-serif text-3xl font-semibold text-espresso">Le catalogue ne peut pas être chargé.</p>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-espresso/65">
        Vérifiez votre connexion, puis réessayez. Aucun produit ni prix fictif n’est affiché.
      </p>
      <Button className="mt-5" variant="outline" type="button" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Réessayer
      </Button>
    </div>
  );
}

export function CatalogEmptyState() {
  return (
    <div className="border border-dashed border-blush bg-blush/20 px-6 py-12 text-center">
      <p className="font-serif text-3xl font-semibold text-espresso">Les produits seront bientôt disponibles.</p>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-espresso/65">
        Le catalogue Dégustation ne contient actuellement aucun produit publié.
      </p>
      <Button asChild className="mt-5" variant="outline">
        <a href="#/contact">Nous contacter</a>
      </Button>
    </div>
  );
}
