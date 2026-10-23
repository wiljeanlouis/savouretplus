import { isCatalogSlug } from "./catalog";

const staticRoutes = new Set([
  "accueil",
  "decoration",
  "degustation",
  "panier",
  "soumission",
  "contact",
]);

export function parseAppHash(hash: string) {
  const normalized = hash.replace(/^#\/?/, "");
  const [path = "", query = ""] = normalized.split("?");
  const segments = path.split("/").filter(Boolean);

  if (segments[0] === "decoration" && segments.length === 2 && isCatalogSlug(segments[1])) {
    return {
      route: "decoration-detail",
      section: null,
      decorationSlug: segments[1],
      hash,
    };
  }

  const route = staticRoutes.has(segments[0]) && segments.length === 1 ? segments[0] : "accueil";
  const requestedSection = new URLSearchParams(query).get("section");
  const section = route === "accueil" && requestedSection === "realisations" ? requestedSection : null;

  return { route, section, decorationSlug: null, hash };
}
