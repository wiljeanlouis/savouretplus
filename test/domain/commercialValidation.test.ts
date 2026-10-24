import { describe, expect, it } from "vitest";
import type { CartItem } from "../../src/domain/cart";
import type { QuoteRequest } from "../../src/domain/commercialValidation";
import {
  formatPhoneInput,
  formatDateForDisplay,
  normalizePhone,
  validateCustomerContact,
  validateCustomerOrder,
  validateQuoteRequest,
} from "../../src/domain/commercialValidation";

const validCartItem: CartItem = {
  key: "pate-four:unit",
  product_id: "20000000-0000-4000-8000-000000000001",
  bom_id: "bom-pate-four",
  catalog_slug: "pate-au-four",
  name: "Pâté au four",
  category: "tasting",
  subcategory: null,
  product_type: "standard",
  pricing: "known",
  base_price_cents: 300,
  unit_price_cents: 300,
  purchase_mode: {
    id: "unit",
    label: "Unité",
    quantity: 1,
    price_cents: 300,
    allocation_type: "none",
  },
  selection: null,
  allocation: [],
  ingredients: [],
  quantity: 2,
  image_url: "/pate.png",
  note: null,
};

const validQuote: QuoteRequest = {
  type: "QUOTE_REQUEST",
  customer: {
    name: "Marie Tremblay",
    phone: "(514) 555-1234",
    email: "marie@example.com",
  },
  requested_services: ["decoration"],
  event_details: {
    request_type: "decoration",
    event_type: "Mariage",
    event_date: "2027-06-12",
    event_time: "18:30",
    event_address: "123, rue Principale",
    guest_count: 80,
    budget: "1000$ et plus",
    allergies: null,
    note: null,
  },
  items: [],
};

describe("phone validation", () => {
  it("formats a Canadian phone progressively like SAVIS", () => {
    expect(formatPhoneInput("5")).toBe("5");
    expect(formatPhoneInput("5145")).toBe("(514) 5");
    expect(formatPhoneInput("5145551234")).toBe("(514) 555-1234");
  });

  it.each([
    "5145551234",
    "514-555-1234",
    "(514) 555-1234",
    "+1 514 555 1234",
    "  (514) 555-1234  ",
  ])("normalizes %s to the SAVIS E.164 representation", (phone) => {
    expect(normalizePhone(phone)).toBe("+15145551234");
  });

  it("supports valid international E.164 input", () => {
    expect(normalizePhone("+33 1 42 68 53 00")).toBe("+33142685300");
  });

  it.each([
    "514555123",
    "51455512345",
    "514-ABC-1234",
    "514/555/1234",
    "123-456-7890",
  ])("rejects an invalid phone: %s", (phone) => {
    expect(normalizePhone(phone)).toBeNull();
  });
});

describe("customer order validation", () => {
  it("accepts a valid client and normalizes the phone before submission", () => {
    const result = validateCustomerOrder({
      customer: { name: "  Marie Tremblay  ", phone: "514-555-1234", email: "" },
      items: [validCartItem],
      totalCents: 600,
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.value.customer).toMatchObject({
        name: "Marie Tremblay",
        phone: "+15145551234",
        email: null,
      });
    }
  });

  it("rejects an invalid phone and an empty cart", () => {
    const result = validateCustomerOrder({
      customer: { name: "Marie", phone: "514" },
      items: [],
      totalCents: 0,
    });

    expect(result.errors).toMatchObject({
      "customer.phone": expect.stringContaining("invalide"),
      items: expect.stringContaining("au moins un article"),
    });
  });

  it("rejects invalid quantities and non-finite numeric data", () => {
    const result = validateCustomerOrder({
      customer: { name: "Marie", phone: "514-555-1234" },
      items: [{ ...validCartItem, quantity: 1.5, unit_price_cents: Number.NaN }],
      totalCents: Number.POSITIVE_INFINITY,
    });

    expect(result.errors).toMatchObject({
      "items.0.quantity": expect.stringContaining("entier entre"),
      "items.0.price": expect.stringContaining("prix"),
      totalCents: expect.stringContaining("total"),
    });
  });

  it("rejects an estimated total that does not match the cart lines", () => {
    const result = validateCustomerOrder({
      customer: { name: "Marie", phone: "514-555-1234" },
      items: [validCartItem],
      totalCents: 599,
    });

    expect(result.errors.totalCents).toContain("ne correspond pas");
  });

  it("rejects a fallback identifier and a quantity above the RPC limit", () => {
    const result = validateCustomerOrder({
      customer: { name: "Marie", phone: "514-555-1234" },
      items: [{ ...validCartItem, product_id: "pate-four", quantity: 1001 }],
      totalCents: 600,
    });

    expect(result.errors).toMatchObject({
      "items.0": expect.stringContaining("incomplet"),
      "items.0.quantity": expect.stringContaining("1 et 1000"),
    });
  });

  it("rejects quote-only decoration lines from the direct order contract", () => {
    const result = validateCustomerOrder({
      customer: { name: "Marie", phone: "514-555-1234" },
      items: [{
        ...validCartItem,
        category: "decoration",
        pricing: "quote",
        base_price_cents: null,
        unit_price_cents: null,
        purchase_mode: null,
      }],
      totalCents: 0,
    });

    expect(result.errors["items.0.category"]).toContain("Dégustation");
    expect(result.errors["items.0.price"]).toContain("prix");
    expect(result.errors["items.0.purchase_mode"]).toContain("format");
  });

  it("requires the selected option for a single-choice configuration", () => {
    const result = validateCustomerOrder({
      customer: { name: "Marie", phone: "514-555-1234" },
      items: [
        {
          ...validCartItem,
          product_type: "single_choice",
          selection: null,
        },
      ],
      totalCents: 600,
    });

    expect(result.errors["items.0.selection"]).toContain("Choisissez une option");
  });
});

describe("quote request validation", () => {
  it("formats a valid entered date like SAVIS while preserving the ISO value", () => {
    expect(formatDateForDisplay("2027-06-12")).toBe("12 juin 2027");
    expect(formatDateForDisplay("2027-02-30")).toBe("");
  });

  it("accepts a valid request and an empty optional email", () => {
    const result = validateQuoteRequest({
      ...validQuote,
      customer: { ...validQuote.customer, email: "" },
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.value.customer.phone).toBe("+15145551234");
      expect(result.value.event_details.guest_count).toBeNull();
      expect(result.value.event_details.allergies).toBeNull();
    }
  });

  it("reports required fields, phone, email, and date errors", () => {
    const result = validateQuoteRequest({
      ...validQuote,
      customer: { name: " ", phone: "514", email: "incorrect" },
      event_details: {
        ...validQuote.event_details,
        event_type: "",
        event_date: "2027-02-30",
        event_address: "",
        budget: "",
      },
    });

    expect(result.errors).toMatchObject({
      "customer.name": expect.stringContaining("requis"),
      "customer.phone": expect.stringContaining("invalide"),
      "customer.email": expect.stringContaining("invalide"),
      "event_details.event_type": expect.stringContaining("requis"),
      "event_details.event_date": expect.stringContaining("invalide"),
      "event_details.event_address": expect.stringContaining("requise"),
      "event_details.budget": expect.stringContaining("requis"),
    });
  });

  it("rejects an invalid decoration reference", () => {
    const result = validateQuoteRequest({
      ...validQuote,
      items: [
        {
          offering_id: "",
          name: "Arche romantique",
          requested_quantity: 1,
          configuration: { category: "decoration", catalog_slug: "" },
          note: null,
        },
      ],
    });

    expect(result.errors).toMatchObject({
      "items.0.offering_id": expect.stringContaining("référence"),
      "items.0.configuration": expect.stringContaining("décoration"),
    });
  });

  it("rejects services that do not match the selected request type", () => {
    const result = validateQuoteRequest({
      ...validQuote,
      requested_services: ["organisation"],
    });

    expect(result.errors.requested_services).toContain("incohérents");
  });

  it("accepts a catering request without catalog items", () => {
    const result = validateQuoteRequest({
      ...validQuote,
      requested_services: ["traiteur"],
      event_details: {
        ...validQuote.event_details,
        request_type: "traiteur",
        guest_count: 80,
        allergies: "Noix",
      },
      items: [],
    });

    expect(result.valid).toBe(true);
  });

  it("rejects a fractional requested item quantity", () => {
    const result = validateQuoteRequest({
      ...validQuote,
      items: [
        {
          offering_id: "decor-1",
          name: "Arche romantique",
          requested_quantity: 1.5,
          configuration: {
            category: "decoration",
            catalog_slug: "arche-romantique",
          },
          note: null,
        },
      ],
    });

    expect(result.errors["items.0.requested_quantity"]).toContain("entre 1 et 1000");
  });

  it("rejects an item without a supported catalog category", () => {
    const result = validateQuoteRequest({
      ...validQuote,
      items: [
        {
          offering_id: "decor-1",
          name: "Arche romantique",
          requested_quantity: 1,
          configuration: {},
          note: null,
        },
      ],
    });

    expect(result.errors["items.0.configuration"]).toContain("catégorie catalogue");
  });

  it("accepts mixed catering and decoration services without organisation", () => {
    const result = validateQuoteRequest({
      ...validQuote,
      requested_services: ["traiteur", "decoration"],
      event_details: {
        ...validQuote.event_details,
        request_type: "traiteur-decoration",
        guest_count: 80,
      },
      items: [
        {
          offering_id: "91000000-0000-4000-8000-000000000001",
          name: "Arche décorative",
          requested_quantity: 1,
          configuration: { category: "decoration", catalog_slug: "arche" },
          note: null,
        },
        {
          offering_id: "91000000-0000-4000-8000-000000000002",
          name: "Pâté au four",
          requested_quantity: 4,
          configuration: { category: "tasting", catalog_slug: "pate" },
          note: "Poulet",
        },
      ],
    });

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.value.requested_services).toEqual(["traiteur", "decoration"]);
      expect(result.value.requested_services).not.toContain("organisation");
    }
  });
});
