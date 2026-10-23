import { ArrowLeft, Check, ClipboardList, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { CatalogProduct } from "../../../domain/catalog";
import { findPublishedDecoration, getDecorationCategory } from "../../../domain/decoration";
import { Button } from "../../ui/button";
import { ProductGallery } from "../ProductGallery";
import { useCatalogProducts } from "../useCatalogProducts";

type DecorationDetailPageProps = {
  slug: string | null;
  cart?: { addDecoration: (product: CatalogProduct, options?: { quantity?: number; note?: string }) => void } | null;
};

export function DecorationDetailPage({ slug, cart = null }: DecorationDetailPageProps) {
  const { products, loading, error, retry } = useCatalogProducts("decoration");
  const product = findPublishedDecoration(products, slug);

  if (loading) {
    return <DecorationDetailLoadingState />;
  }

  if (error) return <DecorationDetailErrorState onRetry={retry} />;
  if (!product) return <DecorationDetailUnavailableState />;

  return <DecorationDetailContent product={product} onSelect={cart?.addDecoration} />;
}

export function DecorationDetailLoadingState() {
  return (
    <section
      className="animate-pulse bg-ivory pb-20 sm:pb-24"
      role="status"
      aria-busy="true"
      aria-label="Chargement de la décoration"
    >
      <div className="border-b border-blush/50 bg-white">
        <div className="container-page flex items-center gap-3 py-5">
          <div className="h-4 w-20 rounded bg-blush/45" />
          <div className="h-4 w-2 rounded bg-blush/30" />
          <div className="h-4 w-36 rounded bg-blush/30" />
        </div>
      </div>

      <div className="container-page pt-10 sm:pt-14">
        <div className="h-4 w-40 rounded bg-blush/50" />

        <div className="mt-7 grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start xl:gap-16">
          <div className="h-[22rem] max-h-[38rem] border border-blush/50 bg-blush/35 shadow-[0_18px_50px_rgba(53,42,43,0.05)] sm:h-[30rem] lg:h-[34rem] xl:h-[38rem]" />

          <div className="pt-1 lg:sticky lg:top-28">
            <div className="h-3 w-28 rounded bg-wine/20" />
            <div className="mt-5 h-12 w-11/12 rounded bg-espresso/15 sm:h-14" />
            <div className="mt-3 h-12 w-3/5 rounded bg-espresso/15 sm:h-14" />

            <div className="mt-7 space-y-3">
              <div className="h-4 w-full rounded bg-espresso/10" />
              <div className="h-4 w-11/12 rounded bg-espresso/10" />
              <div className="h-4 w-3/4 rounded bg-espresso/10" />
            </div>

            <div className="mt-7 border-y border-blush/60 py-5">
              <div className="h-3 w-36 rounded bg-wine/20" />
              <div className="mt-3 h-4 w-28 rounded bg-espresso/15" />
            </div>

            <div className="mt-7 h-12 w-full rounded bg-wine/20 sm:w-80" />
          </div>
        </div>
      </div>
      <span className="sr-only">Chargement de la fiche décoration…</span>
    </section>
  );
}

export function DecorationDetailContent({
  product,
  onSelect,
}: {
  product: CatalogProduct;
  onSelect?: (product: CatalogProduct, options?: { quantity?: number; note?: string }) => void;
}) {
  const category = getDecorationCategory(product.subcategory);

  return (
    <article className="bg-ivory pb-20 sm:pb-24">
      <div className="border-b border-blush/50 bg-white">
        <div className="container-page py-5">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-espresso/60" aria-label="Fil d'Ariane">
            <a className="transition hover:text-wine" href="#/decoration">Décoration</a>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-espresso" aria-current="page">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-page pt-10 sm:pt-14">
        <a className="editorial-link" href="#/decoration">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour aux décorations
        </a>

        <div className="mt-7 grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start xl:gap-16">
          <ProductGallery
            className="min-h-[22rem] rounded-none border border-blush/50 bg-blush/15 shadow-[0_18px_50px_rgba(53,42,43,0.06)]"
            images={product.gallery}
            fallbackImage={product.image_url}
            intrinsicHeight
            productName={product.name}
            fit="contain"
            priority
            rounded={false}
          />

          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">{category?.label || "Décoration"}</p>
            <h1 className="mt-4 font-serif text-5xl font-semibold leading-[0.92] tracking-[-0.03em] text-espresso sm:text-6xl">
              {product.name}
            </h1>
            {product.description ? (
              <p className="mt-6 text-base leading-8 text-espresso/70">{product.description}</p>
            ) : null}

            {product.availability_note ? (
              <div className="mt-7 border-y border-blush/60 py-5">
                <p className="text-[0.66rem] font-bold uppercase tracking-[0.2em] text-wine">Disponibilité publiée</p>
                <p className="mt-2 text-sm font-semibold text-espresso">{product.availability_note}</p>
              </div>
            ) : null}

            {onSelect ? <DecorationSelectionForm product={product} onSelect={onSelect} /> : null}

            <a
              className="editorial-link mt-5"
              href={`#/soumission?service=decoration&item=${encodeURIComponent(product.slug)}`}
            >
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              Demander une soumission pour cet article
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function DecorationSelectionForm({ product, onSelect }) {
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [added, setAdded] = useState(false);

  function addToSelection() {
    const normalizedQuantity = Math.max(1, Math.min(1000, Math.trunc(Number(quantity) || 1)));
    onSelect(product, { quantity: normalizedQuantity, note });
    setQuantity(normalizedQuantity);
    setAdded(true);
  }

  return (
    <section className="mt-7 border border-blush/60 bg-white p-5" aria-labelledby="decoration-selection-title">
      <h2 className="font-serif text-2xl font-semibold text-espresso" id="decoration-selection-title">
        Ajouter à ma sélection
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-[7rem_1fr]">
        <label className="grid gap-2 text-sm font-semibold text-espresso">
          Quantité
          <input
            className="h-11 border border-blush bg-white px-3 text-center"
            min="1"
            max="1000"
            step="1"
            type="number"
            value={quantity}
            onChange={(event) => {
              setQuantity(Number(event.target.value));
              setAdded(false);
            }}
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-espresso">
          Préférences <span className="font-normal text-espresso/55">(facultatif)</span>
          <textarea
            className="min-h-20 border border-blush bg-white px-3 py-2 font-normal"
            maxLength={500}
            placeholder="Couleurs, thème ou précision utile"
            value={note}
            onChange={(event) => {
              setNote(event.target.value);
              setAdded(false);
            }}
          />
        </label>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="button" onClick={addToSelection}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Ajouter à ma sélection
        </Button>
        {added ? (
          <a className="editorial-link" href="#/panier">
            <Check className="h-4 w-4" aria-hidden="true" />
            Article ajouté — voir ma sélection
          </a>
        ) : null}
      </div>
    </section>
  );
}

export function DecorationDetailUnavailableState() {
  return (
    <section className="bg-ivory py-20 sm:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl border border-blush/60 bg-white px-6 py-12 text-center shadow-[0_18px_50px_rgba(53,42,43,0.06)] sm:px-10">
          <p className="eyebrow">Décoration</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold text-espresso">Cet article n'est plus disponible.</h1>
          <p className="mt-4 leading-7 text-espresso/65">
            Il est introuvable ou n'est plus publié dans notre collection. Découvrez les décorations actuellement proposées ou décrivez-nous votre idée.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="outline"><a href="#/decoration">Voir les décorations</a></Button>
            <Button asChild><a href="#/soumission?service=decoration">Imaginer un décor sur mesure</a></Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DecorationDetailErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="bg-ivory py-20 sm:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl border border-blush/60 bg-white px-6 py-12 text-center" role="alert">
          <h1 className="font-serif text-4xl font-semibold text-espresso">Impossible de charger cet article.</h1>
          <p className="mt-3 text-sm leading-6 text-espresso/65">Vérifiez votre connexion avant de réessayer.</p>
          <Button className="mt-6" type="button" variant="outline" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Réessayer
          </Button>
        </div>
      </div>
    </section>
  );
}
