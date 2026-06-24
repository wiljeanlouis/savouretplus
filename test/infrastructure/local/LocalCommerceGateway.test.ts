import { describe, expect, it, vi } from "vitest";
import { fallbackCatalog } from "../../../src/infrastructure/local/fallbackCatalog";
import { LocalCommerceGateway } from "../../../src/infrastructure/local/LocalCommerceGateway";

describe("LocalCommerceGateway", () => {
  it("returns the fallback catalog", async () => {
    const gateway = new LocalCommerceGateway();

    await expect(gateway.fetchCatalogProducts()).resolves.toBe(fallbackCatalog);
  });

  it("simulates customer orders and quote requests", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(Date, "now").mockReturnValue(123456);
    const gateway = new LocalCommerceGateway();

    await expect(
      gateway.createCustomerOrder({
        customer: { name: "Ada", phone: "514" },
        items: [],
        totalCents: 1200,
      }),
    ).resolves.toEqual({ id: "local-123456" });
    await expect(gateway.submitQuoteRequest({ service: "traiteur" })).resolves.toEqual({
      id: "local-quote-123456",
    });
  });
});
