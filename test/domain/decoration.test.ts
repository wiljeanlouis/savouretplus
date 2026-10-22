import { describe, expect, it } from "vitest";
import {
  decorationCategories,
  getDecorationCatalogTarget,
  getDecorationCategoryFromHash,
  groupDecorationProducts,
} from "../../src/domain/decoration";
import type { CatalogProduct, ProductSubcategory } from "../../src/domain/catalog";

function decorationProduct(
  id: string,
  subcategory: ProductSubcategory | null,
): CatalogProduct {
  return {
    id,
    bom_id: id,
    slug: id,
    name: id,
    category: "decoration",
    subcategory,
    description: "",
    product_type: "standard",
    purchase_modes: [
      {
        id: "unit",
        label: "Unité",
        quantity: 1,
        price_cents: 100,
        allocation_type: "none",
      },
    ],
    choice_group: null,
    ingredient_options: [],
    image_url: "/image.png",
    gallery: ["/image.png"],
    availability_note: "Disponible",
  };
}

describe("decoration categories", () => {
  it("defines the four menu destinations", () => {
    expect(
      decorationCategories.map(({ label, slug }) => ({
        label,
        href: `#/decoration?categorie=${slug}`,
      })),
    ).toEqual([
      { label: "Arche de ballon", href: "#/decoration?categorie=arche-de-ballon" },
      { label: "Centre de table", href: "#/decoration?categorie=centre-de-table" },
      { label: "Anniversaire", href: "#/decoration?categorie=anniversaire" },
      { label: "Mariage", href: "#/decoration?categorie=mariage" },
    ]);
  });

  it("resolves a valid deep link and rejects an unknown category", () => {
    expect(
      getDecorationCategoryFromHash("#/decoration?categorie=arche-de-ballon")?.id,
    ).toBe("balloon-arch");
    expect(getDecorationCategoryFromHash("#/decoration?categorie=inconnue")).toBeNull();
    expect(getDecorationCategoryFromHash("#/decoration")).toBeNull();
  });

  it("groups mapped products and preserves unmapped products", () => {
    const balloonArch = decorationProduct("arch", "balloon-arch");
    const unmapped = decorationProduct("legacy", null);

    const result = groupDecorationProducts([balloonArch, unmapped]);

    expect(result.groups.get("balloon-arch")).toEqual([balloonArch]);
    expect(result.groups.get("wedding")).toEqual([]);
    expect(result.other).toEqual([unmapped]);
  });

  it("keeps empty categories out of the populated groups", () => {
    const result = groupDecorationProducts([decorationProduct("wedding", "wedding")]);
    const populatedCategoryIds = decorationCategories
      .filter((category) => result.groups.get(category.id)?.length)
      .map((category) => category.id);

    expect(populatedCategoryIds).toEqual(["wedding"]);
  });

  it("targets a populated category and redirects an empty category to custom decoration", () => {
    const products = [decorationProduct("arch", "balloon-arch")];

    expect(
      getDecorationCatalogTarget("#/decoration?categorie=arche-de-ballon", products),
    ).toBe("decoration-arche-de-ballon");
    expect(
      getDecorationCatalogTarget("#/decoration?categorie=mariage", products),
    ).toBe("decoration-sur-mesure");
    expect(getDecorationCatalogTarget("#/decoration", products)).toBe(
      "decoration-catalogue",
    );
  });
});
