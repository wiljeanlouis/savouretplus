import type {
  CartAllocation,
  CartIngredient,
  CartSelection,
} from "./cart";
import type { CatalogCategory, ProductType } from "./catalog";

export type ReceivedPurchaseMode = {
  id: string;
  label: string;
  quantity: number;
  allocation_type: "none" | "single_choice" | "choice_allocation";
};

export type ReceivedCustomerOrderItem = {
  key: string;
  product_id: string;
  name: string;
  category: CatalogCategory;
  product_type: ProductType;
  image_url: string;
  quantity: number;
  base_price_cents: number;
  unit_price_cents: number;
  purchase_mode: ReceivedPurchaseMode | null;
  selection: CartSelection | null;
  allocation: CartAllocation[];
  ingredients: CartIngredient[];
};

export type ReceiveCustomerOrderPayload = {
  request_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  note: string | null;
  total_cents: number;
  items: ReceivedCustomerOrderItem[];
};

export type CustomerOrderReceptionErrorKind =
  | "validation"
  | "idempotency"
  | "network"
  | "technical";

export class CustomerOrderReceptionError extends Error {
  readonly kind: CustomerOrderReceptionErrorKind;
  readonly code: string | null;

  constructor(kind: CustomerOrderReceptionErrorKind, code: string | null = null) {
    super("La demande de commande n’a pas pu être reçue.");
    this.name = "CustomerOrderReceptionError";
    this.kind = kind;
    this.code = code;
  }
}
