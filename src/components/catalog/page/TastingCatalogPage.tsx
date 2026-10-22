import { useState } from "react";
import { BreadcrumbHero } from "../../layout/BreadcrumbHero";
import { CatalogLoadingState } from "../CatalogLoadingState";
import { Button } from "../../ui/button";
import { ProductCard } from "../ProductCard";
import { ProductConfigurator } from "../ProductConfigurator";
import { useCatalogProducts } from "../useCatalogProducts";
import { Check, ClipboardList, RefreshCw, ShoppingBag, X } from "lucide-react";

const TASTING_CATEGORY = "tasting";
const cateringHighlights = [
  {
    label: "Plateaux à partager",
    image: "./images/catalog/tasting/plateau-sucre-1.png",
  },
  {
    label: "Service pour événements",
    image: "./images/catalog/tasting/traiteur-1.png",
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

  function addConfiguredProduct(product, options) {
    cart.add(product, options);
    setAddedItem({ name: product.name, quantity: Number(options.quantity) || 1 });
    setSelectedProduct(null);
  }

  return (
    <>
      <BreadcrumbHero
        title="Dégustation"
        image="./images/catalog/tasting/breadcrumbs-bg-pates.png"
        subtitle="Complétez votre événement avec nos spécialités ou demandez une soumission traiteur."
      />
      <section className="py-14 sm:py-20" id="catalogue-degustation">
        <div className="container-page">
          <TastingIntro />

          {addedItem ? (
            <AddedToCartNotice item={addedItem} onDismiss={() => setAddedItem(null)} />
          ) : null}

          {loading ? (
            <CatalogLoadingState />
          ) : error ? (
            <CatalogErrorState onRetry={retry} />
          ) : products.length === 0 ? (
            <CatalogEmptyState />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
      </section>

      <ProductConfigurator
        product={selectedProduct}
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onAdd={addConfiguredProduct}
      />
    </>
  );
}

function TastingIntro() {
  return (
    <div className="mb-10 grid gap-7 overflow-hidden rounded-3xl border border-rose-100 bg-white p-5 shadow-sm shadow-rose-950/5 lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:p-7">
      <div className="max-w-xl">
        <p className="eyebrow">Complément événementiel</p>
        <h2 className="mt-2 font-serif text-4xl font-extrabold tracking-tight text-zinc-950">
          Ajoutez le traiteur à votre événement.
        </h2>
        <p className="mt-4 text-base leading-7 text-zinc-600">
          Découvrez quelques présentations possibles, puis envoyez les détails de votre activité pour compléter votre
          décor avec une offre traiteur adaptée.
        </p>
        <Button asChild className="mt-6 w-full sm:w-auto">
          <a href="#/soumission?service=traiteur">
            <ClipboardList className="h-4 w-4" />
            Demander une soumission traiteur
          </a>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
        {cateringHighlights.map((highlight, index) => (
          <figure
            className={`relative overflow-hidden rounded-2xl bg-zinc-100 ${
              index === 0 ? "sm:row-span-2" : ""
            }`}
            key={highlight.label}
          >
            <img
              className={`${index === 0 ? "h-72 sm:h-full" : "h-36 sm:h-44"} w-full object-cover`}
              src={highlight.image}
              alt={highlight.label}
              loading="lazy"
              decoding="async"
            />
            <figcaption className="absolute inset-x-3 bottom-3 rounded-xl bg-white/92 px-3 py-2 text-sm font-extrabold text-zinc-950 shadow-sm backdrop-blur">
              {highlight.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
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
          <p className="font-extrabold">Ajouté au panier</p>
          <p className="mt-0.5 text-sm text-emerald-800">
            {item.quantity} × {item.name}. Vous pouvez continuer vos achats ou finaliser la commande.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:shrink-0">
        <Button asChild size="sm">
          <a href="#/panier">
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Voir le panier
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
    <div className="rounded-3xl border border-rose-200 bg-white px-6 py-12 text-center shadow-sm" role="alert">
      <p className="font-serif text-2xl font-extrabold text-zinc-950">Le catalogue ne peut pas être chargé.</p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-600">
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
    <div className="rounded-3xl border border-dashed border-rose-200 bg-rose-50/50 px-6 py-12 text-center">
      <p className="font-serif text-2xl font-extrabold text-zinc-950">Les produits seront bientôt disponibles.</p>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-600">
        Le catalogue Dégustation ne contient actuellement aucun produit publié.
      </p>
      <Button asChild className="mt-5" variant="outline">
        <a href="#/contact">Nous contacter</a>
      </Button>
    </div>
  );
}
