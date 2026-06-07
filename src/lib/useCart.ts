import { useEffect, useMemo, useState } from "react";
import type {
  CartAllocation,
  CartIngredient,
  CartItem,
  CartSelection,
} from "../domain/cart";
import type { CatalogProduct, PurchaseMode } from "../domain/catalog";

export type AddToCartOptions = {
  quantity?: number;
  unitPriceCents?: number;
  purchaseMode?: PurchaseMode | null;
  selection?: CartSelection | null;
  allocation?: CartAllocation[];
  ingredients?: CartIngredient[];
};

const storageKey = "savouretplus-cart";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);

  const totalCents = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (item.unit_price_cents ?? item.price_cents ?? 0) * item.quantity,
        0,
      ),
    [items],
  );

  const count = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  function add(product: CatalogProduct, options: AddToCartOptions = {}) {
    const quantity = Number(options.quantity || 1);
    const selection = options.selection || null;
    const purchaseMode = options.purchaseMode || null;
    const allocation = options.allocation || [];
    const ingredients = options.ingredients || [];
    const unitPriceCents = options.unitPriceCents || product.price_cents;
    const key = buildCartItemKey(product.id, purchaseMode, selection, allocation, ingredients);

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
          name: product.name,
          product_type: product.product_type,
          base_price_cents: product.price_cents,
          unit_price_cents: unitPriceCents,
          purchase_mode: purchaseMode,
          selection,
          allocation,
          ingredients,
          quantity,
          image_url: product.image_url,
        },
      ];
    });
  }

  function updateQuantity(key: string, quantity: number | string) {
    const nextQuantity = Number(quantity);
    if (nextQuantity <= 0) {
      remove(key);
      return;
    }

    setItems((current) =>
      current.map((item) => (item.key === key ? { ...item, quantity: nextQuantity } : item)),
    );
  }

  function remove(key: string) {
    setItems((current) => current.filter((item) => item.key !== key));
  }

  function clear() {
    setItems([]);
  }

  return { items, totalCents, count, add, updateQuantity, remove, clear };
}

function buildCartItemKey(
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
