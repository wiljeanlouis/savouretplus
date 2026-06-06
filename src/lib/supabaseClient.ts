import { createClient } from "@supabase/supabase-js";
import { fallbackCatalog } from "../data/fallbackCatalog";
import type { CatalogProduct, ChoiceGroup, IngredientOption, PurchaseMode, ProductType } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

type SupabaseCatalogProduct = Partial<CatalogProduct> & {
  purchase_modes?: Partial<PurchaseMode>[];
  choice_group?: Partial<ChoiceGroup> & { options?: ChoiceGroup["options"] };
  ingredient_options?: Partial<IngredientOption>[];
};

type QuotePayload = Record<string, unknown>;

export async function fetchCatalogProducts(): Promise<CatalogProduct[]> {
  if (!supabase) return fallbackCatalog;

  const { data, error } = await supabase
    .from("public_catalog_products")
    .select("*")
    .eq("is_available", true)
    .order("display_order", { ascending: true });

  if (error) {
    console.warn("[SAVIS] Impossible de charger le catalogue Supabase.", error);
    return fallbackCatalog;
  }

  return data?.length ? data.map(normalizeCatalogProduct) : fallbackCatalog;
}

export async function createCustomerOrder(order: any) {
  if (!supabase) {
    console.info("[SAVIS] Supabase non configuré. Commande simulée.", order);
    return { id: `local-${Date.now()}` };
  }

  const { data, error } = await supabase
    .from("customer_orders")
    .insert({
      customer_name: order.customer.name,
      customer_phone: order.customer.phone,
      customer_email: order.customer.email || null,
      note: order.customer.note || null,
      status: "new",
      source: "savouretplus",
      total_cents: order.totalCents,
      items: order.items,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export async function submitQuoteRequest(payload: QuotePayload) {
  if (!supabase) {
    console.info("[SAVIS] Supabase non configuré. Soumission simulée.", payload);
    return { id: `local-quote-${Date.now()}` };
  }

  const { data, error } = await supabase.rpc("submit_quote_request", {
    payload,
  });

  if (error) throw error;
  return data;
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
    price_cents: product.price_cents || 0,
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

function normalizeChoiceGroup(choiceGroup?: SupabaseCatalogProduct["choice_group"]): ChoiceGroup | null {
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

function normalizeIngredientOptions(ingredientOptions?: SupabaseCatalogProduct["ingredient_options"]): IngredientOption[] {
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
