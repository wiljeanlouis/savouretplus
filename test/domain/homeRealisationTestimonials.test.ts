import { describe, expect, it } from "vitest";
import { getHomeRealisationTestimonials, validateRealisationsManifest, type Realisation, type RealisationTestimonial } from "../../src/domain/realisation";

const testimonial: RealisationTestimonial = { quote: "Texte technique non publiable", author: "Attribution de test" };
const fixture = (overrides: Partial<Realisation> = {}): Realisation => ({
  id: "fixture", reference: "REA-0100", slug: "fixture", title: "Titre technique",
  description: "Description technique", category: "decoration", published: true, displayOrder: 1,
  coverImage: "./images/cover.jpg",
  images: [
    { src: "./images/cover.jpg", alt: "Couverture de test" },
    { src: "./images/detail.jpg", alt: "Détail de test", caption: "Légende de test" },
  ],
  testimonials: [{ ...testimonial, featuredOnHome: true }], ...overrides,
});

describe("home realisation testimonial selector", () => {
  it("requires explicit selection and a published realisation", () => {
    const item = fixture({ testimonials: [testimonial, { ...testimonial, featuredOnHome: false }, { ...testimonial, featuredOnHome: true }] });
    const results = getHomeRealisationTestimonials([item, fixture({ published: false })]);
    expect(results).toHaveLength(1);
    expect(results[0].testimonial).toBe(item.testimonials[2]);
    expect(getHomeRealisationTestimonials([fixture({ testimonials: undefined }), fixture({ testimonials: [] })])).toEqual([]);
  });

  it("reuses the realisation, quote and cover media without duplicating their data", () => {
    const item = fixture();
    const [result] = getHomeRealisationTestimonials([item]);
    expect(result.realisation).toBe(item);
    expect(result.testimonial).toBe(item.testimonials[0]);
    expect(result.image).toBe(item.images[0]);
    expect(result.realisation.reference).toBe("REA-0100");
    expect(result.realisation.slug).toBe("fixture");
  });

  it("uses an optional image from the same realisation with its original metadata", () => {
    const item = fixture({ testimonials: [{ ...testimonial, featuredOnHome: true, homeImageSrc: "./images/detail.jpg" }] });
    expect(getHomeRealisationTestimonials([item])[0].image).toBe(item.images[1]);
    expect(validateRealisationsManifest([item])).toEqual([item]);
  });

  it("orders by display order, title, id then editorial testimonial order without mutating input", () => {
    const items = [
      fixture({ id: "b", displayOrder: 2 }), fixture({ id: "a", displayOrder: 2 }),
      fixture({ id: "c", displayOrder: 1, testimonials: [
        { ...testimonial, quote: "Premier texte technique", featuredOnHome: true },
        { ...testimonial, quote: "Deuxième texte technique", featuredOnHome: true },
      ] }),
      fixture({ id: "d", title: "Autre titre", displayOrder: 2 }),
    ];
    const original = structuredClone(items);
    const selected = getHomeRealisationTestimonials(items);
    expect(selected.map(({ key }) => key)).toEqual(["c:0", "c:1", "d:0", "a:0", "b:0"]);
    expect(getHomeRealisationTestimonials([...items].reverse())).toEqual(selected);
    expect(items).toEqual(original);
  });

  it("keeps legacy testimonials valid and unselected", () => {
    const item = fixture({ testimonials: [testimonial] });
    expect(validateRealisationsManifest([item])).toEqual([item]);
    expect(getHomeRealisationTestimonials([item])).toEqual([]);
  });

  it.each(["true", 1, null, {}])("rejects non-boolean featuredOnHome (%j)", (featuredOnHome) => {
    expect(() => validateRealisationsManifest([fixture({ testimonials: [{ ...testimonial, featuredOnHome: featuredOnHome as never }] })]))
      .toThrow(/featuredOnHome/);
  });

  it.each(["./images/other.jpg", "https://example.com/image.jpg", "", null])("rejects an image outside the realisation (%j)", (homeImageSrc) => {
    const item = fixture({ testimonials: [{ ...testimonial, featuredOnHome: true, homeImageSrc }] });
    expect(() => validateRealisationsManifest([item])).toThrow(/homeImageSrc/);
  });
});
