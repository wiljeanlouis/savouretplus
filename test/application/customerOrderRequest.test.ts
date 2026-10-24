import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  completeCustomerOrderRequest,
  createCustomerOrderSubmitter,
  prepareCustomerOrderRequest,
} from "../../src/application/customerOrderRequest";
import type { CustomerOrder } from "../../src/domain/commercialValidation";

const firstRequestId = "10000000-0000-4000-8000-000000000001";
const secondRequestId = "10000000-0000-4000-8000-000000000002";
const fallbackRequestId = "00010203-0405-4607-8809-0a0b0c0d0e0f";

const order: CustomerOrder = {
  customer: {
    name: "Ada Lovelace",
    phone: "+15145551234",
    email: "ada@example.com",
    note: "Sans données sensibles dans localStorage",
  },
  totalCents: 1200,
  items: [
    {
      key: "pate:unit",
      product_id: "20000000-0000-4000-8000-000000000001",
      bom_id: "internal-bom-id",
      name: "Pâté",
      category: "tasting",
      product_type: "ingredient_customization",
      image_url: "/pate.png",
      quantity: 1,
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
      ingredients: [
        {
          id: "piment",
          name: "Piment",
          quantity: 1,
          default_quantity: 0,
          extra_price_cents: 100,
        },
      ],
    },
  ],
};

describe("customer order request persistence", () => {
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
    completeCustomerOrderRequest(firstRequestId);
    completeCustomerOrderRequest(secondRequestId);
    completeCustomerOrderRequest(fallbackRequestId);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("reuses the request UUID after a reload while the normalized request is identical", async () => {
    const first = await prepareCustomerOrderRequest(order);
    const replay = await prepareCustomerOrderRequest(structuredClone(order));

    expect(first.request_id).toBe(firstRequestId);
    expect(replay.request_id).toBe(firstRequestId);
    expect(globalThis.crypto.randomUUID).toHaveBeenCalledOnce();
  });

  it("creates a new UUID when the logical request changes", async () => {
    await prepareCustomerOrderRequest(order);
    const changed = await prepareCustomerOrderRequest({
      ...order,
      items: [{ ...order.items[0], quantity: 2 }],
      totalCents: 2400,
    });

    expect(changed.request_id).toBe(secondRequestId);
  });

  it("stores only the request UUID and a fingerprint, never customer data", async () => {
    const payload = await prepareCustomerOrderRequest(order);
    const storedValue = [...values.values()][0];

    expect(storedValue).not.toContain("Ada");
    expect(storedValue).not.toContain("5145551234");
    expect(storedValue).not.toContain("example.com");
    expect(payload.items[0]).not.toHaveProperty("bom_id");
    expect(payload.items[0].purchase_mode).not.toHaveProperty("price_cents");
    expect(payload.items[0].ingredients[0].default_quantity).toBe(0);
  });

  it("works in an insecure HTTP context without randomUUID or SubtleCrypto", async () => {
    vi.mocked(globalThis.crypto.randomUUID).mockRestore();
    const getRandomValues = vi.fn((bytes: Uint8Array) => {
      bytes.forEach((_, index) => {
        bytes[index] = index;
      });
      return bytes;
    });
    vi.stubGlobal("crypto", { getRandomValues });

    const first = await prepareCustomerOrderRequest(order);
    const replay = await prepareCustomerOrderRequest(structuredClone(order));

    expect(first.request_id).toBe(fallbackRequestId);
    expect(replay.request_id).toBe(fallbackRequestId);
    expect(getRandomValues).toHaveBeenCalledOnce();
    expect([...values.values()][0]).not.toContain("Ada");
  });

  it("forgets only a confirmed matching request", async () => {
    await prepareCustomerOrderRequest(order);

    completeCustomerOrderRequest(secondRequestId);
    expect(values.size).toBe(1);

    completeCustomerOrderRequest(firstRequestId);
    expect(values.size).toBe(0);
  });

  it("allows only one in-flight submission and unlocks after completion", async () => {
    let completeSubmission: (value: string) => void = () => undefined;
    const submit = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          completeSubmission = resolve;
        }),
    );
    const submitOnce = createCustomerOrderSubmitter(submit);

    const first = submitOnce(order);
    await expect(submitOnce(order)).resolves.toEqual({ submitted: false });
    expect(submit).toHaveBeenCalledOnce();

    completeSubmission("received");
    await expect(first).resolves.toEqual({ submitted: true, value: "received" });

    const next = submitOnce(order);
    expect(submit).toHaveBeenCalledTimes(2);
    completeSubmission("received-again");
    await expect(next).resolves.toEqual({ submitted: true, value: "received-again" });
  });
});
