import type {
  CommerceGateway,
  QuoteRequest,
} from "../../application/ports/CommerceGateway";
import type { CatalogCategory } from "../../domain/catalog";
import {
  CustomerOrderReceptionError,
  type ReceiveCustomerOrderPayload,
} from "../../domain/customerOrderReception";
import { fallbackCatalog } from "./fallbackCatalog";

export class LocalCommerceGateway implements CommerceGateway {
  constructor(private readonly exposeFallbackCatalog = true) {}

  async fetchCatalogProducts(category?: CatalogCategory) {
    if (!this.exposeFallbackCatalog) return [];
    return category ? fallbackCatalog.filter((product) => product.category === category) : fallbackCatalog;
  }

  async receiveCustomerOrder(_payload: ReceiveCustomerOrderPayload): Promise<string> {
    throw new CustomerOrderReceptionError("technical");
  }

  async submitQuoteRequest(_payload: QuoteRequest) {
    throw new Error("Le service de soumission n’est pas configuré.");
  }
}
