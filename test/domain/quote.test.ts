import { describe, expect, it, vi } from "vitest";
import type { CatalogProduct } from "../../src/domain/catalog";
import type { QuoteRequest } from "../../src/domain/commercialValidation";
import {
  buildQuoteHash,
  buildQuoteRequest,
  createDecorationQuoteItem,
  createSelectionQuoteItem,
  buildSelectionQuoteHash,
  createQuoteSubmitter,
  findSelectedDecoration,
  getQuoteQueryFromHash,
  getRequestedServices,
  shouldRequestGuestCount,
} from "../../src/domain/quote";

const decoration: CatalogProduct = {
  id: "decor-42",
  bom_id: "decor-42",
  slug: "arche-romantique",
  name: "Arche romantique",
  category: "decoration",
  subcategory: "wedding",
  description: "Une arche fleurie.",
  product_type: "standard",
  purchase_modes: [],
  choice_group: null,
  ingredient_options: [],
  image_url: "/arche.png",
  gallery: ["/arche.png"],
  availability_note: "Sur demande",
};

const form = {
  request_type: "decoration" as const,
  event_type: "Mariage",
  event_date: "2027-06-12",
  event_time: "18:30",
  event_address: "Montréal",
  guest_count: "80",
  budget: "1000$ et plus",
  name: "Marie Tremblay",
  phone: "514-555-1234",
  email: "marie@example.com",
  allergies: "Noix",
  note: "Palette rose et crème",
};

const validQuote: QuoteRequest = buildQuoteRequest(form, []);

describe("quote model selection", () => {
  it("validates the service and selected product slug", () => {
    expect(
      getQuoteQueryFromHash(
        "#/soumission?service=decoration&item=arche-romantique",
      ),
    ).toEqual({ service: "decoration", itemSlug: "arche-romantique", fromSelection: false });
    expect(
      getQuoteQueryFromHash("#/soumission?service=inconnu&item=arche-romantique"),
    ).toEqual({ service: "", itemSlug: null, fromSelection: false });
    expect(
      getQuoteQueryFromHash("#/soumission?service=decoration&item=../../secret"),
    ).toEqual({ service: "decoration", itemSlug: null, fromSelection: false });
    expect(
      getQuoteQueryFromHash("#/soumission?service=traiteur&item=arche-romantique"),
    ).toEqual({ service: "traiteur", itemSlug: null, fromSelection: false });
  });

  it("supports direct access and every documented service link", () => {
    expect(getQuoteQueryFromHash("#/soumission")).toEqual({ service: "", itemSlug: null, fromSelection: false });

    for (const service of [
      "traiteur",
      "decoration",
      "organisation",
      "decoration-organisation",
      "traiteur-decoration-organisation",
    ]) {
      expect(getQuoteQueryFromHash(`#/soumission?service=${service}`).service).toBe(service);
    }
  });

  it("builds safe quote routes and items from a mono-category selection", () => {
    const decorationItem = {
      key: "decor-42:quote:none",
      product_id: "decor-42",
      bom_id: "decor-42",
      catalog_slug: "arche-romantique",
      name: "Arche romantique",
      category: "decoration" as const,
      subcategory: "wedding" as const,
      product_type: "standard" as const,
      pricing: "quote" as const,
      base_price_cents: null,
      unit_price_cents: null,
      purchase_mode: null,
      selection: null,
      allocation: [],
      ingredients: [],
      quantity: 2,
      image_url: "/arche.png",
      note: "Rose poudré",
    };

    expect(buildSelectionQuoteHash([decorationItem])).toBe(
      "#/soumission?service=decoration&source=selection",
    );
    expect(getQuoteQueryFromHash("#/soumission?service=decoration&source=selection").fromSelection).toBe(true);
    expect(createSelectionQuoteItem(decorationItem)).toMatchObject({
      offering_id: "decor-42",
      requested_quantity: 2,
      configuration: { category: "decoration", catalog_slug: "arche-romantique" },
      note: "Rose poudré",
    });
    expect(buildSelectionQuoteHash([
      decorationItem,
      { ...decorationItem, key: "food", product_id: "food", category: "tasting" as const },
    ])).toBeNull();
  });

  it("builds a canonical URL and keeps an item only for a decoration service", () => {
    expect(buildQuoteHash("decoration", "arche-romantique")).toBe(
      "#/soumission?service=decoration&item=arche-romantique",
    );
    expect(buildQuoteHash("traiteur", "arche-romantique")).toBe(
      "#/soumission?service=traiteur",
    );
    expect(buildQuoteHash("", "arche-romantique")).toBe("#/soumission");
  });

  it("selects only an existing decoration model", () => {
    const tasting = { ...decoration, id: "food", category: "tasting" as const };

    expect(findSelectedDecoration([decoration], "arche-romantique")).toBe(decoration);
    expect(findSelectedDecoration([decoration], "inexistant")).toBeNull();
    expect(findSelectedDecoration([tasting], "arche-romantique")).toBeNull();
  });

  it("keeps the model reference in the existing quote item shape", () => {
    expect(createDecorationQuoteItem(decoration)).toEqual({
      offering_id: "decor-42",
      name: "Arche romantique",
      requested_quantity: 1,
      configuration: {
        catalog_slug: "arche-romantique",
        category: "decoration",
        subcategory: "wedding",
      },
      note: null,
    });
  });
});

describe("quote service adaptation", () => {
  it("uses the single contract mapping for services and relevant guest count", () => {
    expect(getRequestedServices("decoration-organisation")).toEqual([
      "decoration",
      "organisation",
    ]);
    expect(getRequestedServices("unknown")).toEqual([]);
    expect(shouldRequestGuestCount("decoration")).toBe(false);
    expect(shouldRequestGuestCount("organisation")).toBe(true);
    expect(shouldRequestGuestCount("traiteur")).toBe(true);
  });

  it("builds a decoration payload without hidden catering or guest data", () => {
    const item = createDecorationQuoteItem(decoration);
    const payload = buildQuoteRequest(form, [item]);

    expect(payload).toMatchObject({
      type: "QUOTE_REQUEST",
      requested_services: ["decoration"],
      event_details: {
        request_type: "decoration",
        guest_count: null,
        allergies: null,
        note: "Palette rose et crème",
      },
      items: [item],
    });
  });

  it("preserves entered values across service changes but transmits only relevant data", () => {
    const cateringPayload = buildQuoteRequest(
      { ...form, request_type: "traiteur" },
      [],
    );
    const decorationPayload = buildQuoteRequest(form, []);

    expect(cateringPayload.event_details).toMatchObject({ guest_count: 80, allergies: "Noix" });
    expect(decorationPayload.event_details).toMatchObject({ guest_count: null, allergies: null });
    expect(form).toMatchObject({ guest_count: "80", allergies: "Noix" });
  });

  it("builds the documented combined-service payload without changing item references", () => {
    const decorationItem = createDecorationQuoteItem(decoration);
    const cateringItem = {
      offering_id: "pate-1",
      name: "Pâté au four",
      requested_quantity: 12,
      configuration: { category: "tasting", catalog_slug: "pate-au-four" },
      note: "Poulet",
    };
    const payload = buildQuoteRequest(
      { ...form, request_type: "traiteur-decoration-organisation" },
      [decorationItem, cateringItem],
    );

    expect(payload.requested_services).toEqual(["traiteur", "decoration", "organisation"]);
    expect(payload.event_details).toMatchObject({ guest_count: 80, allergies: "Noix" });
    expect(payload.items).toEqual([decorationItem, cateringItem]);
  });
});

describe("quote submission lock", () => {
  it("ignores a second submission while the first request is pending", async () => {
    let resolveRequest!: (value: unknown) => void;
    const pendingRequest = new Promise((resolve) => {
      resolveRequest = resolve;
    });
    const submit = vi.fn().mockReturnValue(pendingRequest);
    const submitOnce = createQuoteSubmitter(submit);

    const first = submitOnce(validQuote);
    await expect(submitOnce(validQuote)).resolves.toEqual({ submitted: false });
    expect(submit).toHaveBeenCalledOnce();

    resolveRequest({ id: "quote-1" });
    await expect(first).resolves.toEqual({
      submitted: true,
      value: { id: "quote-1" },
    });
  });

  it("releases the lock after a network error so the client can retry", async () => {
    const submit = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({ id: "quote-2" });
    const submitOnce = createQuoteSubmitter(submit);

    await expect(submitOnce(validQuote)).rejects.toThrow("network");
    await expect(submitOnce(validQuote)).resolves.toEqual({
      submitted: true,
      value: { id: "quote-2" },
    });
    expect(submit).toHaveBeenCalledTimes(2);
  });
});
