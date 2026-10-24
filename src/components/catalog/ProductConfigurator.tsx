import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "../../shared/format";
import { Button } from "../ui/button";
import { ProductGallery } from "./ProductGallery";
import {
  calculateUnitPrice,
  getConfiguredAllocation,
  getConfiguredIngredients,
  getConfiguredSelection,
  getDefaultChoiceAllocation,
  getDefaultIngredientQuantities,
  isValidOrderQuantity,
} from "./catalogPricing";

export function ProductConfigurator({ product, open, onClose, onAdd }) {
  const panelRef = useRef(null);
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

  useEffect(() => {
    if (!open) return undefined;

    const previouslyFocused = document.activeElement;
    const panel = panelRef.current;
    const focusableSelector =
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    panel?.querySelector("button:not([disabled])")?.focus();
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panel) return;
      const focusable = [...panel.querySelectorAll(focusableSelector)];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, onClose]);

  if (!product) return null;

  const selectedPurchaseMode =
    product.purchase_modes?.find((mode) => mode.id === selectedPurchaseModeId) || product.purchase_modes?.[0] || null;
  const selectedChoice = product.choice_group?.options?.find((option) => option.id === selectedChoiceId) || null;
  const configuredAllocation = getConfiguredAllocation(product, choiceAllocation);
  const allocationTotal = configuredAllocation.reduce((sum, choice) => sum + choice.quantity, 0);
  const configuredIngredients = getConfiguredIngredients(product, ingredientQuantities);
  const unitPriceCents = calculateUnitPrice(configuredIngredients, selectedPurchaseMode);
  const numericQuantity = Number(quantity);
  const hasValidQuantity = isValidOrderQuantity(quantity);
  const canAdd =
    Boolean(selectedPurchaseMode) &&
    hasValidQuantity &&
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

  function updateChoiceAllocation(choiceId, nextQuantity) {
    setChoiceAllocation((current) => ({
      ...current,
      [choiceId]: Math.max(0, Number(nextQuantity) || 0),
    }));
  }

  function addToCart() {
    if (!canAdd) return;

    onAdd(product, {
      quantity: numericQuantity,
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
      selection: getConfiguredSelection(product, selectedPurchaseMode, selectedChoice),
      allocation:
        product.product_type === "single_choice_bundle" &&
        selectedPurchaseMode?.allocation_type === "choice_allocation"
          ? configuredAllocation.filter((choice) => choice.quantity > 0)
          : [],
      ingredients: product.product_type === "ingredient_customization" ? configuredIngredients : [],
    });
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
        ref={panelRef}
        className={`absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-configurator-title"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <p className="eyebrow">Personnaliser</p>
            <h2 className="font-serif text-2xl font-extrabold text-zinc-950" id="product-configurator-title">{product.name}</h2>
          </div>
          <Button variant="ghost" size="icon" type="button" onClick={onClose} aria-label="Fermer le configurateur">
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          <ProductGallery
            className="h-60 rounded-2xl p-3 sm:h-72"
            images={product.gallery}
            fallbackImage={product.image_url}
            productName={product.name}
          />

          <PurchaseModeSelector
            modes={product.purchase_modes}
            selectedModeId={selectedPurchaseModeId}
            onSelect={setSelectedPurchaseModeId}
          />

          {product.product_type === "single_choice_bundle" ? (
            <>
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

          <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-zinc-600">Quantité</span>
              <QuantityStepper quantity={quantity} onChange={setQuantity} />
            </div>
            {!hasValidQuantity ? (
              <p className="mt-2 text-sm font-semibold text-red-700" role="alert">
                Saisissez une quantité entière supérieure à zéro.
              </p>
            ) : null}
            <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4">
              <span className="font-semibold text-zinc-600">Prix unitaire</span>
              <strong className="text-2xl text-zinc-950">{formatCurrency(unitPriceCents)}</strong>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-zinc-600">Total pour cette sélection</span>
              <strong className="text-lg text-zinc-950">
                {formatCurrency(hasValidQuantity ? unitPriceCents * numericQuantity : 0)}
              </strong>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-200 bg-white p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.04)] sm:p-6">
          <Button className="w-full" size="lg" type="button" disabled={!canAdd} onClick={addToCart}>
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            Ajouter {hasValidQuantity ? numericQuantity : ""} à ma sélection
          </Button>
          {!canAdd && hasValidQuantity ? (
            <p className="mt-2 text-center text-xs font-semibold text-rose-700">
              Complétez les choix demandés avant l’ajout à la sélection.
            </p>
          ) : null}
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
            aria-pressed={selectedModeId === mode.id}
          >
            <span className="block text-sm font-bold">{mode.label}</span>
            <span className="mt-1 block text-xs font-semibold">{formatCurrency(mode.price_cents)}</span>
            {mode.quantity > 1 ? (
              <span className="mt-1 block text-xs text-zinc-500">Comprend {mode.quantity} unités</span>
            ) : null}
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
            aria-pressed={selectedChoiceId === option.id}
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
        aria-label="Réduire la quantité"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <input
        className="h-11 w-12 border-0 bg-transparent text-center font-bold outline-none"
        min="1"
        step="1"
        type="number"
        value={quantity}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Quantité à ajouter"
      />
      <button
        className="grid h-11 w-10 place-items-center text-zinc-500 hover:text-zinc-950"
        type="button"
        onClick={() => onChange(Number(quantity) + 1)}
        aria-label="Augmenter la quantité"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
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
                  aria-label={`Réduire ${option.name}`}
                >
                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-zinc-900">{quantity}</span>
                <button
                  className="grid h-9 w-8 place-items-center text-zinc-500 hover:text-zinc-950"
                  type="button"
                  onClick={() => onChange(option.id, quantity + 1)}
                  aria-label={`Augmenter ${option.name}`}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
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
                  aria-label={`Réduire ${ingredient.name}`}
                >
                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-zinc-900">{quantity}</span>
                <button
                  className="grid h-9 w-8 place-items-center text-zinc-500 hover:text-zinc-950"
                  type="button"
                  onClick={() => onChange(ingredient, quantity + 1)}
                  aria-label={`Augmenter ${ingredient.name}`}
                >
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
