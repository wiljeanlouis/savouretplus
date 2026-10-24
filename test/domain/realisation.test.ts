import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { realisationsManifest } from "../../src/content/realisations";
import {
  filterRealisations,
  findPublishedRealisationBySlug,
  getAvailableRealisationCategories,
  getOrderedRealisationImages,
  getPublishedRealisations,
  getRealisationQuoteHref,
  type Realisation,
  validateRealisationsManifest,
} from "../../src/domain/realisation";

const fixture = (overrides: Partial<Realisation> = {}): Realisation => ({
  id: "fixture-1",
  slug: "fixture-realisation",
  title: "Réalisation test",
  description: "Description test",
  category: "decoration",
  coverImage: "./images/fixture-cover.jpg",
  images: [{ src: "./images/fixture-cover.jpg", alt: "Couverture", displayOrder: 2 }],
  published: true,
  displayOrder: 2,
  ...overrides,
});

describe("realisations manifest", () => {
  it("contains only valid unique entries and existing local photographs", () => {
    expect(validateRealisationsManifest(realisationsManifest)).toBe(realisationsManifest);

    for (const realisation of realisationsManifest) {
      for (const image of realisation.images) {
        const path = resolve(process.cwd(), "public", image.src.replace(/^\.\//, ""));
        expect(existsSync(path), image.src).toBe(true);
      }
    }
  });

  it("sorts published entries and hides unpublished ones", () => {
    const items = [
      fixture({ id: "third", slug: "third", displayOrder: 3 }),
      fixture({ id: "hidden", slug: "hidden", displayOrder: 1, published: false }),
      fixture({ id: "first", slug: "first", displayOrder: 1 }),
    ];

    expect(getPublishedRealisations(items).map((item) => item.slug)).toEqual(["first", "third"]);
    expect(findPublishedRealisationBySlug(items, "hidden")).toBeNull();
    expect(findPublishedRealisationBySlug(items, "third")?.id).toBe("third");
  });

  it("filters only categories present in the published collection", () => {
    const items = [
      fixture(),
      fixture({ id: "food", slug: "food", category: "traiteur" }),
    ];

    expect(filterRealisations(items, "traiteur").map((item) => item.slug)).toEqual(["food"]);
    expect(getAvailableRealisationCategories(items).map((category) => category.id)).toEqual([
      "decoration",
      "traiteur",
    ]);
  });

  it("supports ordered multi-image galleries and safe quote destinations", () => {
    const item = fixture({
      quoteService: "decoration",
      images: [
        { src: "./images/fixture-cover.jpg", alt: "Couverture", displayOrder: 2 },
        { src: "./images/fixture-second.jpg", alt: "Deuxième", displayOrder: 1 },
      ],
    });

    expect(getOrderedRealisationImages(item).map((image) => image.alt)).toEqual(["Deuxième", "Couverture"]);
    expect(getRealisationQuoteHref(item)).toBe("#/soumission?service=decoration");
    expect(getRealisationQuoteHref(fixture())).toBe("#/soumission");
  });

  it("rejects duplicate slugs, unknown categories and missing covers", () => {
    expect(() => validateRealisationsManifest([fixture(), fixture({ id: "fixture-2" })])).toThrow(/Slug/);
    expect(() => validateRealisationsManifest([fixture({ category: "inconnue" as never })])).toThrow(/Catégorie/);
    expect(() => validateRealisationsManifest([fixture({ coverImage: "./images/missing.jpg" })])).toThrow(/couverture/i);
  });
});
