import type {
  CommerceGateway,
  CustomerOrder,
  QuoteRequest,
} from "./ports/CommerceGateway";

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

export function fetchCatalogProducts() {
  return getGateway().fetchCatalogProducts();
}

export function createCustomerOrder(order: CustomerOrder) {
  return getGateway().createCustomerOrder(order);
}

export function submitQuoteRequest(payload: QuoteRequest) {
  return getGateway().submitQuoteRequest(payload);
}
