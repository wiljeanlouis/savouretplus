import { describe, expect, it } from "vitest";
import { parseAppHash } from "../../../src/domain/navigation";
import { getScrollInstruction } from "../../../src/application/navigation/scrollRestoration";

function instruction(
  previousHash: string | null,
  nextHash: string,
  action: "INITIAL" | "PUSH" | "POP" = "PUSH",
  restoredTop?: number,
) {
  return getScrollInstruction({
    previousLocation: previousHash ? parseAppHash(previousHash) : null,
    location: parseAppHash(nextHash),
    action,
    restoredTop,
    reducedMotion: false,
  });
}

describe("scroll restoration", () => {
  it("returns to the top when navigating to another page", () => {
    expect(instruction("#/services", "#/realisations")).toEqual({ type: "top" });
  });

  it("returns to the top when navigating to a detail page", () => {
    expect(instruction("#/decoration", "#/decoration/arche-romantique")).toEqual({
      type: "top",
    });
  });

  it("restores the saved position during browser history navigation", () => {
    expect(instruction("#/realisations", "#/services", "POP", 840)).toEqual({
      type: "restore",
      top: 840,
    });
  });

  it("preserves intentional navigation to the tasting catalogue", () => {
    expect(
      instruction("#/degustation", "#/degustation?section=catalogue-degustation"),
    ).toEqual({
      type: "section",
      id: "catalogue-degustation",
      smooth: true,
    });
  });

  it("uses immediate section positioning when reduced motion is requested", () => {
    expect(
      getScrollInstruction({
        previousLocation: parseAppHash("#/degustation"),
        location: parseAppHash("#/degustation?section=catalogue-degustation"),
        action: "PUSH",
        reducedMotion: true,
      }),
    ).toEqual({
      type: "section",
      id: "catalogue-degustation",
      smooth: false,
    });
  });

  it("does not reset scrolling for internal query-state changes", () => {
    expect(instruction("#/soumission?service=traiteur", "#/soumission?service=decoration")).toEqual({
      type: "none",
    });
  });
});
