import { describe, expect, it } from "vitest";
import { fallbackCatalog } from "../../../src/infrastructure/local/fallbackCatalog";
import { LocalCommerceGateway } from "../../../src/infrastructure/local/LocalCommerceGateway";

describe("LocalCommerceGateway", () => {
  it("returns the fallback catalog", async () => {
    const gateway = new LocalCommerceGateway();

    await expect(gateway.fetchCatalogProducts()).resolves.toBe(fallbackCatalog);
  });

  it("keeps every fallback product commandable through purchase modes", () => {
    expect(fallbackCatalog).not.toHaveLength(0);
    expect(fallbackCatalog.every((product) => product.purchase_modes.length > 0)).toBe(true);
  });

  it("never simulates successful commercial writes", async () => {
    const gateway = new LocalCommerceGateway();

    await expect(
      gateway.receiveCustomerOrder({
        request_id: "10000000-0000-4000-8000-000000000001",
        customer_name: "Ada",
        customer_phone: "+15145551234",
        customer_email: null,
        note: null,
        items: [],
        total_cents: 1200,
      }),
    ).rejects.toMatchObject({ kind: "technical" });
    await expect(
      gateway.submitQuoteRequest({
        type: "QUOTE_REQUEST",
        customer: { name: "Ada", phone: "+15145551234" },
        requested_services: ["traiteur"],
        event_details: {
          request_type: "traiteur",
          event_type: "Fête",
          event_date: "2027-01-01",
          event_time: null,
          event_address: "Montréal",
          guest_count: 10,
          budget: "À discuter",
          allergies: null,
          note: null,
        },
        items: [],
      }),
    ).rejects.toThrow("n’est pas configuré");
  });

  it("can hide fallback products when used by a production configuration", async () => {
    const gateway = new LocalCommerceGateway(false);

    await expect(gateway.fetchCatalogProducts()).resolves.toEqual([]);
  });
});
