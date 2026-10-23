import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CartPage, SelectionCommercialActions } from "../../../src/components/cart/CartPage";
import type { CartItem } from "../../../src/domain/cart";

const decoration: CartItem = {
  key: "decor:quote:none",
  product_id: "decor",
  bom_id: "decor",
  catalog_slug: "arche",
  name: "Arche",
  category: "decoration",
  subcategory: "decorative-arch",
  product_type: "standard",
  pricing: "quote",
  base_price_cents: null,
  unit_price_cents: null,
  purchase_mode: null,
  selection: null,
  allocation: [],
  ingredients: [],
  quantity: 1,
  image_url: "/decor.png",
  note: null,
};

const tasting: CartItem = {
  ...decoration,
  key: "food:unit",
  product_id: "food",
  name: "Pâté",
  category: "tasting",
  subcategory: null,
  pricing: "known",
  base_price_cents: 300,
  unit_price_cents: 300,
  purchase_mode: { id: "unit", label: "Unité", quantity: 1, price_cents: 300, allocation_type: "none" },
};

describe("selection commercial actions", () => {
  it("presents quote-only decoration without a zero price", () => {
    const html = renderToStaticMarkup(
      <SelectionCommercialActions
        cart={{ items: [decoration], totalCents: 0 }}
        orderEligible={false}
        quoteHash="#/soumission?service=decoration&source=selection"
      />,
    );

    expect(html).toContain("Aucun article tarifé");
    expect(html).toContain("Demander une soumission");
    expect(html).not.toContain("0,00");
  });

  it("blocks unsupported mixed submission without adding organisation", () => {
    const html = renderToStaticMarkup(
      <SelectionCommercialActions
        cart={{ items: [decoration, tasting], totalCents: 300 }}
        orderEligible={false}
        quoteHash={null}
      />,
    );

    expect(html).toContain("temporairement indisponible");
    expect(html).toContain("sans Organisation");
    expect(html).not.toContain("service=traiteur-decoration-organisation");
  });

  it("groups a mixed selection and does not expose the direct order form", () => {
    const html = renderToStaticMarkup(
      <CartPage
        cart={{
          items: [decoration, tasting],
          totalCents: 300,
          count: 2,
          updateQuantity: vi.fn(),
          updateNote: vi.fn(),
          remove: vi.fn(),
          clear: vi.fn(),
        }}
      />,
    );

    expect(html).toContain("Ma sélection");
    expect(html).toContain("Décoration");
    expect(html).toContain("Dégustation");
    expect(html).toContain("Tarification sur soumission");
    expect(html).not.toContain("Transmettre la demande");
  });
});
