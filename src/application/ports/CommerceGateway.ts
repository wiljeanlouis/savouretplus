import type { CatalogCategory, CatalogProduct } from "../../domain/catalog";
import type { ReceiveCustomerOrderPayload } from "../../domain/customerOrderReception";
import type { ReceiveQuoteRequestPayload } from "../../domain/quoteReception";

export type { CustomerOrder, QuoteRequest } from "../../domain/commercialValidation";

export interface CommerceGateway {
  fetchCatalogProducts(category?: CatalogCategory): Promise<CatalogProduct[]>;
  receiveCustomerOrder(payload: ReceiveCustomerOrderPayload): Promise<string>;
  submitQuoteRequest(payload: ReceiveQuoteRequestPayload): Promise<string>;
}
