import { ChevronLeft, ChevronRight, PartyPopper, Settings2 } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "../../shared/format";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export function ProductCard({ product, action, onCustomize }) {
  const [activeImage, setActiveImage] = useState(0);
  const gallery = product.gallery?.length ? product.gallery : [product.image_url];
  const currentImage = gallery[activeImage] || gallery[0];

  function showPreviousImage() {
    setActiveImage((current) => (current - 1 + gallery.length) % gallery.length);
  }

  function showNextImage() {
    setActiveImage((current) => (current + 1) % gallery.length);
  }

  return (
    <Card className="group overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex h-full flex-col">
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50 p-4">
          <div className="grid aspect-[5/3] place-items-center rounded-xl bg-white/70 p-3">
            <img
              className="h-full w-full object-contain drop-shadow-sm transition duration-500 group-hover:scale-[1.03]"
              src={currentImage}
              alt={product.name}
            />
          </div>
          {gallery.length > 1 ? (
            <>
              <button
                className="absolute left-6 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-zinc-700 shadow-sm transition hover:bg-white hover:text-rose-700"
                type="button"
                onClick={showPreviousImage}
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className="absolute right-6 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-zinc-700 shadow-sm transition hover:bg-white hover:text-rose-700"
                type="button"
                onClick={showNextImage}
                aria-label="Image suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : null}
          <div className="absolute left-6 top-6 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-700 shadow-sm">
            {product.availability_note}
          </div>
          {gallery.length > 1 ? (
            <div className="mt-3 flex items-center justify-center gap-2">
              {gallery.map((image, index) => (
                <button
                  className={`h-2.5 rounded-full transition-all ${
                    activeImage === index ? "w-8 bg-rose-600" : "w-2.5 bg-zinc-300 hover:bg-zinc-400"
                  }`}
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Voir l'image ${index + 1}`}
                />
              ))}
            </div>
          ) : null}
        </div>
        <CardContent className="flex flex-1 flex-col p-5">
          <div>
            <h3 className="text-xl font-extrabold text-zinc-950">{product.name}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600">{product.description}</p>
            <ProductOptionSummary product={product} />
          </div>

          <div className="mt-auto pt-6">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <ProductPriceSummary product={product} />
            </div>

            <div className="mt-4">
              {action === "quote" ? (
                <Button asChild className="w-full" variant="outline">
                  <a href={`#/soumission?service=decoration&item=${encodeURIComponent(product.slug)}`}>
                    <PartyPopper className="h-4 w-4" />
                    Demander une soumission
                  </a>
                </Button>
              ) : (
                <Button
                  className="w-full"
                  type="button"
                  disabled={!product.purchase_modes?.length}
                  onClick={onCustomize}
                >
                  <Settings2 className="h-4 w-4" />
                  Commander
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

function ProductPriceSummary({ product }) {
  return product.purchase_modes.map((mode) => (
    <span className="inline-flex items-baseline gap-1" key={mode.id}>
      <span className="text-2xl font-extrabold text-zinc-950">{formatCurrency(mode.price_cents)}</span>
      <span className="text-sm font-semibold text-zinc-500">/ {mode.label.toLowerCase()}</span>
    </span>
  ));
}

function ProductOptionSummary({ product }) {
  if (
    (product.product_type === "single_choice" ||
      product.product_type === "single_choice_bundle") &&
    product.choice_group?.options?.length
  ) {
    return (
      <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-600">
        <p className="font-semibold text-zinc-900">{product.choice_group.label || "Options"}:</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {product.choice_group.options.map((option) => (
            <span
              className="rounded-full border border-rose-200 bg-white px-2.5 py-1 text-xs font-semibold text-rose-700"
              key={option.id}
            >
              {option.name}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (product.product_type === "ingredient_customization") {
    return (
      <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-600">
        <p className="font-semibold text-zinc-900">Inclus:</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {product.ingredient_options?.map((ingredient) => (
            <span
              className="rounded-full border border-rose-200 bg-white px-2.5 py-1 text-xs font-semibold text-rose-700"
              key={ingredient.id}
            >
              {ingredient.name}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
