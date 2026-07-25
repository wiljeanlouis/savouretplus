import { useState } from "react";
import { BreadcrumbHero } from "../../layout/BreadcrumbHero";
import { CatalogLoadingState } from "../CatalogLoadingState";
import { Button } from "../../ui/button";
import { ProductCard } from "../ProductCard";
import { ProductConfigurator } from "../ProductConfigurator";
import { useCatalogProducts } from "../useCatalogProducts";
import { ClipboardList } from "lucide-react";

const TASTING_CATEGORY = "tasting";
const cateringHighlights = [
  {
    label: "Plateaux à partager",
    image: "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=900&h=700&q=80",
  },
  {
    label: "Service pour événements",
    image: "./images/home/offer-2-340x243.png",
  },
  {
    label: "Tables de réception",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&h=700&q=80",
  },
];


export function TastingCatalogPage({ cart, onCartOpen }) {
  const { products, loading } = useCatalogProducts(TASTING_CATEGORY);
  const [selectedProduct, setSelectedProduct] = useState(null);

  function addConfiguredProduct(product, options) {
    cart.add(product, options);
    setSelectedProduct(null);
    onCartOpen();
  }

  return (
    <>
      <BreadcrumbHero
        title="Dégustation"
        image="./images/catalog/tasting/breadcrumbs-bg-pates.png"
        subtitle="Complétez votre événement avec nos spécialités ou demandez une soumission traiteur."
      />
      <section className="py-20">
        <div className="container-page">
          <TastingIntro />

          {loading ? (
            <CatalogLoadingState />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
    <div className="mb-10 grid gap-6 rounded-3xl border border-rose-100 bg-white p-5 shadow-sm lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:p-6">
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