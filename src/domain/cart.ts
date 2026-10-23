import type { CatalogCategory, ProductSubcategory, ProductType, PurchaseMode } from "./catalog";

export type CartSelection = {
  choice_id: string;
  choice_name: string;
  group_label: string;
};

export type CartAllocation = {
  choice_id: string;
  choice_name: string;
  quantity: number;
};

export type CartIngredient = {
  id: string;
  name: string;
  quantity: number;
  default_quantity: number;
  extra_price_cents: number;
};

export type CartItem = {
  key: string;
  product_id: string;
  bom_id: string;
  name: string;
  category: CatalogCategory;
  subcategory: ProductSubcategory | null;
  product_type: ProductType;
  catalog_slug: string | null;
  pricing: "known" | "quote";
  base_price_cents: number | null;
  price_cents?: number;
  unit_price_cents: number | null;
  purchase_mode: PurchaseMode | null;
  selection: CartSelection | null;
  allocation: CartAllocation[];
  ingredients: CartIngredient[];
  quantity: number;
  image_url: string;
  note: string | null;
};

export type StoredSelection = {
  version: 2;
  items: CartItem[];
};

export function getPricedSelectionTotal(items: CartItem[]) {
  return items.reduce(
    (sum, item) =>
      item.pricing === "known" && typeof item.unit_price_cents === "number"
        ? sum + item.unit_price_cents * item.quantity
        : sum,
    0,
  );
}

export function isSelectionOrderEligible(items: CartItem[]) {
  return (
    items.length > 0 &&
    items.every(
      (item) =>
        item.category === "tasting" &&
        item.pricing === "known" &&
        typeof item.base_price_cents === "number" &&
        typeof item.unit_price_cents === "number" &&
        Boolean(item.purchase_mode),
    )
  );
}

export function buildSelectionItemKey(
  productId: string,
  purchaseMode: PurchaseMode | null,
  selection: CartSelection | null,
  allocation: CartAllocation[],
  ingredients: CartIngredient[],
) {
  const modeKey = purchaseMode?.id || "default";
  const selectionKey = selection?.choice_id || "none";
  const allocationKey = allocation
    .map((choice) => `${choice.choice_id}:${choice.quantity}`)
    .sort()
    .join("|");
  const ingredientKey = ingredients
    .map((ingredient) => `${ingredient.id}:${ingredient.quantity}`)
    .sort()
    .join("|");

  return `${productId}:${modeKey}:${selectionKey}:${allocationKey}:${ingredientKey}`;
}

export function buildDecorationSelectionKey(productId: string, note: string | null) {
  return `${productId}:quote:${note?.trim() || "none"}`;
}

export function updateSelectionItemNote(items: CartItem[], key: string, note: string) {
  const selectedItem = items.find((item) => item.key === key);
  if (!selectedItem) return items;

  const nextNote = note.trimStart().slice(0, 500) || null;
  if (selectedItem.category !== "decoration") {
    return items.map((item) =>
      item.key === key ? { ...item, note: nextNote } : item,
    );
  }

  const nextKey = buildDecorationSelectionKey(selectedItem.product_id, nextNote);
  const matchingItem = items.find(
    (item) => item.key === nextKey && item.key !== selectedItem.key,
  );

  if (matchingItem) {
    return items
      .filter((item) => item.key !== selectedItem.key)
      .map((item) =>
        item.key === matchingItem.key
          ? { ...item, quantity: item.quantity + selectedItem.quantity }
          : item,
      );
  }

  return items.map((item) =>
    item.key === key ? { ...item, key: nextKey, note: nextNote } : item,
  );
}

export function updateSelectionItemQuantity(
  items: CartItem[],
  key: string,
  quantity: number | string,
) {
  const nextQuantity = Number(quantity);
  if (nextQuantity <= 0) return removeSelectionItem(items, key);

  return items.map((item) =>
    item.key === key ? { ...item, quantity: nextQuantity } : item,
  );
}

export function removeSelectionItem(items: CartItem[], key: string) {
  return items.filter((item) => item.key !== key);
}

export function restoreStoredSelection(value: unknown): CartItem[] {
  const candidates = Array.isArray(value)
    ? value
    : isObject(value) && value.version === 2 && Array.isArray(value.items)
      ? value.items
      : [];

  return candidates.flatMap((candidate) => {
    if (!isObject(candidate)) return [];
    if (
      typeof candidate.key !== "string" ||
      typeof candidate.product_id !== "string" ||
      typeof candidate.name !== "string" ||
      (candidate.category !== "tasting" && candidate.category !== "decoration") ||
      !Number.isInteger(candidate.quantity) ||
      Number(candidate.quantity) <= 0
    ) {
      return [];
    }

    const hasKnownPrice =
      candidate.category === "tasting" &&
      candidate.pricing !== "quote" &&
      Number.isInteger(candidate.base_price_cents) &&
      Number(candidate.base_price_cents) >= 0 &&
      Number.isInteger(candidate.unit_price_cents) &&
      Number(candidate.unit_price_cents) >= 0;

    return [{
      ...candidate,
      catalog_slug:
        typeof candidate.catalog_slug === "string" ? candidate.catalog_slug : null,
      subcategory: isProductSubcategory(candidate.subcategory) ? candidate.subcategory : null,
      pricing: hasKnownPrice ? "known" : "quote",
      base_price_cents: hasKnownPrice ? candidate.base_price_cents : null,
      unit_price_cents: hasKnownPrice ? candidate.unit_price_cents : null,
      purchase_mode: candidate.purchase_mode || null,
      selection: candidate.selection || null,
      allocation: Array.isArray(candidate.allocation) ? candidate.allocation : [],
      ingredients: Array.isArray(candidate.ingredients) ? candidate.ingredients : [],
      image_url: typeof candidate.image_url === "string" ? candidate.image_url : "",
      note: typeof candidate.note === "string" ? candidate.note : null,
    } as CartItem];
  });
}

function isProductSubcategory(value: unknown): value is ProductSubcategory {
  return (
    value === "decorative-arch" ||
    value === "centerpiece" ||
    value === "birthday" ||
    value === "wedding"
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
