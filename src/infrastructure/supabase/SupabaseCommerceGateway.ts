import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  CommerceGateway,
  CustomerOrder,
  QuoteRequest,
} from "../../application/ports/CommerceGateway";
import { fallbackCatalog } from "../local/fallbackCatalog";
import type {
  CatalogProduct,
  ChoiceGroup,
  IngredientOption,
  ProductType,
  PurchaseMode,
} from "../../domain/catalog";

type SupabaseCatalogProduct = Partial<CatalogProduct> & {
  purchase_modes?: Partial<PurchaseMode>[];
  choice_group?: Partial<ChoiceGroup> & { options?: ChoiceGroup["options"] };
  ingredient_options?: Partial<IngredientOption>[];
};

export class SupabaseCommerceGateway implements CommerceGateway {
  private readonly client: SupabaseClient;

  constructor(url: string, anonKey: string) {
    this.client = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  async fetchCatalogProducts(): Promise<CatalogProduct[]> {
    const { data, error } = await this.client
      .from("published_catalog_products")
      .select("*")
      .eq("is_available", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.warn("[SAVIS] Impossible de charger le catalogue Supabase.", error);
      return fallbackCatalog;
    }

    return data?.length ? data.map(normalizeCatalogProduct) : fallbackCatalog;
  }

  async createCustomerOrder(order: CustomerOrder) {
    const { error } = await this.client.from("customer_orders").insert({
      customer_name: order.customer.name,
      customer_phone: order.customer.phone,
      customer_email: order.customer.email || null,
      note: order.customer.note || null,
      status: "new",
      source: "savouretplus",
      total_cents: order.totalCents,
      items: order.items,
    });

    if (error) throw error;
    return { accepted: true };
  }

  async submitQuoteRequest(payload: QuoteRequest) {
    const { data, error } = await this.client.rpc("submit_quote_request", {
      payload,
    });

    if (error) throw error;
    return data;
  }
}

function normalizeCatalogProduct(product: SupabaseCatalogProduct): CatalogProduct {
  return {
    id: product.id,
    bom_id: product.bom_id,
    slug: product.slug,
    name: product.name,
    category: product.category || "degustation",
    description: product.description || "",
    product_type: product.product_type || inferProductType(product),
    purchase_modes: normalizePurchaseModes(product),
    choice_group: normalizeChoiceGroup(product.choice_group),
    ingredient_options: normalizeIngredientOptions(product.ingredient_options),
    unit_label: product.unit_label || "unité",
    price_cents: Number(product.price_cents ?? 0),
    dozen_price_cents: product.dozen_price_cents,
    image_url: product.image_url || "./images/offer-1-340x243.png",
    gallery: product.gallery?.length ? product.gallery : [product.image_url],
    availability_note: product.availability_note || "Disponible sur commande",
  };
}

function inferProductType(product: SupabaseCatalogProduct): ProductType {
  if (product.purchase_modes?.length) return "single_choice_bundle";
  if (product.ingredient_options?.length) return "ingredient_customization";
  if (product.choice_group) return "single_choice";
  return "standard";
}

function normalizePurchaseModes(product: SupabaseCatalogProduct): PurchaseMode[] {
  if (product.purchase_modes?.length) {
    return product.purchase_modes.map((mode) => ({
      id: mode.id,
      label: mode.label,
      quantity: Number(mode.quantity ?? 1),
      price_cents: Number(mode.price_cents ?? product.price_cents ?? 0),
      allocation_type: mode.allocation_type || "single_choice",
    }));
  }

  if (product.dozen_price_cents) {
    return [
      {
        id: "unit",
        label: "À l'unité",
        quantity: 1,
        price_cents: Number(product.price_cents ?? 0),
        allocation_type: "single_choice",
      },
      {
        id: "dozen",
        label: "Douzaine",
        quantity: 12,
        price_cents: Number(product.dozen_price_cents),
        allocation_type: "choice_allocation",
      },
    ];
  }

  return [];
}

function normalizeChoiceGroup(
  choiceGroup?: SupabaseCatalogProduct["choice_group"],
): ChoiceGroup | null {
  if (!choiceGroup?.options?.length) return null;

  return {
    label: choiceGroup.label || "Option",
    required: choiceGroup.required !== false,
    options: choiceGroup.options.map((option) => ({
      id: option.id,
      name: option.name,
    })),
  };
}

function normalizeIngredientOptions(
  ingredientOptions?: SupabaseCatalogProduct["ingredient_options"],
): IngredientOption[] {
  if (!ingredientOptions?.length) return [];

  return ingredientOptions.map((ingredient) => ({
    id: ingredient.id,
    name: ingredient.name,
    default_quantity: Number(ingredient.default_quantity ?? 1),
    min_quantity: Number(ingredient.min_quantity ?? 0),
    max_quantity: Number(ingredient.max_quantity ?? 3),
    extra_price_cents: Number(ingredient.extra_price_cents ?? 0),
  }));
}
