import type { CartItem } from "../../domain/cart";
import type { CatalogProduct } from "../../domain/catalog";

export type CustomerOrder = {
  customer: {
    name: string;
    phone: string;
    email?: string;
    note?: string;
  };
  items: CartItem[];
  totalCents: number;
};

export type QuoteRequest = Record<string, unknown>;

export interface CommerceGateway {
  fetchCatalogProducts(): Promise<CatalogProduct[]>;
  createCustomerOrder(order: CustomerOrder): Promise<unknown>;
  submitQuoteRequest(payload: QuoteRequest): Promise<unknown>;
}
