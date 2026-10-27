import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeQuoteRequest,
  prepareQuoteRequest,
} from "../../src/application/quoteRequest";
import type { QuoteRequest } from "../../src/domain/commercialValidation";

const firstRequestId = "60000000-0000-4000-8000-000000000001";
const secondRequestId = "60000000-0000-4000-8000-000000000002";

const request: QuoteRequest = {
  type: "QUOTE_REQUEST",
  customer: {
    name: "Marie Tremblay",
    phone: "+15145551234",
    email: "marie@example.com",
  },
  requested_services: ["traiteur", "decoration"],
  event_details: {
    request_type: "traiteur-decoration",
    event_type: "Mariage",
    event_date: "2027-06-12",
    event_time: "18:30",
    event_address: "Montréal",
    guest_count: 80,
    budget: "1000$ et plus",
    allergies: "Noix",
    note: null,
  },
  items: [
    {
      offering_id: "91000000-0000-4000-8000-000000000001",
      name: "Arche décorative",
      requested_quantity: 1,
      configuration: { category: "decoration", catalog_slug: "arche" },
      note: "Fleurs blanches",
    },
    {
      offering_id: "91000000-0000-4000-8000-000000000002",
      name: "Pâté au four",
      requested_quantity: 4,
      configuration: {
        category: "tasting",
        catalog_slug: "pate",
        purchase_mode: { id: "dozen", quantity: 12 },
      },
      note: "Poulet",
    },
  ],
};

describe("quote request persistence", () => {
  const values = new Map<string, string>();

  beforeEach(() => {
    values.clear();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    });
    vi.spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValueOnce(firstRequestId)
      .mockReturnValueOnce(secondRequestId);
  });

  afterEach(() => {
    completeQuoteRequest(firstRequestId);
    completeQuoteRequest(secondRequestId);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("reuses one request UUID for an identical mixed request", async () => {
    const first = await prepareQuoteRequest(request);
    const replay = await prepareQuoteRequest(structuredClone(request));

    expect(first.request_id).toBe(firstRequestId);
    expect(replay.request_id).toBe(firstRequestId);
    expect(globalThis.crypto.randomUUID).toHaveBeenCalledOnce();
  });

  it("preserves a realisation reference in the existing event note", async () => {
    const payload = await prepareQuoteRequest({
      ...request, event_details: { ...request.event_details, note: "Inspiration : REA-0001" },
    });
    expect(payload.event_details.note).toBe("Inspiration : REA-0001");
  });

  it("creates a new request UUID when a line changes", async () => {
    await prepareQuoteRequest(request);
    const changed = structuredClone(request);
    changed.items[1].requested_quantity = 5;

    expect((await prepareQuoteRequest(changed)).request_id).toBe(secondRequestId);
  });

  it("stores only the request UUID and fingerprint and clears them after success", async () => {
    const payload = await prepareQuoteRequest(request);
    const stored = [...values.values()][0];

    expect(stored).not.toContain("Marie");
    expect(stored).not.toContain("example.com");
    expect(payload.items).toEqual(request.items);

    completeQuoteRequest(payload.request_id);
    expect(values.size).toBe(0);
  });
});

