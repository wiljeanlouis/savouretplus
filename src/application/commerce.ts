import type {
  CommerceGateway,
  CustomerOrder,
  QuoteRequest,
} from "./ports/CommerceGateway";
import type { CatalogCategory } from "../domain/catalog";
import {
  CommercialValidationError,
  validateCustomerOrder,
  validateQuoteRequest,
} from "../domain/commercialValidation";

let gateway: CommerceGateway | null = null;

export function configureCommerceGateway(nextGateway: CommerceGateway) {
  gateway = nextGateway;
}

function getGateway(): CommerceGateway {
  if (!gateway) {
    throw new Error("CommerceGateway must be configured before use.");
  }

  return gateway;
}

export function fetchCatalogProducts(category?: CatalogCategory) {
  return getGateway().fetchCatalogProducts(category);
}

export function createCustomerOrder(order: CustomerOrder) {
  const result = validateCustomerOrder(order);
  if (!result.valid) throw new CommercialValidationError(result.errors);
  return getGateway().createCustomerOrder(result.value);
}

export function submitQuoteRequest(payload: QuoteRequest) {
  const result = validateQuoteRequest(payload);
  if (!result.valid) throw new CommercialValidationError(result.errors);
  return getGateway().submitQuoteRequest(result.value);
}
