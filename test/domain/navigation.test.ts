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
});
