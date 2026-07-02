import { useEffect, useState } from "react";
import { fetchCatalogProducts } from "../../application/commerce";
import { BreadcrumbHero } from "../layout/BreadcrumbHero";
import { DecorationIntro, TastingIntro } from "./CatalogIntros";
import { ProductCard } from "./ProductCard";
import { ProductConfigurator } from "./ProductConfigurator";

const TASTING_CATEGORY = "tasting";
const DECORATION_CATEGORY = "decoration";

export function TastingCatalogPage({ cart, onCartOpen }) {
  return (
    <CatalogExperience
      category={TASTING_CATEGORY}
      title="Dégustation"
      heroImage="./images/catalog/tasting/breadcrumbs-bg-pates.png"
      subtitle="Complétez votre événement avec nos spécialités ou demandez une soumission traiteur."
      intro={<TastingIntro />}
      action="order"
      cart={cart}
      onCartOpen={onCartOpen}
    />
  );
}

export function DecorationCatalogPage() {
  return (
    <CatalogExperience
      category={DECORATION_CATEGORY}
      title="Décoration"
      heroImage="./images/catalog/decoration/breadcrumbs-bg-decoration.png"
      subtitle="Imaginez le décor de votre événement et demandez une soumission adaptée à votre thème."
      intro={<DecorationIntro />}
      action="quote"
    />
  );
}

function CatalogExperience({ category, title, heroImage, subtitle, intro, action, cart, onCartOpen }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    fetchCatalogProducts(category)
      .then((data) => {
        if (mounted) setProducts(data.filter((product) => product.category === category));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [category]);

  function addConfiguredProduct(product, options) {
    if (!cart || !onCartOpen) return;

    cart.add(product, options);
    setSelectedProduct(null);
    onCartOpen();
  }

  return (
    <>
      <BreadcrumbHero title={title} image={heroImage} subtitle={subtitle} />
      <section className="py-20">
        <div className="container-page">
          {intro}

          {loading ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-500">
              Chargement du catalogue...
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  action={action}
                  onCustomize={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {action === "order" ? (
        <ProductConfigurator
          product={selectedProduct}
          open={Boolean(selectedProduct)}
          onClose={() => setSelectedProduct(null)}
          onAdd={addConfiguredProduct}
        />
      ) : null}
    </>
  );
}
