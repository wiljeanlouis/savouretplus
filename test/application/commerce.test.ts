import { beforeEach, describe, expect, it, vi } from "vitest";

describe("commerce application facade", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("throws when no gateway has been configured", async () => {
    const { fetchCatalogProducts } = await import("../../src/application/commerce");

    expect(() => fetchCatalogProducts()).toThrow("CommerceGateway must be configured before use.");
  });

  it("delegates catalog, order, and quote operations to the configured gateway", async () => {
    const commerce = await import("../../src/application/commerce");
    const product = { id: "pate-four" };
    const order = { customer: { name: "Ada", phone: "514" }, items: [], totalCents: 1200 };
    const quote = { service: "traiteur" };
    const gateway = {
      fetchCatalogProducts: vi.fn().mockResolvedValue([product]),
      createCustomerOrder: vi.fn().mockResolvedValue({ accepted: true }),
      submitQuoteRequest: vi.fn().mockResolvedValue({ id: "quote-1" }),
    };

    commerce.configureCommerceGateway(gateway);

    await expect(commerce.fetchCatalogProducts()).resolves.toEqual([product]);
    await expect(commerce.createCustomerOrder(order)).resolves.toEqual({ accepted: true });
    await expect(commerce.submitQuoteRequest(quote)).resolves.toEqual({ id: "quote-1" });
    expect(gateway.fetchCatalogProducts).toHaveBeenCalledOnce();
    expect(gateway.createCustomerOrder).toHaveBeenCalledWith(order);
    expect(gateway.submitQuoteRequest).toHaveBeenCalledWith(quote);
  });
});
