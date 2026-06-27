import { ChevronLeft, ChevronRight, ClipboardList, Minus, Plus, Settings2, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BreadcrumbHero } from "./BreadcrumbHero";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { fetchCatalogProducts } from "../application/commerce";
import { formatCurrency } from "../shared/format";

const cateringHighlights = [
  {
    label: "Plateaux à partager",
    image: "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=900&h=700&q=80",
  },
  {
    label: "Service pour évènements",
    image: "./images/offer-2-340x243.png",
  },
  {
    label: "Tables de réception",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&h=700&q=80",
  },
];

export function CatalogPage({ cart, onCartOpen }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  function addConfiguredProduct(product, options) {
    cart.add(product, options);
    setSelectedProduct(null);
    onCartOpen();
  }

  useEffect(() => {
    let mounted = true;
    fetchCatalogProducts()
      .then((data) => {
        if (mounted) setProducts(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <BreadcrumbHero
        title="Dégustation"
        image="./images/breadcrumbs-bg-pates.png"
        subtitle="Passez votre commande pour déguster nos spécialités ou demandez une soumission pour service traiteur."
      />
      <section className="py-20">
        <div className="container-page">
          <div className="mb-10 grid gap-6 rounded-3xl border border-rose-100 bg-white p-5 shadow-sm lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:p-6">
            <div className="max-w-xl">
              <p className="eyebrow">Événement</p>
              <h2 className="mt-2 font-serif text-4xl font-extrabold tracking-tight text-zinc-950">
                Besoin d'un service traiteur?
              </h2>
              <p className="mt-4 text-base leading-7 text-zinc-600">
                Découvrez quelques présentations possibles, puis envoyez les détails de votre activité pour recevoir une
                soumission adaptée à votre événement.
              </p>
              <Button asChild className="mt-6 w-full sm:w-auto">
                <a href="#/soumission?service=traiteur">
                  <ClipboardList className="h-4 w-4" />
                  Demander une soumission traiteur
                </a>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
              {cateringHighlights.map((highlight, index) => (
                <figure
                  className={`relative overflow-hidden rounded-2xl bg-zinc-100 ${
                    index === 0 ? "sm:row-span-2" : ""
                  }`}
                  key={highlight.label}
                >
                  <img
                    className={`${index === 0 ? "h-72 sm:h-full" : "h-36 sm:h-44"} w-full object-cover`}
                    src={highlight.image}
                    alt={highlight.label}
                  />
                  <figcaption className="absolute inset-x-3 bottom-3 rounded-xl bg-white/92 px-3 py-2 text-sm font-extrabold text-zinc-950 shadow-sm backdrop-blur">
                    {highlight.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-500">
              Chargement du catalogue...
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onCustomize={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <ProductConfigurator
        product={selectedProduct}
        open={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onAdd={addConfiguredProduct}
      />
    </>
  );
}

function ProductCard({ product, onCustomize }) {
  const [activeImage, setActiveImage] = useState(0);
  const gallery = product.gallery?.length ? product.gallery : [product.image_url];
  const currentImage = gallery[activeImage] || gallery[0];

  function showPreviousImage() {
    setActiveImage((current) => (current - 1 + gallery.length) % gallery.length);
  }

  function showNextImage() {
    setActiveImage((current) => (current + 1) % gallery.length);
  }

  return (
    <Card className="group overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-xl">
      <div className="flex h-full flex-col">
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50 p-4">
          <div className="grid aspect-[5/3] place-items-center rounded-xl bg-white/70 p-3">
            <img
              className="h-full w-full object-contain drop-shadow-sm transition duration-500 group-hover:scale-[1.03]"
              src={currentImage}
              alt={product.name}
            />
          </div>
          {gallery.length > 1 ? (
            <>
              <button
                className="absolute left-6 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-zinc-700 shadow-sm transition hover:bg-white hover:text-rose-700"
                type="button"
                onClick={showPreviousImage}
                aria-label="Image précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className="absolute right-6 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-zinc-700 shadow-sm transition hover:bg-white hover:text-rose-700"
                type="button"
                onClick={showNextImage}
                aria-label="Image suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : null}
          <div className="absolute left-6 top-6 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-rose-700 shadow-sm">
            {product.availability_note}
          </div>
          {gallery.length > 1 ? (
            <div className="mt-3 flex items-center justify-center gap-2">
              {gallery.map((image, index) => (
                <button
                  className={`h-2.5 rounded-full transition-all ${
                    activeImage === index ? "w-8 bg-rose-600" : "w-2.5 bg-zinc-300 hover:bg-zinc-400"
                  }`}
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Voir l'image ${index + 1}`}
                />
              ))}
            </div>
          ) : null}
        </div>
        <CardContent className="flex flex-1 flex-col p-5">
          <div>
            <h3 className="text-xl font-extrabold text-zinc-950">{product.name}</h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600">{product.description}</p>
            <ProductOptionSummary product={product} />
          </div>

          <div className="mt-auto pt-6">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <ProductPriceSummary product={product} />
            </div>

            <div className="mt-4">
              <Button
                className="w-full"
                type="button"
                disabled={!product.purchase_modes?.length}
                onClick={onCustomize}
              >
                <Settings2 className="h-4 w-4" />
                Commander
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

function ProductPriceSummary({ product }) {
  return product.purchase_modes.map((mode) => (
    <span className="inline-flex items-baseline gap-1" key={mode.id}>
      <span className="text-2xl font-extrabold text-zinc-950">{formatCurrency(mode.price_cents)}</span>
      <span className="text-sm font-semibold text-zinc-500">/ {mode.label.toLowerCase()}</span>
    </span>
  ));
}

function ProductOptionSummary({ product }) {
  if (
    (product.product_type === "single_choice" ||
      product.product_type === "single_choice_bundle") &&
    product.choice_group?.options?.length
  ) {
    return (
      <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-600">
        <p className="font-semibold text-zinc-900">{product.choice_group.label || "Options"}:</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {product.choice_group.options.map((option) => (
            <span
              className="rounded-full border border-rose-200 bg-white px-2.5 py-1 text-xs font-semibold text-rose-700"
              key={option.id}
            >
              {option.name}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (product.product_type === "ingredient_customization") {
    return (
      <div className="mt-4 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-600">
        <p className="font-semibold text-zinc-900">Inclus:</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {product.ingredient_options?.map((ingredient) => (
            <span
              className="rounded-full border border-rose-200 bg-white px-2.5 py-1 text-xs font-semibold text-rose-700"
              key={ingredient.id}
            >
              {ingredient.name}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

function ProductConfigurator({ product, open, onClose, onAdd }) {
  const [selectedPurchaseModeId, setSelectedPurchaseModeId] = useState("");
  const [selectedChoiceId, setSelectedChoiceId] = useState("");
  const [choiceAllocation, setChoiceAllocation] = useState({});
  const [ingredientQuantities, setIngredientQuantities] = useState({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;

    setSelectedPurchaseModeId(product.purchase_modes?.[0]?.id || "");
    setSelectedChoiceId(product.choice_group?.options?.[0]?.id || "");
    setChoiceAllocation(getDefaultChoiceAllocation(product));
    setIngredientQuantities(getDefaultIngredientQuantities(product));
    setQuantity(1);
  }, [product]);

  if (!product) return null;

  const selectedPurchaseMode =
    product.purchase_modes?.find((mode) => mode.id === selectedPurchaseModeId) || product.purchase_modes?.[0] || null;
  const selectedChoice = product.choice_group?.options?.find((option) => option.id === selectedChoiceId) || null;
  const configuredAllocation = getConfiguredAllocation(product, choiceAllocation);
  const allocationTotal = configuredAllocation.reduce((sum, choice) => sum + choice.quantity, 0);
  const configuredIngredients = getConfiguredIngredients(product, ingredientQuantities);
  const unitPriceCents = calculateUnitPrice(configuredIngredients, selectedPurchaseMode);
  const canAdd =
    Boolean(selectedPurchaseMode) &&
    (product.product_type === "single_choice_bundle"
      ? selectedPurchaseMode?.allocation_type === "choice_allocation"
        ? allocationTotal === selectedPurchaseMode.quantity
        : Boolean(selectedChoice)
      : product.product_type !== "single_choice" || Boolean(selectedChoice));

  function updateIngredientQuantity(ingredient, nextQuantity) {
    const boundedQuantity = Math.min(
      ingredient.max_quantity,
      Math.max(ingredient.min_quantity, Number(nextQuantity) || 0),
    );

    setIngredientQuantities((current) => ({
      ...current,
      [ingredient.id]: boundedQuantity,
    }));
  }

  function addToCart() {
    if (!canAdd) return;

    onAdd(product, {
      quantity,
      unitPriceCents,
      purchaseMode: selectedPurchaseMode
        ? {
            id: selectedPurchaseMode.id,
            label: selectedPurchaseMode.label,
            quantity: selectedPurchaseMode.quantity,
            price_cents: selectedPurchaseMode.price_cents,
            allocation_type: selectedPurchaseMode.allocation_type,
          }
        : null,
      selection: selectedChoice
        ? {
            choice_id: selectedChoice.id,
            choice_name: selectedChoice.name,
            group_label: product.choice_group?.label || "Option",
          }
        : null,
      allocation:
        product.product_type === "single_choice_bundle" &&
        selectedPurchaseMode?.allocation_type === "choice_allocation"
          ? configuredAllocation.filter((choice) => choice.quantity > 0)
          : [],
      ingredients: product.product_type === "ingredient_customization" ? configuredIngredients : [],
    });
  }

  function updateChoiceAllocation(choiceId, nextQuantity) {
    setChoiceAllocation((current) => ({
      ...current,
      [choiceId]: Math.max(0, Number(nextQuantity) || 0),
    }));
  }

  return (
    <aside className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        className={`absolute inset-0 bg-zinc-950/45 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        type="button"
        onClick={onClose}
        aria-label="Fermer"
      />
      <div
        className={`absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
          <div>
            <p className="eyebrow">Personnaliser</p>
            <h2 className="text-2xl font-extrabold text-zinc-950">{product.name}</h2>
          </div>
          <Button variant="ghost" size="icon" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-5">
          <img className="h-56 w-full rounded-2xl bg-rose-50 object-contain p-4" src={product.image_url} alt="" />

          {product.product_type === "single_choice_bundle" ? (
            <>
              <PurchaseModeSelector
                modes={product.purchase_modes}
                selectedModeId={selectedPurchaseModeId}
                onSelect={setSelectedPurchaseModeId}
              />
              {selectedPurchaseMode?.allocation_type === "single_choice" ? (
                <ChoiceGroup
                  group={product.choice_group}
                  selectedChoiceId={selectedChoiceId}
                  onSelect={setSelectedChoiceId}
                />
              ) : (
                <ChoiceAllocation
                  group={product.choice_group}
                  targetQuantity={selectedPurchaseMode?.quantity || 0}
                  allocation={choiceAllocation}
                  total={allocationTotal}
                  onChange={updateChoiceAllocation}
                />
              )}
            </>
          ) : null}

          {product.product_type === "single_choice" ? (
            <ChoiceGroup
              group={product.choice_group}
              selectedChoiceId={selectedChoiceId}
              onSelect={setSelectedChoiceId}
            />
          ) : null}

          {product.product_type === "ingredient_customization" ? (
            <IngredientCustomizer
              ingredients={product.ingredient_options}
              quantities={ingredientQuantities}
              onChange={updateIngredientQuantity}
            />
          ) : null}

          <div className="mt-6 rounded-2xl bg-zinc-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-zinc-600">Quantité</span>
              <QuantityStepper quantity={quantity} onChange={setQuantity} />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4">
              <span className="font-semibold text-zinc-600">Prix unitaire</span>
              <strong className="text-2xl text-zinc-950">{formatCurrency(unitPriceCents)}</strong>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200 p-6">
          <Button className="w-full" size="lg" type="button" disabled={!canAdd} onClick={addToCart}>
            <ShoppingBag className="h-5 w-5" />
            Ajouter au panier
          </Button>
        </div>
      </div>
    </aside>
  );
}

function PurchaseModeSelector({ modes, selectedModeId, onSelect }) {
  if (!modes?.length) return null;

  return (
    <div className="mt-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Format</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {modes.map((mode) => (
          <button
            className={`rounded-xl border p-3 text-left transition ${
              selectedModeId === mode.id
                ? "border-rose-600 bg-rose-50 text-rose-800"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-rose-300"
            }`}
            key={mode.id}
            type="button"
            onClick={() => onSelect(mode.id)}
          >
            <span className="block text-sm font-bold">{mode.label}</span>
            <span className="mt-1 block text-xs font-semibold">
              {mode.quantity} pâté{mode.quantity > 1 ? "s" : ""} · {formatCurrency(mode.price_cents)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChoiceGroup({ group, selectedChoiceId, onSelect }) {
  if (!group?.options?.length) return null;

  return (
    <div className="mt-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">{group.label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {group.options.map((option) => (
          <button
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
              selectedChoiceId === option.id
                ? "border-rose-600 bg-rose-600 text-white"
                : "border-zinc-200 bg-white text-zinc-700 hover:border-rose-300"
            }`}
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
          >
            {option.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function QuantityStepper({ quantity, onChange }) {
  return (
    <div className="inline-flex h-11 items-center rounded-md border border-zinc-200 bg-white">
      <button
        className="grid h-11 w-10 place-items-center text-zinc-500 hover:text-zinc-950"
        type="button"
        onClick={() => onChange(Math.max(1, Number(quantity) - 1))}
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        className="h-11 w-12 border-0 bg-transparent text-center font-bold outline-none"
        min="1"
        type="number"
        value={quantity}
        onChange={(event) => onChange(event.target.value)}
      />
      <button
        className="grid h-11 w-10 place-items-center text-zinc-500 hover:text-zinc-950"
        type="button"
        onClick={() => onChange(Number(quantity) + 1)}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function ChoiceAllocation({ group, targetQuantity, allocation, total, onChange }) {
  if (!group?.options?.length) return null;

  const remaining = targetQuantity - total;

  return (
    <div className="mt-4 grid gap-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">{group.label}</p>
          <p className={`mt-1 text-xs font-semibold ${remaining === 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {remaining === 0
              ? `${targetQuantity} pâtés répartis`
              : remaining > 0
                ? `${remaining} à répartir`
                : `${Math.abs(remaining)} en trop`}
          </p>
        </div>
      </div>
      {group.options.map((option) => {
        const quantity = allocation[option.id] || 0;

        return (
          <div className="rounded-xl border border-zinc-200 bg-white p-3" key={option.id}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-zinc-900">{option.name}</p>
              <div className="inline-flex h-9 items-center rounded-md border border-zinc-200 bg-zinc-50">
                <button
                  className="grid h-9 w-8 place-items-center text-zinc-500 hover:text-zinc-950"
                  type="button"
                  onClick={() => onChange(option.id, quantity - 1)}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-zinc-900">{quantity}</span>
                <button
                  className="grid h-9 w-8 place-items-center text-zinc-500 hover:text-zinc-950"
                  type="button"
                  onClick={() => onChange(option.id, quantity + 1)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function IngredientCustomizer({ ingredients, quantities, onChange }) {
  if (!ingredients?.length) return null;

  return (
    <div className="mt-4 grid gap-2">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">Ingrédients</p>
      {ingredients.map((ingredient) => {
        const quantity = quantities[ingredient.id] ?? ingredient.default_quantity;
        const extraCount = Math.max(0, quantity - ingredient.default_quantity);
        const isRemoved = quantity === 0;

        return (
          <div className="rounded-xl border border-zinc-200 bg-white p-3" key={ingredient.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-zinc-900">{ingredient.name}</p>
                <p className="text-xs font-semibold text-zinc-500">
                  {isRemoved
                    ? "Retiré"
                    : extraCount > 0
                      ? `+${extraCount} extra · +${formatCurrency(extraCount * ingredient.extra_price_cents)}`
                      : "Inclus"}
                </p>
              </div>
              <div className="inline-flex h-9 items-center rounded-md border border-zinc-200 bg-zinc-50">
                <button
                  className="grid h-9 w-8 place-items-center text-zinc-500 hover:text-zinc-950"
                  type="button"
                  onClick={() => onChange(ingredient, quantity - 1)}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-zinc-900">{quantity}</span>
                <button
                  className="grid h-9 w-8 place-items-center text-zinc-500 hover:text-zinc-950"
                  type="button"
                  onClick={() => onChange(ingredient, quantity + 1)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getDefaultIngredientQuantities(product) {
  return Object.fromEntries(
    (product.ingredient_options || []).map((ingredient) => [
      ingredient.id,
      ingredient.default_quantity,
    ]),
  );
}

function getDefaultChoiceAllocation(product) {
  const allocationMode = product.purchase_modes?.find((mode) => mode.allocation_type === "choice_allocation");
  const choices = product.choice_group?.options || [];

  if (!allocationMode || !choices.length) return {};

  const baseQuantity = Math.floor(allocationMode.quantity / choices.length);
  const remainder = allocationMode.quantity % choices.length;

  return Object.fromEntries(
    choices.map((choice, index) => [
      choice.id,
      baseQuantity + (index < remainder ? 1 : 0),
    ]),
  );
}

function getConfiguredAllocation(product, allocation) {
  return (product.choice_group?.options || []).map((choice) => ({
    choice_id: choice.id,
    choice_name: choice.name,
    quantity: allocation[choice.id] || 0,
  }));
}

function getConfiguredIngredients(product, quantities) {
  return (product.ingredient_options || []).map((ingredient) => ({
    id: ingredient.id,
    name: ingredient.name,
    quantity: quantities[ingredient.id] ?? ingredient.default_quantity,
    default_quantity: ingredient.default_quantity,
    extra_price_cents: ingredient.extra_price_cents,
  }));
}

function calculateUnitPrice(ingredients, purchaseMode) {
  const extrasTotal = ingredients.reduce((sum, ingredient) => {
    const extraCount = Math.max(0, ingredient.quantity - ingredient.default_quantity);
    return sum + extraCount * ingredient.extra_price_cents;
  }, 0);

  return (purchaseMode?.price_cents ?? 0) + extrasTotal;
}
