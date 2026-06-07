import type { ProductType, PurchaseMode } from "./catalog";

export type CartSelection = {
  choice_id: string;
  choice_name: string;
  group_label: string;
};

export type CartAllocation = {
  choice_id: string;
  choice_name: string;
  quantity: number;
};

export type CartIngredient = {
  id: string;
  name: string;
  quantity: number;
  extra_price_cents: number;
};

export type CartItem = {
  key: string;
  product_id: string;
  bom_id: string;
  name: string;
  product_type: ProductType;
  base_price_cents: number;
  price_cents?: number;
  unit_price_cents: number;
  purchase_mode: PurchaseMode | null;
  selection: CartSelection | null;
  allocation: CartAllocation[];
  ingredients: CartIngredient[];
  quantity: number;
  image_url: string;
};
