import { useEffect, useMemo } from "react";
import {
  decorationCategories,
  getDecorationCatalogTarget,
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
              {products.length === 0 ? <DecorationCatalogEmptyState /> : null}
              {populatedCategories.map((category) => (
                <DecorationProductSection
                  category={category}
                  products={productGroups.groups.get(category.id) || []}
                  key={category.id}
                />
              ))}
              {productGroups.other.length ? (
                <OtherDecorationProducts products={productGroups.other} />
              ) : null}
              <CustomDecorationSection />
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
      <DecorationProductGrid products={products} />
    </section>
  );
}

function DecorationCatalogEmptyState() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="eyebrow">Catalogue en préparation</p>
      <h2 className="mt-3 font-serif text-3xl font-bold text-zinc-950">
        Nos modèles seront bientôt présentés ici.
      </h2>
      <p className="mt-3 leading-7 text-zinc-600">
        Notre service de décoration demeure disponible. Décrivez-nous votre événement pour recevoir
        une proposition personnalisée.
      </p>
    </div>
  );
}

function CustomDecorationSection() {
  return (
    <section
      className="scroll-mt-24 rounded-3xl border border-rose-200 bg-rose-50/60 p-6 sm:p-8"
      id="decoration-sur-mesure"
    >
      <div className="max-w-2xl">
        <p className="eyebrow">Une idée différente?</p>
        <h2 className="mt-2 font-serif text-3xl font-bold text-zinc-950">
          Décoration sur mesure
        </h2>
        <p className="mt-3 leading-7 text-zinc-600">
          Vous ne trouvez pas encore le modèle recherché? Parlez-nous de votre thème, de votre lieu
          et de votre budget. Nous préparerons une proposition adaptée à votre événement.
        </p>
        <Button className="mt-5" asChild>
          <a href="#/soumission?service=decoration">
            <ClipboardList className="h-4 w-4" />
            Demander une soumission
          </a>
        </Button>
      </div>
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
