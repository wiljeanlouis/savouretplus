import { describe, expect, it } from "vitest";
import {
  buildDecorationSelectionKey,
  buildSelectionItemKey,
  getPricedSelectionTotal,
  isSelectionOrderEligible,
  removeSelectionItem,
  restoreStoredSelection,
  updateSelectionItemNote,
  updateSelectionItemQuantity,
  type CartItem,
} from "../../src/domain/cart";

const tastingItem: CartItem = {
  key: "food:unit:none::",
  product_id: "20000000-0000-4000-8000-000000000001",
  bom_id: "bom-food",
  catalog_slug: "pate",
  name: "Pâté",
  category: "tasting",
  subcategory: null,
  product_type: "standard",
  pricing: "known",
  base_price_cents: 300,
  unit_price_cents: 300,
  purchase_mode: { id: "unit", label: "Unité", quantity: 1, price_cents: 300, allocation_type: "none" },
  selection: null,
  allocation: [],
  ingredients: [],
  quantity: 2,
  image_url: "/food.png",
  note: null,
};

const decorationItem: CartItem = {
  ...tastingItem,
  key: "decor:quote:none",
  product_id: "decor",
  catalog_slug: "arche",
  name: "Arche",
  category: "decoration",
  subcategory: "decorative-arch",
  pricing: "quote",
  base_price_cents: null,
  unit_price_cents: null,
  purchase_mode: null,
  quantity: 3,
};

describe("unified selection", () => {
  it("keeps configurations of the same product as distinct lines", () => {
    const first = buildSelectionItemKey("food", tastingItem.purchase_mode, {
      choice_id: "beef",
      choice_name: "Bœuf",
      group_label: "Farce",
    }, [], []);
    const second = buildSelectionItemKey("food", tastingItem.purchase_mode, {
      choice_id: "chicken",
      choice_name: "Poulet",
      group_label: "Farce",
    }, [], []);

    expect(first).not.toBe(second);
    expect(buildDecorationSelectionKey("decor", "Rose")).not.toBe(
      buildDecorationSelectionKey("decor", "Bleu"),
    );
  });

  it("totals only known prices and keeps quote-only lines unpriced", () => {
    expect(getPricedSelectionTotal([tastingItem, decorationItem])).toBe(600);
    expect(decorationItem.unit_price_cents).toBeNull();
  });

  it("allows direct orders only for priced tasting lines", () => {
    expect(isSelectionOrderEligible([tastingItem])).toBe(true);
    expect(isSelectionOrderEligible([decorationItem])).toBe(false);
    expect(isSelectionOrderEligible([tastingItem, decorationItem])).toBe(false);
  });

  it("migrates the previous array format and restores the versioned format", () => {
    const legacy = {
      ...tastingItem,
      pricing: undefined,
      catalog_slug: undefined,
      subcategory: undefined,
      note: undefined,
    };
    const migrated = restoreStoredSelection([legacy]);
    const restored = restoreStoredSelection({ version: 2, items: [decorationItem] });

    expect(migrated[0]).toMatchObject({ pricing: "known", catalog_slug: null, note: null });
    expect(restored).toEqual([decorationItem]);
  });

  it("drops an unknown persisted subcategory without dropping the line", () => {
    const restored = restoreStoredSelection({
      version: 2,
      items: [{ ...decorationItem, subcategory: "unknown-category" }],
    });

    expect(restored[0]).toMatchObject({ product_id: "decor", subcategory: null });
  });

  it("never restores a decoration as a priced line", () => {
    const restored = restoreStoredSelection({
      version: 2,
      items: [{ ...decorationItem, pricing: "known", base_price_cents: 0, unit_price_cents: 0 }],
    });

    expect(restored[0]).toMatchObject({
      pricing: "quote",
      base_price_cents: null,
      unit_price_cents: null,
    });
  });

  it("updates a decoration line identity and merges an identical preference", () => {
    const rose = { ...decorationItem, key: "decor:quote:Rose", note: "Rose", quantity: 2 };
    const blue = { ...decorationItem, key: "decor:quote:Bleu", note: "Bleu", quantity: 1 };

    expect(updateSelectionItemNote([rose], rose.key, "Bleu")[0]).toMatchObject({
      key: "decor:quote:Bleu",
      note: "Bleu",
    });
    expect(updateSelectionItemNote([rose, blue], rose.key, "Bleu")).toEqual([
      { ...blue, quantity: 3 },
    ]);
  });

  it("updates quantities and removes only the requested line", () => {
    const items = [tastingItem, decorationItem];

    expect(updateSelectionItemQuantity(items, decorationItem.key, "4")[1].quantity).toBe(4);
    expect(updateSelectionItemQuantity(items, decorationItem.key, 0)).toEqual([tastingItem]);
    expect(removeSelectionItem(items, tastingItem.key)).toEqual([decorationItem]);
  });

  it("ignores malformed persisted lines", () => {
    expect(restoreStoredSelection({ version: 2, items: [{ key: "broken" }] })).toEqual([]);
  });
});
