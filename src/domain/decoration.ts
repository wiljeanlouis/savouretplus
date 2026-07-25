import type { CatalogProduct, DecorationSubcategory } from "./catalog";

export type DecorationCategoryDefinition = {
  id: DecorationSubcategory;
  slug: string;
  label: string;
  description: string;
};

export const decorationCategories: DecorationCategoryDefinition[] = [
  {
    id: "balloon-arch",
    slug: "arche-de-ballon",
    label: "Arche de ballon",
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

export function groupDecorationProducts(products: CatalogProduct[]) {
  const groups = new Map<DecorationSubcategory, CatalogProduct[]>(
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
