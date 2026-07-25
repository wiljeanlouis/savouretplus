import { describe, expect, it, vi } from "vitest";
import { configureCommerceGateway } from "../../../src/application/commerce";
import type { CatalogProduct } from "../../../src/domain/catalog";
import { loadCatalogProducts } from "../../../src/components/catalog/useCatalogProducts";

function product(id: string, category: CatalogProduct["category"]): CatalogProduct {
  return {
    id,
    bom_id: id,
    slug: id,
    name: id,
    category,
    subcategory: null,
    description: "",
    product_type: "standard",
    purchase_modes: [],
    choice_group: null,
    ingredient_options: [],
    image_url: "/image.png",
    gallery: ["/image.png"],
    availability_note: "Disponible",
  };
}

describe("loadCatalogProducts", () => {
  it("requests and keeps only products from the selected category", async () => {
    const tastingProduct = product("tasting-product", "tasting");
    const decorationProduct = product("decoration-product", "decoration");
    const fetchCatalogProducts = vi
      .fn()
      .mockResolvedValue([tastingProduct, decorationProduct]);

    configureCommerceGateway({
      fetchCatalogProducts,
      createCustomerOrder: vi.fn(),
      submitQuoteRequest: vi.fn(),
    });

    await expect(loadCatalogProducts("decoration")).resolves.toEqual([decorationProduct]);
    expect(fetchCatalogProducts).toHaveBeenCalledWith("decoration");
  });
});
