import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ProductConfigurator } from "../../../src/components/catalog/ProductConfigurator";
import type { CatalogProduct } from "../../../src/domain/catalog";

const product: CatalogProduct = {
  id: "pate-four",
  bom_id: "pate-four",
  slug: "pate-cuit-au-four",
  name: "Pâté cuit au four",
  category: "tasting",
  subcategory: null,
  description: "Une pâte brisée croustillante.",
  product_type: "single_choice",
  purchase_modes: [
    {
      id: "unit",
      label: "Unité",
      quantity: 1,
      price_cents: 400,
      allocation_type: "single_choice",
    },
    {
      id: "dozen",
      label: "Douzaine",
      quantity: 12,
      price_cents: 3000,
      allocation_type: "single_choice",
    },
  ],
  choice_group: {
    label: "Farce disponible",
    required: true,
    options: [
      { id: "tuna", name: "Thon" },
      { id: "chicken", name: "Poulet" },
    ],
  },
  ingredient_options: [],
  image_url: "/pate-four.png",
  gallery: ["/pate-four.png"],
  availability_note: "Disponible sur commande",
};

describe("ProductConfigurator drawer", () => {
  it("uses the C2 palette for selected options and contains the product image", () => {
    const html = renderToStaticMarkup(
      <ProductConfigurator
        product={product}
        open
        onClose={vi.fn()}
        onAdd={vi.fn()}
      />,
    );

    expect(html).toContain("border-wine bg-blush/25 text-wine");
    expect(html).toContain("border-wine bg-wine text-white");
    expect(html).toContain("h-full w-full object-contain");
    expect(html).not.toContain("border-rose-600");
    expect(html).not.toContain("bg-rose-600");
  });
});
