import type {
  CommerceGateway,
  CustomerOrder,
  QuoteRequest,
} from "../../application/ports/CommerceGateway";
import type { CatalogCategory } from "../../domain/catalog";
import { fallbackCatalog } from "./fallbackCatalog";

export class LocalCommerceGateway implements CommerceGateway {
  async fetchCatalogProducts(category?: CatalogCategory) {
    return category ? fallbackCatalog.filter((product) => product.category === category) : fallbackCatalog;
  }

  async createCustomerOrder(order: CustomerOrder) {
    console.info("[SAVIS] Backend non configuré. Commande simulée.", order);
    return { id: `local-${Date.now()}` };
  }

  async submitQuoteRequest(payload: QuoteRequest) {
    console.info("[SAVIS] Backend non configuré. Soumission simulée.", payload);
    return { id: `local-quote-${Date.now()}` };
  }
}
