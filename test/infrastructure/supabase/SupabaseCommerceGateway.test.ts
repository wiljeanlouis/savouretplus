import { beforeEach, describe, expect, it, vi } from "vitest";
import { fallbackCatalog } from "../../../src/infrastructure/local/fallbackCatalog";

const supabaseMock = vi.hoisted(() => ({
  createClient: vi.fn(),
  from: vi.fn(),
  rpc: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  insert: vi.fn(),
}));

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
          price_cents: "300",
          dozen_price_cents: "3000",
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
      category: "degustation",
      product_type: "standard",
      price_cents: 300,
      dozen_price_cents: "3000",
      availability_note: "Disponible sur commande",
    });
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

  it("falls back to the local catalog when Supabase returns an error", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
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

    await expect(gateway.fetchCatalogProducts()).resolves.toBe(fallbackCatalog);
  });

  it("inserts customer orders into Supabase", async () => {
    supabaseMock.from.mockReturnValue({
      insert: supabaseMock.insert,
    });
    supabaseMock.insert.mockResolvedValue({ error: null });
    const { SupabaseCommerceGateway } = await import(
      "../../../src/infrastructure/supabase/SupabaseCommerceGateway"
    );
    const gateway = new SupabaseCommerceGateway("https://example.supabase.co", "anon-key");

    await expect(
      gateway.createCustomerOrder({
        customer: { name: "Ada", phone: "514", email: "", note: "" },
        items: [],
        totalCents: 1200,
      }),
    ).resolves.toEqual({ accepted: true });
    expect(supabaseMock.from).toHaveBeenCalledWith("customer_orders");
    expect(supabaseMock.insert).toHaveBeenCalledWith({
      customer_name: "Ada",
      customer_phone: "514",
      customer_email: null,
      note: null,
      status: "new",
      source: "savouretplus",
      total_cents: 1200,
      items: [],
    });
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
});
