import { useEffect, useMemo, useState } from "react";
import type {
  CartAllocation,
  CartIngredient,
  CartItem,
  CartSelection,
} from "../../domain/cart";
import {
  buildDecorationSelectionKey,
  buildSelectionItemKey,
  getPricedSelectionTotal,
  removeSelectionItem,
  restoreStoredSelection,
  updateSelectionItemNote,
  updateSelectionItemQuantity,
  type StoredSelection,
} from "../../domain/cart";
import type { CatalogProduct, PurchaseMode } from "../../domain/catalog";

export type AddToCartOptions = {
  quantity?: number;
  unitPriceCents?: number;
  purchaseMode?: PurchaseMode | null;
  selection?: CartSelection | null;
  allocation?: CartAllocation[];
  ingredients?: CartIngredient[];
};

const storageKey = "savouretplus-cart";

function readStoredItems() {
  try {
    return restoreStoredSelection(JSON.parse(localStorage.getItem(storageKey) || "[]"));
  } catch {
    return [];
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(readStoredItems);

  useEffect(() => {
    try {
      const stored: StoredSelection = { version: 2, items };
      localStorage.setItem(storageKey, JSON.stringify(stored));
    } catch {
      // The in-memory selection remains usable if browser storage is unavailable.
    }
  }, [items]);

  const totalCents = useMemo(() => getPricedSelectionTotal(items), [items]);

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  function add(product: CatalogProduct, options: AddToCartOptions = {}) {
    const quantity = Number(options.quantity || 1);
    const selection = options.selection || null;
    const purchaseMode = options.purchaseMode || null;
    const allocation = options.allocation || [];
    const ingredients = options.ingredients || [];
    const unitPriceCents = options.unitPriceCents ?? purchaseMode?.price_cents ?? 0;
    const basePriceCents = purchaseMode?.price_cents ?? unitPriceCents;
    const key = buildSelectionItemKey(product.id, purchaseMode, selection, allocation, ingredients);

    setItems((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }

      return [
        ...current,
        {
          key,
          product_id: product.id,
          bom_id: product.bom_id,
          catalog_slug: product.slug,
          name: product.name,
          category: product.category,
          subcategory: product.subcategory,
          product_type: product.product_type,
          pricing: "known",
          base_price_cents: basePriceCents,
          unit_price_cents: unitPriceCents,
          purchase_mode: purchaseMode,
          selection,
          allocation,
          ingredients,
          quantity,
          image_url: product.image_url,
          note: null,
        },
      ];
    });
  }

  function addDecoration(
    product: CatalogProduct,
    options: { quantity?: number; note?: string } = {},
  ) {
    const quantity = Math.max(1, Math.trunc(Number(options.quantity) || 1));
    const note = options.note?.trim() || null;
    const key = buildDecorationSelectionKey(product.id, note);

    setItems((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item,
        );
      }

      return [
        ...current,
        {
          key,
          product_id: product.id,
          bom_id: product.bom_id,
          catalog_slug: product.slug,
          name: product.name,
          category: "decoration",
          subcategory: product.subcategory,
          product_type: product.product_type,
          pricing: "quote",
          base_price_cents: null,
          unit_price_cents: null,
          purchase_mode: null,
          selection: null,
          allocation: [],
          ingredients: [],
          quantity,
          image_url: product.image_url,
          note,
        },
      ];
    });
  }

  function updateQuantity(key: string, quantity: number | string) {
    setItems((current) => updateSelectionItemQuantity(current, key, quantity));
  }

  function remove(key: string) {
    setItems((current) => removeSelectionItem(current, key));
  }

  function updateNote(key: string, note: string) {
    setItems((current) => updateSelectionItemNote(current, key, note));
  }

  function clear() {
    setItems([]);
  }

  return {
    items,
    totalCents,
    count,
    add,
    addDecoration,
    updateQuantity,
    updateNote,
    remove,
    clear,
  };
}
