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
import {
  completeCustomerOrderRequest,
  prepareCustomerOrderRequest,
} from "./customerOrderRequest";
import { completeQuoteRequest, prepareQuoteRequest } from "./quoteRequest";

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

export async function createCustomerOrder(order: CustomerOrder) {
  const result = validateCustomerOrder(order);
  if (!result.valid) throw new CommercialValidationError(result.errors);

  const payload = await prepareCustomerOrderRequest(result.value);
  const receptionId = await getGateway().receiveCustomerOrder(payload);
  completeCustomerOrderRequest(payload.request_id);
  return receptionId;
}

export function submitQuoteRequest(payload: QuoteRequest) {
  const result = validateQuoteRequest(payload);
  if (!result.valid) throw new CommercialValidationError(result.errors);
  return prepareQuoteRequest(result.value).then(async (request) => {
    const receptionId = await getGateway().submitQuoteRequest(request);
    completeQuoteRequest(request.request_id);
    return receptionId;
  });
}
