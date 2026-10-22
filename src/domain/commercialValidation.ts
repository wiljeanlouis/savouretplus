import { AsYouType, parsePhoneNumberFromString } from "libphonenumber-js";
import type { CartItem } from "./cart";

export type CustomerContact = {
  name: string;
  phone: string;
  email?: string | null;
  note?: string;
};

export type CustomerOrder = {
  customer: CustomerContact;
  items: CartItem[];
  totalCents: number;
};

export type QuoteItem = {
  offering_id: string;
  name: string;
  requested_quantity: number;
  configuration: Record<string, unknown>;
  note: string | null;
};

export type QuoteRequest = {
  type: "QUOTE_REQUEST";
  customer: CustomerContact;
  requested_services: string[];
  event_details: {
    request_type: string;
    event_type: string;
    event_date: string;
    event_time: string | null;
    event_address: string;
    guest_count: number | null;
    budget: string;
    allergies: string | null;
    note: string | null;
  };
  items: QuoteItem[];
};

export type ValidationErrors = Record<string, string>;

export type ValidationResult<T> =
  | { valid: true; value: T; errors: ValidationErrors }
  | { valid: false; value: null; errors: ValidationErrors };

const canadianPhoneMessage =
  "Le numéro de téléphone est invalide. Saisissez un numéro canadien à 10 chiffres, par exemple 514-555-1234, ou un numéro international avec son indicatif.";
const allowedPhoneCharacters = /^\+?[0-9().\-\s]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class CommercialValidationError extends Error {
  readonly errors: ValidationErrors;

  constructor(errors: ValidationErrors) {
    super("Les données commerciales sont invalides.");
    this.name = "CommercialValidationError";
    this.errors = errors;
  }
}

export function normalizePhone(value: string): string | null {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed || !allowedPhoneCharacters.test(trimmed)) return null;

  const phone = parsePhoneNumberFromString(trimmed, "CA");
  if (!phone || phone.ext || !phone.isValid()) return null;

  return phone.number;
}

export function formatPhoneInput(value: string): string {
  return value.trim() ? new AsYouType("CA").input(value) : "";
}

export function formatDateForDisplay(value: string) {
  if (!isValidIsoDate(value)) return "";

  return new Intl.DateTimeFormat("fr-CA", { dateStyle: "medium" }).format(
    new Date(`${value}T12:00:00`),
  );
}

export function validateCustomerContact(
  customer: CustomerContact,
  prefix = "customer",
): ValidationResult<CustomerContact> {
  const errors: ValidationErrors = {};
  const name = typeof customer?.name === "string" ? customer.name.trim() : "";
  const phoneInput = typeof customer?.phone === "string" ? customer.phone.trim() : "";
  const email = typeof customer?.email === "string" ? customer.email.trim() : "";

  if (!name) errors[`${prefix}.name`] = "Le nom est requis.";

  const phone = normalizePhone(phoneInput);
  if (!phoneInput) {
    errors[`${prefix}.phone`] = "Le numéro de téléphone est requis.";
  } else if (!phone) {
    errors[`${prefix}.phone`] = canadianPhoneMessage;
  }

  if (email && !emailPattern.test(email)) {
    errors[`${prefix}.email`] = "Le courriel est invalide.";
  }

  if (hasErrors(errors)) return invalid(errors);

  return valid({
    ...customer,
    name,
    phone,
    email: email || null,
  });
}

export function validateCustomerOrder(order: CustomerOrder): ValidationResult<CustomerOrder> {
  const errors: ValidationErrors = {};
  const customerResult = validateCustomerContact(order?.customer);
  Object.assign(errors, customerResult.errors);

  if (!Array.isArray(order?.items) || order.items.length === 0) {
    errors.items = "Le panier doit contenir au moins un article.";
  } else {
    order.items.forEach((item, index) => validateCartItem(item, index, errors));
  }

  if (!isNonNegativeInteger(order?.totalCents)) {
    errors.totalCents = "Le total de la commande est invalide.";
  }

  if (hasErrors(errors) || !customerResult.valid) return invalid(errors);

  return valid({ ...order, customer: customerResult.value });
}

export function validateQuoteRequest(request: QuoteRequest): ValidationResult<QuoteRequest> {
  const errors: ValidationErrors = {};
  const customerResult = validateCustomerContact(request?.customer);
  Object.assign(errors, customerResult.errors);

  if (request?.type !== "QUOTE_REQUEST") {
    errors.type = "Le type de demande est invalide.";
  }

  if (!Array.isArray(request?.requested_services) || request.requested_services.length === 0) {
    errors.requested_services = "Choisissez un type de demande.";
  } else if (
    request.requested_services.some(
      (service) =>
        service !== "traiteur" && service !== "decoration" && service !== "organisation",
    )
  ) {
    errors.requested_services = "Le type de demande est invalide.";
  }

  const event = request?.event_details;
  if (!hasText(event?.request_type)) {
    errors["event_details.request_type"] = "Choisissez un type de demande.";
  } else {
    const expectedServices = servicesForRequestType[event.request_type];
    if (!expectedServices) {
      errors["event_details.request_type"] = "Le type de demande est invalide.";
    } else if (
      [...(request?.requested_services || [])].sort().join("|") !==
      [...expectedServices].sort().join("|")
    ) {
      errors.requested_services = "Les services demandés sont incohérents.";
    }
  }
  if (!hasText(event?.event_type)) {
    errors["event_details.event_type"] = "Le type d’événement est requis.";
  }
  if (!hasText(event?.event_date)) {
    errors["event_details.event_date"] = "La date de l’événement est requise.";
  } else if (!isValidIsoDate(event.event_date)) {
    errors["event_details.event_date"] = "La date de l’événement est invalide.";
  }
  if (event?.event_time && !isValidTime(event.event_time)) {
    errors["event_details.event_time"] = "L’heure de l’événement est invalide.";
  }
  if (!hasText(event?.event_address)) {
    errors["event_details.event_address"] = "L’adresse de l’événement est requise.";
  }
  if (!hasText(event?.budget)) {
    errors["event_details.budget"] = "Le budget est requis.";
  }
  if (event?.guest_count !== null && !isPositiveInteger(event?.guest_count)) {
    errors["event_details.guest_count"] = "Le nombre d’invités doit être un entier positif.";
  }

  if (!Array.isArray(request?.items)) {
    errors.items = "Les articles demandés sont invalides.";
  } else {
    request.items.forEach((item, index) =>
      validateQuoteItem(item, index, request?.requested_services || [], errors),
    );
  }

  if (
    request?.requested_services?.includes("traiteur") &&
    (!Array.isArray(request?.items) ||
      !request.items.some((item) => item.configuration?.category === "tasting"))
  ) {
    errors.items = "Ajoutez au moins un item traiteur.";
  }

  if (hasErrors(errors) || !customerResult.valid) return invalid(errors);

  return valid({
    ...request,
    customer: customerResult.value,
    event_details: {
      ...event,
      request_type: event.request_type.trim(),
      event_type: event.event_type.trim(),
      event_address: event.event_address.trim(),
      budget: event.budget.trim(),
    },
  });
}

function validateCartItem(item: CartItem, index: number, errors: ValidationErrors) {
  const prefix = `items.${index}`;

  if (!hasText(item?.product_id) || !hasText(item?.bom_id) || !hasText(item?.name)) {
    errors[prefix] = "Un article du panier est incomplet.";
  }
  if (!isPositiveInteger(item?.quantity)) {
    errors[`${prefix}.quantity`] = "La quantité doit être un entier positif.";
  }
  if (
    !isNonNegativeInteger(item?.unit_price_cents) ||
    !isNonNegativeInteger(item?.base_price_cents) ||
    (item?.price_cents !== undefined && !isNonNegativeInteger(item.price_cents))
  ) {
    errors[`${prefix}.price`] = "Les données de prix de cet article sont invalides.";
  }
  if (
    !hasText(item?.purchase_mode?.id) ||
    !isPositiveInteger(item.purchase_mode.quantity) ||
    !isNonNegativeInteger(item.purchase_mode.price_cents)
  ) {
    errors[`${prefix}.purchase_mode`] = "Le format de cet article est invalide.";
  }

  const needsSelection =
    item?.product_type === "single_choice" ||
    (item?.product_type === "single_choice_bundle" &&
      item.purchase_mode?.allocation_type === "single_choice");
  if (needsSelection && !hasText(item?.selection?.choice_id)) {
    errors[`${prefix}.selection`] = "Choisissez une option pour cet article.";
  }

  if (
    item?.product_type === "single_choice_bundle" &&
    item.purchase_mode?.allocation_type === "choice_allocation"
  ) {
    const allocationIsValid =
      Array.isArray(item.allocation) &&
      item.allocation.length > 0 &&
      item.allocation.every(
        (choice) => hasText(choice.choice_id) && isPositiveInteger(choice.quantity),
      ) &&
      item.allocation.reduce((sum, choice) => sum + choice.quantity, 0) ===
        item.purchase_mode.quantity;
    if (!allocationIsValid) {
      errors[`${prefix}.allocation`] = "La répartition de cet article est incomplète.";
    }
  }

  if (
    item?.product_type === "ingredient_customization" &&
    (!Array.isArray(item.ingredients) ||
      item.ingredients.some(
        (ingredient) =>
          !hasText(ingredient.id) ||
          !Number.isInteger(ingredient.quantity) ||
          ingredient.quantity < 0 ||
          !isNonNegativeInteger(ingredient.extra_price_cents),
      ))
  ) {
    errors[`${prefix}.ingredients`] = "La configuration des ingrédients est invalide.";
  }
}

function validateQuoteItem(
  item: QuoteItem,
  index: number,
  requestedServices: string[],
  errors: ValidationErrors,
) {
  const prefix = `items.${index}`;
  if (!hasText(item?.offering_id)) {
    errors[`${prefix}.offering_id`] = "La référence du modèle ou du produit est invalide.";
  }
  if (!hasText(item?.name)) {
    errors[`${prefix}.name`] = "Le nom du modèle ou du produit est requis.";
  }
  if (!isPositiveInteger(item?.requested_quantity)) {
    errors[`${prefix}.requested_quantity`] = "La quantité demandée doit être un entier positif.";
  }
  if (
    !item?.configuration ||
    typeof item.configuration !== "object" ||
    Array.isArray(item.configuration)
  ) {
    errors[`${prefix}.configuration`] = "La configuration transmise est invalide.";
  }
  if (
    item?.configuration?.category === "decoration" &&
    (typeof item.configuration.catalog_slug !== "string" ||
      !item.configuration.catalog_slug.trim())
  ) {
    errors[`${prefix}.configuration`] = "La référence de décoration est invalide.";
  }
  if (
    item?.configuration?.category === "decoration" &&
    !requestedServices?.includes("decoration")
  ) {
    errors[`${prefix}.configuration`] = "La décoration ne correspond pas aux services demandés.";
  }
  if (item?.configuration?.category === "tasting" && !requestedServices?.includes("traiteur")) {
    errors[`${prefix}.configuration`] = "L’item traiteur ne correspond pas aux services demandés.";
  }
  if (item?.note !== null && typeof item?.note !== "string") {
    errors[`${prefix}.note`] = "La note de cet item est invalide.";
  }
}

const servicesForRequestType = {
  traiteur: ["traiteur"],
  decoration: ["decoration"],
  organisation: ["organisation"],
  "decoration-organisation": ["decoration", "organisation"],
  "traiteur-decoration-organisation": ["traiteur", "decoration", "organisation"],
};

function isValidIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;
  return Number(match[1]) <= 23 && Number(match[2]) <= 59;
}

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && Boolean(value.trim());
}

function hasErrors(errors: ValidationErrors) {
  return Object.keys(errors).length > 0;
}

function valid<T>(value: T): ValidationResult<T> {
  return { valid: true, value, errors: {} };
}

function invalid<T>(errors: ValidationErrors): ValidationResult<T> {
  return { valid: false, value: null, errors };
}
