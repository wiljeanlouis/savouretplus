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
    const product = { id: "20000000-0000-4000-8000-000000000001" };
    const item = {
      key: "pate-four:unit",
      product_id: "20000000-0000-4000-8000-000000000001",
      bom_id: "bom-1",
      name: "Pâté au four",
      category: "tasting",
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
      receiveCustomerOrder: vi
        .fn()
        .mockResolvedValue("30000000-0000-4000-8000-000000000001"),
      submitQuoteRequest: vi
        .fn()
        .mockResolvedValue("40000000-0000-4000-8000-000000000001"),
    };

    commerce.configureCommerceGateway(gateway);

    await expect(commerce.fetchCatalogProducts()).resolves.toEqual([product]);
    await expect(commerce.createCustomerOrder(order)).resolves.toBe(
      "30000000-0000-4000-8000-000000000001",
    );
    await expect(commerce.submitQuoteRequest(quote)).resolves.toBe(
      "40000000-0000-4000-8000-000000000001",
    );
    expect(gateway.fetchCatalogProducts).toHaveBeenCalledOnce();
    expect(gateway.receiveCustomerOrder).toHaveBeenCalledWith({
      request_id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      customer_name: "Ada",
      customer_phone: "+15145551234",
      customer_email: null,
      note: null,
      total_cents: 1200,
      items: [
        {
          key: "pate-four:unit",
          product_id: "20000000-0000-4000-8000-000000000001",
          name: "Pâté au four",
          category: "tasting",
          product_type: "standard",
          image_url: "/pate.png",
          quantity: 1,
          base_price_cents: 1200,
          unit_price_cents: 1200,
          purchase_mode: {
            id: "unit",
            label: "Unité",
            quantity: 1,
            allocation_type: "none",
          },
          selection: null,
          allocation: [],
          ingredients: [],
        },
      ],
    });
    expect(gateway.submitQuoteRequest).toHaveBeenCalledWith({
      request_id: expect.stringMatching(/^[0-9a-f-]{36}$/),
      ...quote,
      customer: { ...quote.customer, email: null, phone: "+15145551234" },
    });
  });

  it("does not call a gateway when order or quote validation fails", async () => {
    const commerce = await import("../../src/application/commerce");
    const gateway = {
      fetchCatalogProducts: vi.fn(),
      receiveCustomerOrder: vi.fn(),
      submitQuoteRequest: vi.fn(),
    };
    commerce.configureCommerceGateway(gateway);

    await expect(
      commerce.createCustomerOrder({
        customer: { name: "Ada", phone: "514" },
        items: [],
        totalCents: 0,
      }),
    ).rejects.toThrow("données commerciales sont invalides");
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

    expect(gateway.receiveCustomerOrder).not.toHaveBeenCalled();
    expect(gateway.submitQuoteRequest).not.toHaveBeenCalled();
  });
});
