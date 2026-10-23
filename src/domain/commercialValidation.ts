import { AsYouType, parsePhoneNumberFromString } from "libphonenumber-js";
import type { CartItem } from "./cart";
import { getRequestedServices, shouldRequestGuestCount } from "./quote";

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
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const maximumItemQuantity = 1000;
const maximumEstimatedPriceCents = 100_000_000;
const maximumEstimatedTotalCents = 2_147_483_647;

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
  else if (name.length > 200) errors[`${prefix}.name`] = "Le nom est trop long.";

  const phone = normalizePhone(phoneInput);
  if (!phoneInput) {
    errors[`${prefix}.phone`] = "Le numéro de téléphone est requis.";
  } else if (!phone) {
    errors[`${prefix}.phone`] = canadianPhoneMessage;
  } else if (phone.length > 50) {
    errors[`${prefix}.phone`] = "Le numéro de téléphone est trop long.";
  }

  if (email.length > 254) {
    errors[`${prefix}.email`] = "Le courriel est trop long.";
  } else if (email && !emailPattern.test(email)) {
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
    errors.items = "La sélection doit contenir au moins un article.";
  } else if (order.items.length > 100) {
    errors.items = "La sélection ne peut pas contenir plus de 100 articles distincts.";
  } else {
    order.items.forEach((item, index) => validateCartItem(item, index, errors));
  }

  if (
    !isNonNegativeInteger(order?.totalCents) ||
    order.totalCents > maximumEstimatedTotalCents
  ) {
    errors.totalCents = "Le total de la commande est invalide.";
  } else if (
    Array.isArray(order?.items) &&
    order.items.every(
      (item) =>
        isPositiveInteger(item?.quantity) && isNonNegativeInteger(item?.unit_price_cents),
    ) &&
    order.items.reduce((sum, item) => sum + item.quantity * item.unit_price_cents, 0) !==
      order.totalCents
  ) {
    errors.totalCents = "Le total estimé ne correspond pas aux articles de la sélection.";
  }

  if ((order?.customer?.note?.length ?? 0) > 2000) {
    errors["customer.note"] = "La note ne peut pas dépasser 2 000 caractères.";
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
    const expectedServices = getRequestedServices(event.request_type);
    if (!expectedServices.length) {
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

  if (hasErrors(errors) || !customerResult.valid) return invalid(errors);

  return valid({
    ...request,
    customer: customerResult.value,
    event_details: {
      ...event,
      request_type: event.request_type.trim(),
      event_type: event.event_type.trim(),
      event_address: event.event_address.trim(),
      guest_count: shouldRequestGuestCount(event.request_type) ? event.guest_count : null,
      budget: event.budget.trim(),
      allergies: getRequestedServices(event.request_type).includes("traiteur")
        ? event.allergies
        : null,
    },
  });
}

function validateCartItem(item: CartItem, index: number, errors: ValidationErrors) {
  const prefix = `items.${index}`;

  if (
    !hasText(item?.product_id) ||
    !uuidPattern.test(item.product_id) ||
    !hasText(item?.bom_id) ||
    !hasText(item?.name) ||
    item.name.trim().length > 300
  ) {
    errors[prefix] = "Un article de la sélection est incomplet.";
  }
  if (!isPositiveInteger(item?.quantity) || item.quantity > maximumItemQuantity) {
    errors[`${prefix}.quantity`] = `La quantité doit être un entier entre 1 et ${maximumItemQuantity}.`;
  }
  if (item?.category !== "tasting") {
    errors[`${prefix}.category`] = "La commande directe est réservée aux produits Dégustation.";
  }
  if (
    !isNonNegativeInteger(item?.unit_price_cents) ||
    item.unit_price_cents > maximumEstimatedPriceCents ||
    !isNonNegativeInteger(item?.base_price_cents) ||
    item.base_price_cents > maximumEstimatedPriceCents ||
    (item?.price_cents !== undefined && !isNonNegativeInteger(item.price_cents))
  ) {
    errors[`${prefix}.price`] = "Les données de prix de cet article sont invalides.";
  }
  if (
    !hasText(item?.purchase_mode?.id) ||
    !isPositiveInteger(item.purchase_mode.quantity) ||
    item.purchase_mode.quantity > maximumItemQuantity ||
    !isNonNegativeInteger(item.purchase_mode.price_cents) ||
    item.purchase_mode.price_cents > maximumEstimatedPriceCents
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
      item.allocation.length <= 100 &&
      item.allocation.length > 0 &&
      item.allocation.every(
        (choice) =>
          hasText(choice.choice_id) &&
          isPositiveInteger(choice.quantity) &&
          choice.quantity <= maximumItemQuantity,
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
      item.ingredients.length > 100 ||
      item.ingredients.some(
        (ingredient) =>
          !hasText(ingredient.id) ||
          !Number.isInteger(ingredient.quantity) ||
          ingredient.quantity < 0 ||
          ingredient.quantity > maximumItemQuantity ||
          !isNonNegativeInteger(ingredient.default_quantity) ||
          ingredient.default_quantity > maximumItemQuantity ||
          !isNonNegativeInteger(ingredient.extra_price_cents) ||
          ingredient.extra_price_cents > maximumEstimatedPriceCents,
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
  if (!isPositiveInteger(item?.requested_quantity) || item.requested_quantity > maximumItemQuantity) {
    errors[`${prefix}.requested_quantity`] = `La quantité demandée doit être un entier entre 1 et ${maximumItemQuantity}.`;
  }
  if (
    !item?.configuration ||
    typeof item.configuration !== "object" ||
    Array.isArray(item.configuration)
  ) {
    errors[`${prefix}.configuration`] = "La configuration transmise est invalide.";
  } else if (
    item.configuration.category !== "decoration" &&
    item.configuration.category !== "tasting"
  ) {
    errors[`${prefix}.configuration`] = "La catégorie catalogue transmise est invalide.";
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
  } else if ((item?.note?.length ?? 0) > 2000) {
    errors[`${prefix}.note`] = "La note de cet item est trop longue.";
  }
}

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
