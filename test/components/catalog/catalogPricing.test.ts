import { describe, expect, it } from "vitest";
import { getConfiguredSelection } from "../../../src/components/catalog/catalogPricing";

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
