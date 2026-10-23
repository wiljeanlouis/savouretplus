import type { CatalogProduct, ProductSubcategory } from "./catalog";

export type DecorationCategoryDefinition = {
  id: ProductSubcategory;
  slug: string;
  label: string;
  description: string;
};

export const decorationCategories: DecorationCategoryDefinition[] = [
  {
    id: "decorative-arch",
    slug: "arche-de-ballon",
    label: "Arche décorative",
    description: "Des arches personnalisées pour encadrer et mettre en valeur votre célébration.",
  },
  {
    id: "centerpiece",
    slug: "centre-de-table",
    label: "Centre de table",
    description: "Des compositions harmonieuses pensées pour habiller chaque table.",
  },
  {
    id: "birthday",
    slug: "anniversaire",
    label: "Anniversaire",
    description: "Des décors festifs adaptés à l’âge, au thème et à l’ambiance souhaitée.",
  },
  {
    id: "wedding",
    slug: "mariage",
    label: "Mariage",
    description: "Des décors élégants pour créer une célébration qui vous ressemble.",
  },
];

export function getDecorationCategoryFromHash(hash: string) {
  const query = hash.split("?")[1] || "";
  const slug = new URLSearchParams(query).get("categorie");

  return decorationCategories.find((category) => category.slug === slug) ?? null;
}

export function getDecorationCategory(
  subcategory: ProductSubcategory | null,
): DecorationCategoryDefinition | null {
  return decorationCategories.find((category) => category.id === subcategory) ?? null;
}

export function groupDecorationProducts(products: CatalogProduct[]) {
  const groups = new Map<ProductSubcategory, CatalogProduct[]>(
    decorationCategories.map((category) => [category.id, []]),
  );
  const other: CatalogProduct[] = [];

  products.forEach((product) => {
    if (product.subcategory && groups.has(product.subcategory)) {
      groups.get(product.subcategory)?.push(product);
    } else {
      other.push(product);
    }
  });

  return { groups, other };
}


export function getDecorationCatalogTarget(hash: string, products: CatalogProduct[]) {
  const query = hash.split("?")[1] || "";
  const section = new URLSearchParams(query).get("section");
  if (section === "autres" && groupDecorationProducts(products).other.length) {
    return "decoration-autres";
  }

  const requestedCategory = getDecorationCategoryFromHash(hash);

  if (!requestedCategory) return "decoration-catalogue";

  const { groups } = groupDecorationProducts(products);
  return groups.get(requestedCategory.id)?.length
    ? `decoration-${requestedCategory.slug}`
    : "decoration-sur-mesure";
}

export function findPublishedDecoration(products: CatalogProduct[], slug: string | null) {
  if (!slug) return null;

  return (
    products.find(
      (product) => product.category === "decoration" && product.slug === slug,
    ) ?? null
  );
}

export function getDecorationDetailHash(product: CatalogProduct) {
  return `#/decoration/${encodeURIComponent(product.slug)}`;
}
