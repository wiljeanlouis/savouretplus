import { describe, expect, it } from "vitest";
import { parseAppHash } from "../../src/domain/navigation";

describe("application hash navigation", () => {
  it("loads a decoration detail route directly with a validated slug", () => {
    expect(parseAppHash("#/decoration/arche-romantique")).toMatchObject({
      route: "decoration-detail",
      decorationSlug: "arche-romantique",
    });
  });

  it("does not accept malformed decoration identifiers", () => {
    expect(parseAppHash("#/decoration/../../secret")).toMatchObject({
      route: "accueil",
      decorationSlug: null,
    });
  });

  it("preserves the decoration catalogue route and its query", () => {
    expect(parseAppHash("#/decoration?categorie=mariage")).toMatchObject({
      route: "decoration",
      decorationSlug: null,
    });
  });

  it("keeps services and the quote form as distinct routes", () => {
    expect(parseAppHash("#/services")).toMatchObject({ route: "services" });
    expect(parseAppHash("#/soumission?service=organisation")).toMatchObject({
      route: "soumission",
    });
  });

  it("recognizes intentional section navigation on the tasting page", () => {
    expect(parseAppHash("#/degustation?section=catalogue-degustation")).toMatchObject({
      route: "degustation",
      section: "catalogue-degustation",
    });
  });

  it("loads realisation listing and detail routes with validated slugs", () => {
    expect(parseAppHash("#/realisations")).toMatchObject({
      route: "realisations",
      realisationSlug: null,
    });
    expect(parseAppHash("#/realisations/decor-rouge-noir")).toMatchObject({
      route: "realisation-detail",
      realisationSlug: "decor-rouge-noir",
    });
  });

  it("rejects malformed realisation slugs", () => {
    expect(parseAppHash("#/realisations/../../secret")).toMatchObject({
      route: "accueil",
      realisationSlug: null,
    });
  });
});
