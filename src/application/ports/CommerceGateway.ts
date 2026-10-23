import type { CatalogCategory, CatalogProduct } from "../../domain/catalog";
import type { QuoteRequest } from "../../domain/commercialValidation";
import type { ReceiveCustomerOrderPayload } from "../../domain/customerOrderReception";

export type { CustomerOrder, QuoteRequest } from "../../domain/commercialValidation";

export interface CommerceGateway {
  fetchCatalogProducts(category?: CatalogCategory): Promise<CatalogProduct[]>;
  receiveCustomerOrder(payload: ReceiveCustomerOrderPayload): Promise<string>;
  submitQuoteRequest(payload: QuoteRequest): Promise<unknown>;
}
