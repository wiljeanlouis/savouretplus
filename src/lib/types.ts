export type ProductType = "standard" | "single_choice" | "single_choice_bundle" | "ingredient_customization";

export type ChoiceOption = {
  id: string;
  name: string;
};

export type ChoiceGroup = {
  label: string;
  required: boolean;
  options: ChoiceOption[];
};

export type PurchaseMode = {
  id: string;
  label: string;
  quantity: number;
  price_cents: number;
  allocation_type: "single_choice" | "choice_allocation";
};

export type IngredientOption = {
  id: string;
  name: string;
  default_quantity: number;
  min_quantity: number;
  max_quantity: number;
  extra_price_cents: number;
};

export type CatalogProduct = {
  id: string;
  bom_id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  product_type: ProductType;
  purchase_modes: PurchaseMode[];
  choice_group: ChoiceGroup | null;
  ingredient_options: IngredientOption[];
  unit_label: string;
  price_cents: number;
  dozen_price_cents?: number | null;
  image_url: string;
  gallery: string[];
  availability_note: string;
};

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

export type AddToCartOptions = {
  quantity?: number;
  unitPriceCents?: number;
  purchaseMode?: PurchaseMode | null;
  selection?: CartSelection | null;
  allocation?: CartAllocation[];
  ingredients?: CartIngredient[];
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

export type QuoteItemDraft = {
  offering_id: string;
  name: string;
  requested_quantity: number | string;
  configuration: Record<string, unknown>;
  note: string;
};
