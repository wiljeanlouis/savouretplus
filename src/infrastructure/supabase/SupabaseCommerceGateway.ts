import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  CommerceGateway,
  QuoteRequest,
} from "../../application/ports/CommerceGateway";
import type {
  CatalogCategory,
  CatalogProduct,
  ChoiceGroup,
  ProductSubcategory,
  IngredientOption,
  ProductType,
  PurchaseMode,
} from "../../domain/catalog";
import {
  CustomerOrderReceptionError,
  type ReceiveCustomerOrderPayload,
} from "../../domain/customerOrderReception";

const receptionValidationErrors = new Set([
  "ORDER_INVALID_PAYLOAD",
  "ORDER_INVALID_REQUEST_ID",
  "ORDER_INVALID_PRODUCT_ID",
  "ORDER_INVALID_CATEGORY_OR_TYPE",
  "ORDER_INVALID_CONFIGURATION",
  "ORDER_LIMIT_EXCEEDED",
  "ORDER_ESTIMATE_MISMATCH",
]);
const maximumReceptionAttempts = 3;

type SupabaseCatalogProduct = Partial<CatalogProduct> & {
  bom_id?: string;
  category?: string;
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

  async fetchCatalogProducts(category?: CatalogCategory): Promise<CatalogProduct[]> {
    let query = this.client
      .from("published_catalog_products")
      .select("*")
      .eq("is_available", true)
      .order("display_order", { ascending: true });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error("Impossible de charger le catalogue publié.");
    }

    const products = data?.map(normalizeCatalogProduct).filter(isCatalogProduct) ?? [];

    return products;
  }

  async receiveCustomerOrder(payload: ReceiveCustomerOrderPayload): Promise<string> {
    for (let attempt = 0; attempt < maximumReceptionAttempts; attempt += 1) {
      try {
        const { data, error, status } = await this.client.rpc("receive_customer_order", {
          payload,
        });

        if (!error) {
          if (typeof data !== "string") {
            throw new CustomerOrderReceptionError("technical");
          }
          return data;
        }

        const mappedError = mapReceptionError(error);
        if (
          (mappedError.kind === "network" || status >= 500) &&
          attempt < maximumReceptionAttempts - 1
        ) {
          await waitBeforeRetry(attempt);
          continue;
        }
        throw status >= 500
          ? new CustomerOrderReceptionError("network", error.code || null)
          : mappedError;
      } catch (error) {
        if (error instanceof CustomerOrderReceptionError) throw error;
        if (attempt < maximumReceptionAttempts - 1) {
          await waitBeforeRetry(attempt);
          continue;
        }
        throw new CustomerOrderReceptionError("network");
      }
    }

    throw new CustomerOrderReceptionError("network");
  }

  async submitQuoteRequest(payload: QuoteRequest) {
    const { data, error } = await this.client.rpc("submit_quote_request", {
      payload,
    });

    if (error) throw error;
    return data;
  }
}

function mapReceptionError(error: { code?: string; message?: string }) {
  const code = error.code || null;
  const message = error.message || "";

  if (code === "23505" && message === "ORDER_IDEMPOTENCY_CONFLICT") {
    return new CustomerOrderReceptionError("idempotency", code);
  }
  if (code === "22023" && receptionValidationErrors.has(message)) {
    return new CustomerOrderReceptionError("validation", code);
  }
  if (!code) return new CustomerOrderReceptionError("network");
  return new CustomerOrderReceptionError("technical", code);
}

function waitBeforeRetry(attempt: number) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, 250 * 2 ** attempt));
}

function normalizeCatalogProduct(product: SupabaseCatalogProduct): CatalogProduct | null {
  const purchaseModes = normalizePurchaseModes(product);
  const category = normalizeCategory(product.category);
  if (category === "tasting" && !purchaseModes.length) return null;
  if (!product.id || !product.slug || !product.name) return null;

  const imageUrl = product.image_url || "./images/home/offer-1-340x243.png";

  return {
    id: product.id,
    bom_id: product.bom_id || product.id,
    slug: product.slug,
    name: product.name,
    category,
    subcategory: normalizeProductSubcategory(product.subcategory),
    description: product.description || "",
    product_type: product.product_type || inferProductType(product),
    purchase_modes: purchaseModes,
    choice_group: normalizeChoiceGroup(product.choice_group),
    ingredient_options: normalizeIngredientOptions(product.ingredient_options),
    image_url: imageUrl,
    gallery: product.gallery?.length ? product.gallery : [imageUrl],
    availability_note: product.availability_note || "Disponible sur commande",
  };
}

function normalizeProductSubcategory(
  subcategory?: ProductSubcategory | null,
): ProductSubcategory | null {
  if (
    subcategory === "balloon-arch" ||
    subcategory === "centerpiece" ||
    subcategory === "birthday" ||
    subcategory === "wedding"
  ) {
    return subcategory;
  }

  return null;
}

function normalizeCategory(category?: string): CatalogCategory {
  if (category === "decoration") return "decoration";
  if (category === "tasting") return "tasting";
  return "tasting";
}

function isCatalogProduct(product: CatalogProduct | null): product is CatalogProduct {
  return product !== null;
}

function inferProductType(product: SupabaseCatalogProduct): ProductType {
  if (product.purchase_modes?.length) return "single_choice_bundle";
  if (product.ingredient_options?.length) return "ingredient_customization";
  if (product.choice_group) return "single_choice";
  return "standard";
}

function normalizePurchaseModes(product: SupabaseCatalogProduct): PurchaseMode[] {
  return (product.purchase_modes || [])
    .map((mode) => ({
      id: mode.id,
      label: mode.label,
      quantity: Number(mode.quantity ?? 1),
      price_cents: Number(mode.price_cents ?? 0),
      allocation_type: mode.allocation_type || "single_choice",
    }))
    .filter((mode) => mode.id && mode.label && Number.isFinite(mode.price_cents));
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
