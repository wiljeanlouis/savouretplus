import { isCatalogSlug, type CatalogProduct } from "./catalog";
import type { QuoteItem, QuoteRequest } from "./commercialValidation";

export const quoteRequestServices = {
  traiteur: ["traiteur"],
  decoration: ["decoration"],
  organisation: ["organisation"],
  "decoration-organisation": ["decoration", "organisation"],
  "traiteur-decoration-organisation": ["traiteur", "decoration", "organisation"],
} as const;

export type QuoteService = keyof typeof quoteRequestServices;
export type RequestedService = (typeof quoteRequestServices)[QuoteService][number];

export type QuoteQuery = {
  service: QuoteService | "";
  itemSlug: string | null;
};

export type QuoteFormValues = {
  request_type: QuoteService | "";
  event_type: string;
  event_date: string;
  event_time: string;
  event_address: string;
  guest_count: number | string;
  budget: string;
  name: string;
  phone: string;
  email: string;
  allergies: string;
  note: string;
};

export function isQuoteService(value: string): value is QuoteService {
  return Object.hasOwn(quoteRequestServices, value);
}

export function getRequestedServices(requestType: string): RequestedService[] {
  return isQuoteService(requestType) ? [...quoteRequestServices[requestType]] : [];
}

export function quoteIncludesService(requestType: string, service: RequestedService) {
  return getRequestedServices(requestType).includes(service);
}

export function shouldRequestGuestCount(requestType: string) {
  return (
    quoteIncludesService(requestType, "traiteur") ||
    quoteIncludesService(requestType, "organisation")
  );
}

export function getQuoteQueryFromHash(hash: string): QuoteQuery {
  const query = hash.split("?")[1] || "";
  const params = new URLSearchParams(query);
  const service = params.get("service") || "";
  const itemSlug = params.get("item");

  const validatedService = isQuoteService(service) ? service : "";
  const includesDecoration = quoteIncludesService(validatedService, "decoration");

  return {
    service: validatedService,
    itemSlug:
      includesDecoration &&
      itemSlug &&
      isCatalogSlug(itemSlug)
        ? itemSlug
        : null,
  };
}

export function buildQuoteHash(service: QuoteService | "", itemSlug: string | null = null) {
  if (!service) return "#/soumission";

  const params = new URLSearchParams({ service });
  if (
    quoteIncludesService(service, "decoration") &&
    itemSlug &&
    isCatalogSlug(itemSlug)
  ) {
    params.set("item", itemSlug);
  }

  return `#/soumission?${params.toString()}`;
}

export function findSelectedDecoration(products: CatalogProduct[], itemSlug: string | null) {
  if (!itemSlug) return null;

  return (
    products.find(
      (product) => product.category === "decoration" && product.slug === itemSlug,
    ) ?? null
  );
}

export function createDecorationQuoteItem(product: CatalogProduct) {
  return {
    offering_id: product.id,
    name: product.name,
    requested_quantity: 1,
    configuration: {
      catalog_slug: product.slug,
      category: product.category,
      subcategory: product.subcategory,
    },
    note: null,
  };
}

export function buildQuoteRequest(
  form: QuoteFormValues,
  items: QuoteItem[],
): QuoteRequest {
  const requestedServices = getRequestedServices(form.request_type);
  const includesCatering = requestedServices.includes("traiteur");
  const includesGuestCount = shouldRequestGuestCount(form.request_type);

  return {
    type: "QUOTE_REQUEST",
    customer: {
      name: form.name,
      phone: form.phone,
      email: form.email,
    },
    requested_services: requestedServices,
    event_details: {
      request_type: form.request_type,
      event_type: form.event_type,
      event_date: form.event_date,
      event_time: form.event_time || null,
      event_address: form.event_address,
      guest_count:
        includesGuestCount && form.guest_count !== "" ? Number(form.guest_count) : null,
      budget: form.budget,
      allergies: includesCatering && form.allergies ? form.allergies : null,
      note: form.note || null,
    },
    items,
  };
}

export function createQuoteSubmitter(
  submit: (payload: QuoteRequest) => Promise<unknown>,
) {
  let submitting = false;

  return async (payload: QuoteRequest) => {
    if (submitting) return { submitted: false as const };

    submitting = true;
    try {
      return { submitted: true as const, value: await submit(payload) };
    } finally {
      submitting = false;
    }
  };
}
