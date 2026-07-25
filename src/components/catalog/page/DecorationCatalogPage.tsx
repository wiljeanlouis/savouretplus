import { useEffect, useMemo } from "react";
import {
  decorationCategories,
  getDecorationCategoryFromHash,
  groupDecorationProducts,
} from "../../../domain/decoration";
import { Button } from "../../ui/button";
import { BreadcrumbHero } from "../../layout/BreadcrumbHero";
import { CatalogLoadingState } from "../CatalogLoadingState";
import { ProductCard } from "../ProductCard";
import { useCatalogProducts } from "../useCatalogProducts";
import { ClipboardList } from "lucide-react";

const DECORATION_CATEGORY = "decoration";

export function DecorationCatalogPage() {
  const { products, loading } = useCatalogProducts(DECORATION_CATEGORY);
  const productGroups = useMemo(() => groupDecorationProducts(products), [products]);

  useEffect(() => {
    if (loading) return;

    function scrollToRequestedCategory() {
      const requestedCategory = getDecorationCategoryFromHash(window.location.hash);
      const targetId = requestedCategory
        ? `decoration-${requestedCategory.slug}`
        : "decoration-catalogue";

      window.requestAnimationFrame(() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    scrollToRequestedCategory();
    window.addEventListener("hashchange", scrollToRequestedCategory);
    return () => window.removeEventListener("hashchange", scrollToRequestedCategory);
  }, [loading]);

  return (
    <>
      <BreadcrumbHero
        title="Décoration"
        image="./images/catalog/decoration/breadcrumbs-bg-decoration.png"
        subtitle="Parcourez nos éléments de décoration et demandez une soumission pour recevoir une proposition adaptée à votre budget."
        action={
          <Button asChild>
            <a href="#/soumission?service=decoration">
              <ClipboardList className="h-4 w-4" />
              Demander une soumission décoration
            </a>
          </Button>
        }
      />
      <section className="scroll-mt-24 py-20" id="decoration-catalogue">
        <div className="container-page">
          {loading ? (
            <CatalogLoadingState />
          ) : (
            <div className="grid gap-16">
              {decorationCategories.map((category) => (
                <DecorationProductSection
                  category={category}
                  products={productGroups.groups.get(category.id) || []}
                  key={category.id}
                />
              ))}
              {productGroups.other.length ? (
                <OtherDecorationProducts products={productGroups.other} />
              ) : null}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function DecorationProductSection({ category, products }) {
  return (
    <section className="scroll-mt-24" id={`decoration-${category.slug}`}>
      <div className="mb-6 max-w-2xl">
        <h2 className="mt-2 font-serif text-3xl font-bold">{category.label}</h2>
        <p className="mt-3 leading-7 text-zinc-600">{category.description}</p>
      </div>
      {products.length ? (
        <DecorationProductGrid products={products} />
      ) : (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/60 p-8">
          <h3 className="font-serif text-xl font-bold text-zinc-950">
            Un décor créé pour votre événement
          </h3>
          <p className="mt-2 max-w-2xl text-zinc-600">
            Aucun modèle n’est publié dans cette catégorie pour le moment. Parlez-nous de votre
            thème et nous préparerons une proposition personnalisée.
          </p>
          <Button className="mt-5" asChild>
            <a href={`#/soumission?service=decoration&categorie=${category.slug}`}>
              Demander une soumission
            </a>
          </Button>
        </div>
      )}
    </section>
  );
}

function OtherDecorationProducts({ products }) {
  return (
    <section className="scroll-mt-24" id="decoration-autres">
      <div className="mb-6">
        <h2 className="mt-2 font-serif text-3xl font-bold">Autres décorations</h2>
      </div>
      <DecorationProductGrid products={products} />
    </section>
  );
}

function DecorationProductGrid({ products }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          action="quote"
        />
      ))}
    </div>
  );
}
