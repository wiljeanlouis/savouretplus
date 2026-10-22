import { describe, expect, it } from "vitest";
import {
  calculateUnitPrice,
  getConfiguredSelection,
  getDefaultChoiceAllocation,
  isValidOrderQuantity,
} from "../../../src/components/catalog/catalogPricing";

const selectedChoice = { id: "thon", name: "Thon" };

function product(productType) {
  return {
    product_type: productType,
    choice_group: { label: "Farce disponible" },
  };
}

describe("getConfiguredSelection", () => {
  it("returns no selection for a choice allocation such as a dozen", () => {
    const purchaseMode = { allocation_type: "choice_allocation" };

    expect(
      getConfiguredSelection(
        product("single_choice_bundle"),
        purchaseMode,
        selectedChoice,
      ),
    ).toBeNull();
  });

  it("keeps the selection for a single-choice purchase mode", () => {
    const purchaseMode = { allocation_type: "single_choice" };

    expect(
      getConfiguredSelection(
        product("single_choice_bundle"),
        purchaseMode,
        selectedChoice,
      ),
    ).toEqual({
      choice_id: "thon",
      choice_name: "Thon",
      group_label: "Farce disponible",
    });
  });
});

describe("catalog configuration", () => {
  it("distributes a bundle across the available choices without changing its quantity", () => {
    expect(
      getDefaultChoiceAllocation({
        purchase_modes: [{ allocation_type: "choice_allocation", quantity: 12 }],
        choice_group: { options: [{ id: "poulet" }, { id: "boeuf" }, { id: "thon" }] },
      }),
    ).toEqual({ poulet: 4, boeuf: 4, thon: 4 });
  });

  it("keeps the configured price rules for ingredient extras", () => {
    expect(
      calculateUnitPrice(
        [
          { quantity: 2, default_quantity: 1, extra_price_cents: 200 },
          { quantity: 0, default_quantity: 1, extra_price_cents: 150 },
        ],
        { price_cents: 800 },
      ),
    ).toBe(1000);
  });

  it.each([1, "2", 12])("accepts a positive integer quantity: %s", (quantity) => {
    expect(isValidOrderQuantity(quantity)).toBe(true);
  });

  it.each([0, -1, 1.5, "", "abc", Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects an invalid quantity: %s",
    (quantity) => {
      expect(isValidOrderQuantity(quantity)).toBe(false);
    },
  );
});
