import { ArrowRight, ClipboardList } from "lucide-react";
import type { CatalogProduct } from "../../domain/catalog";
import { getDecorationCategory, getDecorationDetailHash } from "../../domain/decoration";
import { Button } from "../ui/button";
import { ProductGallery } from "./ProductGallery";

type DecorationProductCardProps = {
  product: CatalogProduct;
  featured?: boolean;
  anchorId?: string;
};

export function DecorationProductCard({
  product,
  featured = false,
  anchorId,
}: DecorationProductCardProps) {
  const detailHref = getDecorationDetailHash(product);
  const category = getDecorationCategory(product.subcategory);

  return (
    <article
      className={`group scroll-mt-28 overflow-hidden border border-blush/50 bg-white shadow-[0_18px_50px_rgba(53,42,43,0.06)] ${
        featured ? "grid lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch" : "flex h-full flex-col"
      }`}
      id={anchorId}
    >
      <ProductGallery
        className={`${featured ? "min-h-[22rem] lg:min-h-[30rem]" : "aspect-[4/3]"} rounded-none`}
        images={product.gallery}
        fallbackImage={product.image_url}
        productName={product.name}
        fit="cover"
        rounded={false}
      />

      <div className={`flex flex-1 flex-col ${featured ? "justify-center p-7 sm:p-10 lg:p-12" : "p-6"}`}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.66rem] font-bold uppercase tracking-[0.2em]">
          <span className="text-wine">{category?.label || "Autres décorations"}</span>
          {product.availability_note ? (
            <span className="text-espresso/50">{product.availability_note}</span>
          ) : null}
        </div>
        <h3 className={`${featured ? "mt-3 text-4xl sm:text-5xl" : "mt-2 text-3xl"} font-serif font-semibold leading-none text-espresso`}>
          <a className="transition hover:text-wine" href={detailHref}>
            {product.name}
          </a>
        </h3>
        {product.description ? (
          <p className="mt-4 line-clamp-4 text-sm leading-7 text-espresso/65">
            {product.description}
          </p>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button asChild variant="outline">
            <a href={detailHref}>
              Voir le détail
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
          <Button asChild variant="ghost">
            <a href={`#/soumission?service=decoration&item=${encodeURIComponent(product.slug)}`}>
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              Demander une soumission
            </a>
          </Button>
        </div>
      </div>
    </article>
  );
}
