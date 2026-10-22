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
    const item = {
      key: "pate-four:unit",
      product_id: "pate-four",
      bom_id: "bom-1",
      name: "Pâté au four",
      product_type: "standard",
      base_price_cents: 1200,
      unit_price_cents: 1200,
      purchase_mode: {
        id: "unit",
        label: "Unité",
        quantity: 1,
        price_cents: 1200,
        allocation_type: "none",
      },
      selection: null,
      allocation: [],
      ingredients: [],
      quantity: 1,
      image_url: "/pate.png",
    };
    const order = {
      customer: { name: "Ada", phone: "514-555-1234" },
      items: [item],
      totalCents: 1200,
    };
    const quote = {
      type: "QUOTE_REQUEST",
      customer: { name: "Ada", phone: "514-555-1234", email: "" },
      requested_services: ["decoration"],
      event_details: {
        request_type: "decoration",
        event_type: "Mariage",
        event_date: "2027-06-12",
        event_time: null,
        event_address: "Montréal",
        guest_count: null,
        budget: "À discuter",
        allergies: null,
        note: null,
      },
      items: [],
    };
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
    expect(gateway.createCustomerOrder).toHaveBeenCalledWith({
      ...order,
      customer: { ...order.customer, email: null, phone: "+15145551234" },
    });
    expect(gateway.submitQuoteRequest).toHaveBeenCalledWith({
      ...quote,
      customer: { ...quote.customer, email: null, phone: "+15145551234" },
    });
  });

  it("does not call a gateway when order or quote validation fails", async () => {
    const commerce = await import("../../src/application/commerce");
    const gateway = {
      fetchCatalogProducts: vi.fn(),
      createCustomerOrder: vi.fn(),
      submitQuoteRequest: vi.fn(),
    };
    commerce.configureCommerceGateway(gateway);

    expect(() =>
      commerce.createCustomerOrder({
        customer: { name: "Ada", phone: "514" },
        items: [],
        totalCents: 0,
      }),
    ).toThrow("données commerciales sont invalides");
    expect(() =>
      commerce.submitQuoteRequest({
        type: "QUOTE_REQUEST",
        customer: { name: "Ada", phone: "514" },
        requested_services: [],
        event_details: {
          request_type: "",
          event_type: "",
          event_date: "",
          event_time: null,
          event_address: "",
          guest_count: null,
          budget: "",
          allergies: null,
          note: null,
        },
        items: [],
      }),
    ).toThrow("données commerciales sont invalides");

    expect(gateway.createCustomerOrder).not.toHaveBeenCalled();
    expect(gateway.submitQuoteRequest).not.toHaveBeenCalled();
  });
});
