import type { CatalogProduct } from "./catalog";

const serviceQueryMap = {
  traiteur: "traiteur",
  decoration: "decoration",
  organisation: "organisation",
  "decoration-organisation": "decoration-organisation",
  "traiteur-decoration-organisation": "traiteur-decoration-organisation",
} as const;

const productSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type QuoteQuery = {
  service: (typeof serviceQueryMap)[keyof typeof serviceQueryMap] | "";
  itemSlug: string | null;
};

export function getQuoteQueryFromHash(hash: string): QuoteQuery {
  const query = hash.split("?")[1] || "";
  const params = new URLSearchParams(query);
  const service = params.get("service") || "";
  const itemSlug = params.get("item");

  const validatedService = serviceQueryMap[service] || "";
  const includesDecoration =
    validatedService === "decoration" ||
    validatedService === "decoration-organisation" ||
    validatedService === "traiteur-decoration-organisation";

  return {
    service: validatedService,
    itemSlug:
      includesDecoration &&
      itemSlug &&
      itemSlug.length <= 120 &&
      productSlugPattern.test(itemSlug)
        ? itemSlug
        : null,
  };
}

export function findSelectedDecoration(products: CatalogProduct[], itemSlug: string | null) {
  if (!itemSlug) return null;

  return (
    products.find(
      (product) => product.category === "decoration" && product.slug === itemSlug,
    ) ?? null
  );
}

export function createDecorationQuoteItem(product: CatalogProduct) {
  return {
    offering_id: product.id,
    name: product.name,
    requested_quantity: 1,
    configuration: {
      catalog_slug: product.slug,
      category: product.category,
      subcategory: product.subcategory,
    },
    note: null,
  };
}
