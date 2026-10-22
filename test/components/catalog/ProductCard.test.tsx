import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductCard } from "../../../src/components/catalog/ProductCard";
import type { CatalogProduct } from "../../../src/domain/catalog";

const product: CatalogProduct = {
  id: "product-1",
  bom_id: "product-1",
  slug: "modele-photo",
  name: "Modèle photo",
  category: "decoration",
  subcategory: "birthday",
  description: "Une décoration photographique.",
  product_type: "standard",
  purchase_modes: [
    {
      id: "unit",
      label: "Unité",
      quantity: 1,
      price_cents: 12345,
      allocation_type: "none",
    },
  ],
  choice_group: null,
  ingredient_options: [],
  image_url: "/photo-1.png",
  gallery: ["/photo-1.png", "/photo-2.png"],
  availability_note: "Sur demande",
};

describe("ProductCard commercial modes", () => {
  it("shows a decoration as a photo-led quote card without a price", () => {
    const html = renderToStaticMarkup(<ProductCard product={product} action="quote" />);

    expect(html).toContain("object-cover");
    expect(html).toContain("Demander une soumission");
    expect(html).toContain("item=modele-photo");
    expect(html).toContain("Image suivante");
    expect(html).not.toContain("123,45");
  });

  it("keeps pricing and ordering for tasting products", () => {
    const html = renderToStaticMarkup(
      <ProductCard product={{ ...product, category: "tasting" }} action="order" />,
    );

    expect(html).toContain("object-contain");
    expect(html).toContain("123,45");
    expect(html).toContain("Commander");
  });

  it("presents every real sales format and its price", () => {
    const html = renderToStaticMarkup(
      <ProductCard
        product={{
          ...product,
          category: "tasting",
          purchase_modes: [
            product.purchase_modes[0],
            { ...product.purchase_modes[0], id: "dozen", label: "Douzaine", price_cents: 3000 },
          ],
        }}
        action="order"
      />,
    );

    expect(html).toContain("Unité");
    expect(html).toContain("Douzaine");
    expect(html).toContain("30,00");
  });

  it("disables ordering when no sales format is available", () => {
    const html = renderToStaticMarkup(
      <ProductCard
        product={{ ...product, category: "tasting", purchase_modes: [] }}
        action="order"
      />,
    );

    expect(html).toContain("Indisponible");
    expect(html).toContain("disabled");
  });
});
