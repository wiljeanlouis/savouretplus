import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { realisationsManifest } from "../../src/content/realisations";
import {
  filterRealisations,
  findPublishedRealisationBySlug,
  getAvailableRealisationCategories,
  getOrderedRealisationImages,
  getOrderedRealisationMedia,
  type RealisationVideo,
  getPublishedRealisations,
  getRealisationQuoteHref,
  type Realisation,
  validateRealisationsManifest,
} from "../../src/domain/realisation";

const fixture = (overrides: Partial<Realisation> = {}): Realisation => ({
  id: "fixture-1",
  reference: "REA-0100",
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
      for (const video of (realisation as Realisation).videos ?? []) {
        if (video.thumbnail) expect(existsSync(resolve(process.cwd(), "public", video.thumbnail.replace(/^\.\//, ""))), video.thumbnail).toBe(true);
      }
      for (const image of realisation.images) {
        const path = resolve(process.cwd(), "public", image.src.replace(/^\.\//, ""));
        expect(existsSync(path), image.src).toBe(true);
      }
    }
  });

  it("publishes the new authentic galleries with their complete image sets", () => {
    const ceremony = realisationsManifest.find(({ slug }) => slug === "decor-colonne-ballons-rouge-blanc");
    const birthday = realisationsManifest.find(({ slug }) => slug === "anniversaire-winnie");
    const opening = realisationsManifest.find(({ slug }) => slug === "grand-opening-soul-store");
    const gamer = realisationsManifest.find(({ slug }) => slug === "anniversaire-marvensley");
    const bouquet = realisationsManifest.find(({ slug }) => slug === "bouquet-cadeau-billets-bleu-or");

    expect(ceremony?.images).toHaveLength(1);
    expect(birthday?.images).toHaveLength(6);
    expect(opening?.images).toHaveLength(3);
    expect(gamer?.images).toHaveLength(2);
    expect(bouquet?.images).toHaveLength(1);
    expect(bouquet?.description).toContain("billets canadiens et américains");
  });

  it("keeps the permanent references when titles, categories and display order change", () => {
    const expected = {
      "realisation-grand-opening-soul-store": "REA-0001",
      "realisation-anniversaire-winnie": "REA-0002",
      "realisation-decor-colonne-ballons-rouge-blanc": "REA-0003",
      "realisation-anniversaire-marvensley": "REA-0004",
      "realisation-bouquet-cadeau-billets-bleu-or": "REA-0005",
    };
    const changed = [...realisationsManifest].reverse().map((item, index) => ({
      ...item, title: `Titre ${index}`, category: "cartering" as const, displayOrder: -item.displayOrder,
    }));
    for (const items of [realisationsManifest, getPublishedRealisations(changed)]) {
      expect(Object.fromEntries(items.map(({ id, reference }) => [id, reference]))).toEqual(expected);
      expect(new Set(items.map(({ reference }) => reference)).size).toBe(items.length);
    }
  });

  it.each([undefined, "", "REA-0000", "REA-001", "REA-00001", "rea-0001", "REA-ABCD", "REA-0001\n", " REA-0001"])("rejects invalid reference %s", (reference) => {
    expect(() => validateRealisationsManifest([fixture({ reference })])).toThrow(/Référence/);
  });

  it("rejects duplicate references even on unpublished entries", () => {
    expect(() => validateRealisationsManifest([
      fixture(), fixture({ id: "second", slug: "second", published: false }),
    ])).toThrow(/Référence.*dupliquée/);
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
      fixture({ id: "food", slug: "food", category: "cartering" }),
    ];

    expect(filterRealisations(items, "cartering").map((item) => item.slug)).toEqual(["food"]);
    expect(getAvailableRealisationCategories(items).map((category) => category.id)).toEqual([
      "decoration",
      "cartering",
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

describe("realisation testimonial validation", () => {
  const testimonial = { quote: "Texte de test — non publiable", author: "Attribution de test — non publiable" };

  it("accepts absent, empty and multiple testimonials without modifying approved text", () => {
    const items = [fixture(), fixture({ testimonials: [] }), fixture({ testimonials: [
      { ...testimonial, quote: "  Texte de test\navec sa mise en forme.  ", context: "Contexte de test", date: "Date de test" },
      testimonial,
    ] })];
    for (const item of items) {
      const before = structuredClone(item);
      expect(validateRealisationsManifest([item])[0]).toBe(item);
      expect(item).toEqual(before);
    }
  });

  it.each([null, {}, "texte", [null], ["texte"], [[]]])("rejects an invalid testimonial list or entry (%j)", (testimonials) => {
    expect(() => validateRealisationsManifest([fixture({ testimonials: testimonials as never })])).toThrow(/témoignage/i);
  });

  it.each(["quote", "author"] as const)("requires nonempty %s", (field) => {
    for (const value of [undefined, null, "", " \n ", 123]) {
      expect(() => validateRealisationsManifest([fixture({ testimonials: [{ ...testimonial, [field]: value } as never] })]))
        .toThrow(new RegExp(field));
    }
  });

  it.each(["context", "date"] as const)("rejects invalid optional %s when supplied", (field) => {
    for (const value of [null, "", " \n ", 123]) {
      expect(() => validateRealisationsManifest([fixture({ testimonials: [{ ...testimonial, [field]: value } as never] })]))
        .toThrow(new RegExp(field));
    }
  });
});


describe("multimedia realisations", () => {
  const youtube: RealisationVideo = {
    type: "video", platform: "youtube", url: "https://www.youtube.com/watch?v=test",
    title: "Vidéo fictive non publiée", thumbnail: "./images/test.jpg", thumbnailAlt: "Aperçu de test", displayOrder: 1,
  };
  const tiktok: RealisationVideo = { type: "video", platform: "tiktok", url: "https://www.tiktok.com/@test/video/123", title: "Test TikTok", displayOrder: 3 };

  it("keeps photo-only data and orders several videos among photographs without changing identity", () => {
    const photoOnly = fixture();
    expect(validateRealisationsManifest([photoOnly])[0]).toBe(photoOnly);
    const mixed = fixture({ videos: [tiktok, youtube], published: false });
    const before = structuredClone(mixed);
    expect(validateRealisationsManifest([mixed])[0]).toBe(mixed);
    expect(getOrderedRealisationMedia(mixed).map((media) => media.type)).toEqual(["video", "image", "video"]);
    expect(mixed).toEqual(before);
    expect(findPublishedRealisationBySlug([mixed], mixed.slug)).toBeNull();
    expect(getPublishedRealisations([mixed])).toEqual([]);
    expect(() => validateRealisationsManifest([fixture({ images: [], videos: [youtube] })])).toThrow(/photographie/);
    expect(() => validateRealisationsManifest([fixture({ coverImage: youtube.thumbnail, videos: [youtube] })])).toThrow(/couverture/i);
  });

  it.each([
    ["youtube", "https://youtu.be/test"], ["youtube", "https://m.youtube.com/shorts/test"],
    ["tiktok", "https://vm.tiktok.com/test/"], ["tiktok", tiktok.url],
  ])("accepts official HTTPS %s URL %s", (platform, url) => {
    expect(() => validateRealisationsManifest([fixture({ videos: [{ ...youtube, platform, url } as RealisationVideo] })])).not.toThrow();
  });

  it.each([
    "javascript:alert(1)", "http://www.youtube.com/watch?v=test", "https://youtube.com.evil.test/video",
    "https://evilyoutube.com/test", "https://youtube.com@evil.test/test", "https://user@youtube.com/test",
    "https://www.tiktok.com/@test/video/123", "https://youtube.com:444/test", "https:youtube.com/test", "https:///youtube.com/test", "not a URL", " https://youtube.com/test",
    "https://youtube.com\\@evil.test/test",
  ])("rejects unsafe or mismatched YouTube URL %s", (url) => {
    expect(() => validateRealisationsManifest([fixture({ videos: [{ ...youtube, url }] })])).toThrow(/URL/);
  });

  it.each([
    { platform: "vimeo" }, { type: "audio" }, { title: " " }, { url: undefined },
    { thumbnail: "https://example.com/test.jpg" }, { thumbnail: "./images/../secret.jpg" },
    { thumbnailAlt: "" }, { caption: 123 }, { displayOrder: NaN },
  ])("rejects invalid video fields %j", (overrides) => {
    expect(() => validateRealisationsManifest([fixture({ videos: [{ ...youtube, ...overrides } as RealisationVideo] })])).toThrow();
  });

  it("allows missing previews but rejects malformed lists and duplicate identities", () => {
    expect(() => validateRealisationsManifest([fixture({ videos: [tiktok] })])).not.toThrow();
    for (const videos of [null, {}, [null]]) {
      expect(() => validateRealisationsManifest([fixture({ videos: videos as never })])).toThrow(/vidéo/);
    }
    expect(() => validateRealisationsManifest([fixture({ videos: [youtube] }), fixture({ slug: "other", reference: "REA-0101" })])).toThrow(/Identifiant/);
    expect(realisationsManifest.map(({ slug }) => slug)).toEqual([
      "grand-opening-soul-store", "anniversaire-winnie", "decor-colonne-ballons-rouge-blanc", "anniversaire-marvensley", "bouquet-cadeau-billets-bleu-or",
    ]);
  });
});
