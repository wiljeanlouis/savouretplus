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
  note: "Rose poudré",
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
  it("offers both catalogues from an empty selection", () => {
    const html = renderToStaticMarkup(
      <CartPage
        cart={{
          items: [],
          totalCents: 0,
          count: 0,
          updateQuantity: vi.fn(),
          updateNote: vi.fn(),
          remove: vi.fn(),
          clear: vi.fn(),
        }}
      />,
    );

    expect(html).toContain("Votre sélection est vide");
    expect(html).toContain("Découvrir les décorations");
    expect(html).toContain('href="#/decoration"');
    expect(html).toContain("Découvrir les spécialités");
    expect(html).toContain('href="#/degustation"');
    expect(html).toContain("py-9 text-center sm:py-10 lg:py-11");
    expect(html).toContain("relative mx-auto h-7 w-7");
    expect(html).not.toContain("border-dashed");
  });

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

  it("explains when a mixed submission has no compatible route", () => {
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
    expect(html).toContain("Prix sur soumission");
    expect(html).toContain("Préférences : Rose poudré");
    expect(html).toContain("Demander une soumission");
    expect(html).toContain("service=traiteur-decoration&amp;source=selection");
    expect(html).not.toContain("temporairement indisponible");
    expect(html).not.toContain("Transmettre la demande");
    expect(html).not.toContain("0,00 $");
  });

  it("keeps tasting quantities, configuration, price and direct-order actions", () => {
    const configuredTasting: CartItem = {
      ...tasting,
      quantity: 2,
      selection: {
        choice_id: "beef",
        choice_name: "Bœuf",
        group_label: "Saveur",
      },
      ingredients: [
        {
          id: "pepper",
          name: "Piment",
          quantity: 0,
          default_quantity: 1,
          extra_price_cents: 0,
        },
      ],
    };
    const html = renderToStaticMarkup(
      <CartPage
        cart={{
          items: [configuredTasting],
          totalCents: 600,
          count: 2,
          updateQuantity: vi.fn(),
          updateNote: vi.fn(),
          remove: vi.fn(),
          clear: vi.fn(),
        }}
      />,
    );

    expect(html).toContain('value="2"');
    expect(html).toContain("Format : Unité");
    expect(html).toContain("Saveur : Bœuf");
    expect(html).toContain("Sans Piment");
    expect(html).toContain("6,00 $");
    expect(html).toContain("Transmettre la demande");
    expect(html).toContain("Envoyer la demande");
    expect(html).toContain("Collez sa référence ici (ex. REA-0001).");
    expect(html).toContain('aria-describedby="order-note-hint"');
    expect(html).toContain("Demander une soumission");
  });

  it("keeps a decoration-only selection on the quote path without a fictional price", () => {
    const html = renderToStaticMarkup(
      <CartPage
        cart={{
          items: [decoration],
          totalCents: 0,
          count: 1,
          updateQuantity: vi.fn(),
          updateNote: vi.fn(),
          remove: vi.fn(),
          clear: vi.fn(),
        }}
      />,
    );

    expect(html).toContain("Prix sur soumission");
    expect(html).toContain("Sur soumission");
    expect(html).toContain("Préférences : Rose poudré");
    expect(html).toContain("Demander une soumission");
    expect(html).not.toContain("Transmettre la demande");
    expect(html).not.toContain("0,00");
  });
});
