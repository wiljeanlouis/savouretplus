import { PartyPopper, Settings2 } from "lucide-react";
import { formatCurrency } from "../../shared/format";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ProductGallery } from "./ProductGallery";

export function ProductCard({ product, action, onCustomize = undefined }) {
  const isAvailable = action === "quote" || Boolean(product.purchase_modes?.length);

  return (
    <Card className="group overflow-hidden rounded-3xl border-zinc-200/80 transition duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-950/8">
      <div className="flex h-full flex-col">
        <div className="relative p-3 pb-0">
          <ProductGallery
            className="aspect-[4/3] rounded-2xl p-3"
            images={product.gallery}
            fallbackImage={product.image_url}
            productName={product.name}
            fit={action === "quote" ? "cover" : "contain"}
          />
          {product.availability_note ? (
            <div className="absolute left-6 top-6 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-rose-700 shadow-sm backdrop-blur">
              {product.availability_note}
            </div>
          ) : null}
        </div>
        <CardContent className="flex flex-1 flex-col p-6">
          <div>
            <h3 className="font-serif text-2xl font-extrabold tracking-tight text-zinc-950">{product.name}</h3>
            {product.description ? (
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600">{product.description}</p>
            ) : null}
            {action === "order" ? <ProductOptionSummary product={product} /> : null}
          </div>

          <div className="mt-auto pt-6">
            {action === "order" ? (
              <div className="grid gap-2 border-t border-zinc-100 pt-4">
                <ProductPriceSummary product={product} />
              </div>
            ) : null}

            <div className={action === "order" ? "mt-4" : ""}>
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
                  disabled={!isAvailable}
                  onClick={onCustomize}
                >
                  <Settings2 className="h-4 w-4" />
                  {isAvailable ? "Commander" : "Indisponible"}
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
  if (!product.purchase_modes?.length) {
    return <span className="text-sm font-semibold text-zinc-500">Aucun format disponible</span>;
  }

  return product.purchase_modes.map((mode) => (
    <span className="flex items-baseline justify-between gap-3" key={mode.id}>
      <span className="text-sm font-semibold text-zinc-600">{mode.label}</span>
      <span className="text-lg font-extrabold text-zinc-950">{formatCurrency(mode.price_cents)}</span>
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
      <div className="mt-4 rounded-xl bg-rose-50/70 px-3 py-2.5 text-sm text-zinc-700">
        <span className="font-semibold text-zinc-950">{product.choice_group.label || "Options"} : </span>
        {product.choice_group.options.map((option) => option.name).join(", ")}
      </div>
    );
  }

  if (product.product_type === "ingredient_customization") {
    return (
      <div className="mt-4 rounded-xl bg-rose-50/70 px-3 py-2.5 text-sm text-zinc-700">
        <span className="font-semibold text-zinc-950">Composition personnalisable : </span>
        {product.ingredient_options?.map((ingredient) => ingredient.name).join(", ")}
      </div>
    );
  }

  return null;
}
