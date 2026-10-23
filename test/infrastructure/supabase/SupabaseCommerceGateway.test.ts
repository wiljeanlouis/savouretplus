import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseMock = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
}));

const orderPayload = {
  request_id: "10000000-0000-4000-8000-000000000001",
  customer_name: "Ada",
  customer_phone: "+15145551234",
  customer_email: null,
  note: null,
  total_cents: 1200,
  items: [
    {
      key: "pate:unit",
      product_id: "20000000-0000-4000-8000-000000000001",
      name: "Pâté",
      category: "tasting" as const,
      product_type: "standard" as const,
      image_url: "/pate.png",
      quantity: 1,
      base_price_cents: 1200,
      unit_price_cents: 1200,
      purchase_mode: {
        id: "unit",
        label: "Unité",
        quantity: 1,
        allocation_type: "none" as const,
      },
      selection: null,
      allocation: [],
      ingredients: [],
    },
  ],
};

vi.mock("@supabase/supabase-js", () => ({
  createClient: supabaseMock.createClient,
}));

describe("SupabaseCommerceGateway", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.createClient.mockReturnValue({
      from: supabaseMock.from,
      rpc: supabaseMock.rpc,
    });
  });

  it("loads and normalizes published catalog products", async () => {
    supabaseMock.from.mockReturnValue({
      select: supabaseMock.select,
    });
    supabaseMock.select.mockReturnValue({
      eq: supabaseMock.eq,
    });
    supabaseMock.eq.mockReturnValue({
      order: supabaseMock.order,
    });
    supabaseMock.order.mockResolvedValue({
      data: [
        {
          id: "pate-four",
          bom_id: "bom-1",
          slug: "pate-four",
          name: "Pate four",
          category: "decoration",
          subcategory: "decorative-arch",
          purchase_modes: [
            {
              id: "unit",
              label: "À l'unité",
              quantity: "1",
              price_cents: "300",
              allocation_type: "single_choice",
            },
            {
              id: "dozen",
              label: "Douzaine",
              quantity: "12",
              price_cents: "3000",
              allocation_type: "choice_allocation",
            },
          ],
          image_url: "",
        },
      ],
      error: null,
    });
    const { SupabaseCommerceGateway } = await import(
      "../../../src/infrastructure/supabase/SupabaseCommerceGateway"
    );
    const gateway = new SupabaseCommerceGateway("https://example.supabase.co", "anon-key");

    const products = await gateway.fetchCatalogProducts();

    expect(supabaseMock.from).toHaveBeenCalledWith("published_catalog_products");
    expect(supabaseMock.select).toHaveBeenCalledWith("*");
    expect(supabaseMock.eq).toHaveBeenCalledWith("is_available", true);
    expect(supabaseMock.order).toHaveBeenCalledWith("display_order", { ascending: true });
    expect(products[0]).toMatchObject({
      id: "pate-four",
      bom_id: "bom-1",
      category: "decoration",
      subcategory: "decorative-arch",
      product_type: "single_choice_bundle",
      availability_note: "",
    });
    expect(products[0]).not.toHaveProperty("unit_label");
    expect(products[0]).not.toHaveProperty("price_cents");
    expect(products[0]).not.toHaveProperty("dozen_price_cents");
    expect(products[0].purchase_modes).toEqual([
      {
        id: "unit",
        label: "À l'unité",
        quantity: 1,
        price_cents: 300,
        allocation_type: "single_choice",
      },
      {
        id: "dozen",
        label: "Douzaine",
        quantity: 12,
        price_cents: 3000,
        allocation_type: "choice_allocation",
      },
    ]);
  });

  it("ignores catalog products that do not define purchase modes", async () => {
    supabaseMock.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          order: () =>
            Promise.resolve({
              data: [
                {
                  id: "invalid-product",
                  bom_id: "bom-invalid",
                  slug: "invalid-product",
                  name: "Invalid product",
                  category: "tasting",
                  purchase_modes: [],
                },
                {
                  id: "valid-product",
                  bom_id: "bom-valid",
                  slug: "valid-product",
                  name: "Valid product",
                  category: "tasting",
                  purchase_modes: [
                    {
                      id: "unit",
                      label: "À l'unité",
                      quantity: 1,
                      price_cents: 900,
                      allocation_type: "single_choice",
                    },
                  ],
                },
              ],
              error: null,
            }),
        }),
      }),
    });
    const { SupabaseCommerceGateway } = await import(
      "../../../src/infrastructure/supabase/SupabaseCommerceGateway"
    );
    const gateway = new SupabaseCommerceGateway("https://example.supabase.co", "anon-key");

    await expect(gateway.fetchCatalogProducts()).resolves.toMatchObject([
      {
        id: "valid-product",
        purchase_modes: [{ price_cents: 900 }],
      },
    ]);
  });

  it("keeps decoration products that require a custom quote instead of a price", async () => {
    supabaseMock.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          order: () =>
            Promise.resolve({
              data: [
                {
                  id: "decor-custom",
                  bom_id: "decor-custom",
                  slug: "decor-sur-mesure",
                  name: "Décor sur mesure",
                  category: "decoration",
                  subcategory: "not-a-known-subcategory",
                  purchase_modes: [],
                },
              ],
              error: null,
            }),
        }),
      }),
    });
    const { SupabaseCommerceGateway } = await import(
      "../../../src/infrastructure/supabase/SupabaseCommerceGateway"
    );
    const gateway = new SupabaseCommerceGateway("https://example.supabase.co", "anon-key");

    await expect(gateway.fetchCatalogProducts()).resolves.toMatchObject([
      {
        id: "decor-custom",
        category: "decoration",
        subcategory: null,
        purchase_modes: [],
      },
    ]);
  });

  it("does not expose fallback products when Supabase returns an error", async () => {
    supabaseMock.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: null, error: new Error("blocked") }),
        }),
      }),
    });
    const { SupabaseCommerceGateway } = await import(
      "../../../src/infrastructure/supabase/SupabaseCommerceGateway"
    );
    const gateway = new SupabaseCommerceGateway("https://example.supabase.co", "anon-key");

    await expect(gateway.fetchCatalogProducts()).rejects.toThrow(
      "Impossible de charger le catalogue publié",
    );
  });

  it("keeps a successful empty catalog empty instead of showing unpublished fallback items", async () => {
    supabaseMock.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      }),
    });
    const { SupabaseCommerceGateway } = await import(
      "../../../src/infrastructure/supabase/SupabaseCommerceGateway"
    );
    const gateway = new SupabaseCommerceGateway("https://example.supabase.co", "anon-key");

    await expect(gateway.fetchCatalogProducts()).resolves.toEqual([]);
  });

  it("receives customer-order requests through the exact SAVIS RPC contract", async () => {
    supabaseMock.rpc.mockResolvedValue({
      data: "30000000-0000-4000-8000-000000000001",
      error: null,
      status: 200,
    });
    const { SupabaseCommerceGateway } = await import(
      "../../../src/infrastructure/supabase/SupabaseCommerceGateway"
    );
    const gateway = new SupabaseCommerceGateway("https://example.supabase.co", "anon-key");

    await expect(gateway.receiveCustomerOrder(orderPayload)).resolves.toBe(
      "30000000-0000-4000-8000-000000000001",
    );
    expect(supabaseMock.from).not.toHaveBeenCalledWith("customer_orders");
    expect(supabaseMock.rpc).toHaveBeenCalledWith("receive_customer_order", {
      payload: orderPayload,
    });
  });

  it.each([
    ["22023", "ORDER_INVALID_CONFIGURATION", "validation"],
    ["23505", "ORDER_IDEMPOTENCY_CONFLICT", "idempotency"],
  ])("maps controlled RPC error %s without retrying", async (code, message, kind) => {
    supabaseMock.rpc.mockResolvedValue({ data: null, error: { code, message }, status: 400 });
    const { SupabaseCommerceGateway } = await import(
      "../../../src/infrastructure/supabase/SupabaseCommerceGateway"
    );
    const gateway = new SupabaseCommerceGateway("https://example.supabase.co", "anon-key");

    await expect(gateway.receiveCustomerOrder(orderPayload)).rejects.toMatchObject({ kind, code });
    expect(supabaseMock.rpc).toHaveBeenCalledOnce();
  });

  it("retries a network failure with the identical request payload", async () => {
    vi.useFakeTimers();
    supabaseMock.rpc
      .mockResolvedValueOnce({ data: null, error: { code: "", message: "Failed to fetch" }, status: 0 })
      .mockResolvedValueOnce({ data: null, error: { code: "", message: "Failed to fetch" }, status: 0 })
      .mockResolvedValueOnce({
        data: "30000000-0000-4000-8000-000000000001",
        error: null,
        status: 200,
      });
    const { SupabaseCommerceGateway } = await import(
      "../../../src/infrastructure/supabase/SupabaseCommerceGateway"
    );
    const gateway = new SupabaseCommerceGateway("https://example.supabase.co", "anon-key");

    const reception = gateway.receiveCustomerOrder(orderPayload);
    await vi.runAllTimersAsync();

    await expect(reception).resolves.toBe("30000000-0000-4000-8000-000000000001");
    expect(supabaseMock.rpc).toHaveBeenCalledTimes(3);
    expect(supabaseMock.rpc.mock.calls.every(([, args]) => args.payload === orderPayload)).toBe(true);
    vi.useRealTimers();
  });

  it("submits quote requests through the Supabase RPC", async () => {
    supabaseMock.rpc.mockResolvedValue({ data: { id: "quote-1" }, error: null });
    const { SupabaseCommerceGateway } = await import(
      "../../../src/infrastructure/supabase/SupabaseCommerceGateway"
    );
    const gateway = new SupabaseCommerceGateway("https://example.supabase.co", "anon-key");
    const payload = { eventType: "anniversaire" };

    await expect(gateway.submitQuoteRequest(payload)).resolves.toEqual({ id: "quote-1" });
    expect(supabaseMock.rpc).toHaveBeenCalledWith("submit_quote_request", { payload });
  });

  it("surfaces an RPC error without retrying or changing the payload", async () => {
    const rpcError = new Error("Supabase unavailable");
    supabaseMock.rpc.mockResolvedValue({ data: null, error: rpcError });
    const { SupabaseCommerceGateway } = await import(
      "../../../src/infrastructure/supabase/SupabaseCommerceGateway"
    );
    const gateway = new SupabaseCommerceGateway("https://example.supabase.co", "anon-key");
    const payload = { eventType: "mariage", offering_id: "decor-42" };

    await expect(gateway.submitQuoteRequest(payload)).rejects.toBe(rpcError);
    expect(supabaseMock.rpc).toHaveBeenCalledOnce();
    expect(supabaseMock.rpc).toHaveBeenCalledWith("submit_quote_request", { payload });
  });
});
