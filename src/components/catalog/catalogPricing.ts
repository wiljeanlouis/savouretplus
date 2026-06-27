export function getDefaultIngredientQuantities(product) {
  return Object.fromEntries(
    (product.ingredient_options || []).map((ingredient) => [
      ingredient.id,
      ingredient.default_quantity,
    ]),
  );
}

export function getDefaultChoiceAllocation(product) {
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

export function getConfiguredAllocation(product, allocation) {
  return (product.choice_group?.options || []).map((choice) => ({
    choice_id: choice.id,
    choice_name: choice.name,
    quantity: allocation[choice.id] || 0,
  }));
}

export function getConfiguredIngredients(product, quantities) {
  return (product.ingredient_options || []).map((ingredient) => ({
    id: ingredient.id,
    name: ingredient.name,
    quantity: quantities[ingredient.id] ?? ingredient.default_quantity,
    default_quantity: ingredient.default_quantity,
    extra_price_cents: ingredient.extra_price_cents,
  }));
}

export function calculateUnitPrice(ingredients, purchaseMode) {
  const extrasTotal = ingredients.reduce((sum, ingredient) => {
    const extraCount = Math.max(0, ingredient.quantity - ingredient.default_quantity);
    return sum + extraCount * ingredient.extra_price_cents;
  }, 0);

  return (purchaseMode?.price_cents ?? 0) + extrasTotal;
}
