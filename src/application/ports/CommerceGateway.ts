import type { CatalogCategory, CatalogProduct } from "../../domain/catalog";
import type { CustomerOrder, QuoteRequest } from "../../domain/commercialValidation";

export type { CustomerOrder, QuoteRequest } from "../../domain/commercialValidation";

export interface CommerceGateway {
  fetchCatalogProducts(category?: CatalogCategory): Promise<CatalogProduct[]>;
  createCustomerOrder(order: CustomerOrder): Promise<unknown>;
  submitQuoteRequest(payload: QuoteRequest): Promise<unknown>;
}
