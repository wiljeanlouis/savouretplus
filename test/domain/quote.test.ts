import { describe, expect, it } from "vitest";
import type { CatalogProduct } from "../../src/domain/catalog";
import {
  createDecorationQuoteItem,
  findSelectedDecoration,
  getQuoteQueryFromHash,
} from "../../src/domain/quote";

const decoration: CatalogProduct = {
  id: "decor-42",
  bom_id: "decor-42",
  slug: "arche-romantique",
  name: "Arche romantique",
  category: "decoration",
  subcategory: "wedding",
  description: "Une arche fleurie.",
  product_type: "standard",
  purchase_modes: [],
  choice_group: null,
  ingredient_options: [],
  image_url: "/arche.png",
  gallery: ["/arche.png"],
  availability_note: "Sur demande",
};

describe("quote model selection", () => {
  it("validates the service and selected product slug", () => {
    expect(
      getQuoteQueryFromHash(
        "#/soumission?service=decoration&item=arche-romantique",
      ),
    ).toEqual({ service: "decoration", itemSlug: "arche-romantique" });
    expect(
      getQuoteQueryFromHash("#/soumission?service=inconnu&item=arche-romantique"),
    ).toEqual({ service: "", itemSlug: null });
    expect(
      getQuoteQueryFromHash("#/soumission?service=decoration&item=../../secret"),
    ).toEqual({ service: "decoration", itemSlug: null });
    expect(
      getQuoteQueryFromHash("#/soumission?service=traiteur&item=arche-romantique"),
    ).toEqual({ service: "traiteur", itemSlug: null });
  });

  it("selects only an existing decoration model", () => {
    const tasting = { ...decoration, id: "food", category: "tasting" as const };

    expect(findSelectedDecoration([decoration], "arche-romantique")).toBe(decoration);
    expect(findSelectedDecoration([decoration], "inexistant")).toBeNull();
    expect(findSelectedDecoration([tasting], "arche-romantique")).toBeNull();
  });

  it("keeps the model reference in the existing quote item shape", () => {
    expect(createDecorationQuoteItem(decoration)).toEqual({
      offering_id: "decor-42",
      name: "Arche romantique",
      requested_quantity: 1,
      configuration: {
        catalog_slug: "arche-romantique",
        category: "decoration",
        subcategory: "wedding",
      },
      note: null,
    });
  });
});
