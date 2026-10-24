import { ArrowLeft, ClipboardList, Send, ShoppingBag, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { createCustomerOrder } from "../../application/commerce";
import { createCustomerOrderSubmitter } from "../../application/customerOrderRequest";
import {
  CommercialValidationError,
  formatPhoneInput,
  type ValidationErrors,
  validateCustomerContact,
  validateCustomerOrder,
} from "../../domain/commercialValidation";
import { CustomerOrderReceptionError } from "../../domain/customerOrderReception";
import { isSelectionOrderEligible } from "../../domain/cart";
import { buildSelectionQuoteHash } from "../../domain/quote";
import { formatCurrency } from "../../shared/format";
import { focusFirstInvalidField, ValidatedField } from "../forms/ValidatedField";
import { BreadcrumbHero } from "../layout/BreadcrumbHero";
import { Button } from "../ui/button";

export function CartPage({ cart }) {
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "", note: "" });
  const [status, setStatus] = useState("idle");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const orderSubmitterRef = useRef(null);
  if (!orderSubmitterRef.current) {
    orderSubmitterRef.current = createCustomerOrderSubmitter(createCustomerOrder);
  }
  const orderEligible = isSelectionOrderEligible(cart.items);
  const quoteHash = buildSelectionQuoteHash(cart.items);

  function updateCustomer(field, value) {
    const nextCustomer = { ...customer, [field]: value };
    setCustomer(nextCustomer);
    setStatus("idle");

    const path = `customer.${field}`;
    if (!errors[path]) return;

    const result = validateCustomerContact(nextCustomer);
    setErrors((current) => updateFieldError(current, path, result.errors[path]));
  }

  function updateItemQuantity(item, index, value) {
    cart.updateQuantity(item.key, value);
    const path = `items.${index}.quantity`;
    const quantity = Number(value);
    const error =
      Number.isInteger(quantity) && quantity > 0
        ? undefined
        : "La quantité doit être un entier positif.";
    setErrors((current) => updateFieldError(current, path, error));
  }

  async function submitOrder(event) {
    event.preventDefault();
    if (!orderEligible) return;
    const order = {
      customer,
      items: cart.items,
      totalCents: cart.totalCents,
    };
    const validation = validateCustomerOrder(order);
    if (!validation.valid) {
      setErrors(validation.errors);
      focusFirstInvalidField();
      return;
    }

    setErrors({});
    setStatus("saving");
    try {
      const result = await orderSubmitterRef.current(validation.value);
      if (!result.submitted) return;
      cart.clear();
      setCustomer({ name: "", phone: "", email: "", note: "" });
      setStatus("success");
    } catch (error) {
      if (error instanceof CommercialValidationError) {
        setErrors(error.errors);
        setStatus("idle");
        focusFirstInvalidField();
        return;
      }
      if (error instanceof CustomerOrderReceptionError) {
        setStatus(`${error.kind}-error`);
        return;
      }
      setStatus("technical-error");
    }
  }

  return (
    <>
      <BreadcrumbHero
        title="Ma sélection"
        image="./images/catalog/tasting/breadcrumbs-bg-pates.png"
        subtitle="Regroupez vos gourmandises et vos inspirations décoratives, puis choisissez le parcours adapté."
      />

      <section className="py-16 sm:py-20">
        <div className="container-page">
          {status === "success" ? (
            <div
              className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800"
              role="status"
            >
              <p className="font-bold">Votre demande de commande a bien été reçue.</p>
              <p className="mt-1 text-sm">
                Cette confirmation est uniquement technique. Nous communiquerons avec vous après la validation des
                disponibilités, des prix et des détails de la demande.
              </p>
            </div>
          ) : null}

          {cart.items.length ? (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
              <div>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow">Ma sélection</p>
                    <h2 className="mt-2 font-serif text-3xl font-bold text-zinc-950">
                      {cart.count} article{cart.count > 1 ? "s" : ""}
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a href="#/decoration"><ArrowLeft className="h-4 w-4" />Décoration</a>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <a href="#/degustation">Dégustation</a>
                    </Button>
                  </div>
                </div>

                <div className="grid gap-8">
                  {["decoration", "tasting"].map((category) => {
                    const categoryItems = cart.items
                      .map((item, index) => ({ item, index }))
                      .filter(({ item }) => item.category === category);
                    if (!categoryItems.length) return null;

                    return (
                      <section key={category}>
                        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-wine">
                          {category === "decoration" ? "Décoration" : "Dégustation"}
                        </h3>
                        <div className="grid gap-4">
                          {categoryItems.map(({ item, index }) => (
                            <CartItem
                              cart={cart}
                              item={item}
                              index={index}
                              errors={errors}
                              onQuantityChange={updateItemQuantity}
                              key={item.key}
                            />
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-5 lg:sticky lg:top-28">
                <SelectionCommercialActions
                  cart={cart}
                  orderEligible={orderEligible}
                  quoteHash={quoteHash}
                />
                {orderEligible ? (
                  <OrderForm
                    cart={cart}
                    customer={customer}
                    errors={errors}
                    onCustomerChange={updateCustomer}
                    onSubmit={submitOrder}
                    status={status}
                  />
                ) : null}
              </div>
            </div>
          ) : (
            <EmptyCart hasSubmitted={status === "success"} />
          )}
        </div>
      </section>
    </>
  );
}

function CartItem({ cart, item, index, errors, onQuantityChange }) {
  const hasKnownPrice = item.pricing === "known" && typeof item.unit_price_cents === "number";
  const unitPrice = hasKnownPrice ? item.unit_price_cents : null;
  const quantityError = errors[`items.${index}.quantity`];
  const configurationError = Object.entries(errors).find(
    ([path]) => path.startsWith(`items.${index}.`) && path !== `items.${index}.quantity`,
  )?.[1] as string | undefined;

  return (
    <article
      className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:p-5"
      aria-invalid={Boolean(configurationError)}
      aria-describedby={configurationError ? `cart-item-${index}-configuration-error` : undefined}
      tabIndex={configurationError ? -1 : undefined}
    >
      <img
        className={`h-28 w-full bg-rose-50 sm:w-28 ${item.category === "decoration" ? "object-cover" : "object-contain"}`}
        src={item.image_url}
        alt=""
      />
      <div>
        <h3 className="font-serif text-xl font-bold text-zinc-950">{item.name}</h3>
        <CartItemConfiguration item={item} />
        <p className="mt-3 text-sm font-bold text-wine">
          {unitPrice === null ? "Tarification sur soumission" : `${formatCurrency(unitPrice)} l’unité`}
        </p>
        <label className="mt-4 flex w-fit items-center gap-3 text-sm font-semibold text-zinc-700">
          Quantité
          <input
            className="h-10 w-20 rounded-md border border-zinc-200 px-2 text-center font-bold aria-invalid:border-red-500 aria-invalid:ring-1 aria-invalid:ring-red-200"
            min="1"
            max="1000"
            step="1"
            type="number"
            value={item.quantity}
            aria-invalid={Boolean(quantityError)}
            aria-describedby={quantityError ? `cart-item-${index}-quantity-error` : undefined}
            onChange={(event) => onQuantityChange(item, index, event.target.value)}
          />
        </label>
        {quantityError ? (
          <p className="mt-2 text-sm font-medium text-red-700" id={`cart-item-${index}-quantity-error`} role="alert">
            {quantityError}
          </p>
        ) : null}
        {item.category === "decoration" ? (
          <label className="mt-4 grid gap-2 text-sm font-semibold text-zinc-700">
            Préférences
            <textarea
              className="min-h-20 border border-blush bg-white px-3 py-2 font-normal"
              maxLength={500}
              placeholder="Couleurs, thème ou précision utile"
              value={item.note || ""}
              onChange={(event) => cart.updateNote(item.key, event.target.value)}
            />
          </label>
        ) : null}
        {configurationError ? (
          <p
            className="mt-2 text-sm font-medium text-red-700"
            id={`cart-item-${index}-configuration-error`}
            role="alert"
          >
            {configurationError}
          </p>
        ) : null}
      </div>
      <div className="flex items-start justify-between gap-3 sm:block sm:text-right">
        <strong className="text-lg text-zinc-950">
          {unitPrice === null ? "Sur soumission" : formatCurrency(unitPrice * item.quantity)}
        </strong>
        <Button
          className="sm:ml-auto sm:mt-5"
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => cart.remove(item.key)}
          aria-label={`Retirer ${item.name} de ma sélection`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}

export function SelectionCommercialActions({ cart, orderEligible, quoteHash }) {
  const hasQuotedItems = cart.items.some((item) => item.pricing === "quote");
  const hasPricedItems = cart.items.some((item) => item.pricing === "known");
  const isMixed = new Set(cart.items.map((item) => item.category)).size > 1;

  return (
    <aside className="border border-blush/60 bg-white p-5 shadow-sm">
      <p className="eyebrow">Parcours disponibles</p>
      <h2 className="mt-2 font-serif text-2xl font-semibold text-espresso">Comment poursuivre ?</h2>
      <div className="mt-5 border-y border-blush/50 py-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold text-espresso/65">Sous-total indicatif tarifé</span>
          <strong className="text-xl text-espresso">
            {hasPricedItems ? formatCurrency(cart.totalCents) : "Aucun article tarifé"}
          </strong>
        </div>
        {hasQuotedItems ? (
          <p className="mt-2 text-xs leading-5 text-espresso/55">Les décorations sur soumission ne sont pas incluses dans ce sous-total.</p>
        ) : null}
      </div>

      {quoteHash ? (
        <Button className="mt-5 w-full" asChild>
          <a href={quoteHash}><ClipboardList className="h-4 w-4" />Demander une soumission</a>
        </Button>
      ) : null}
      {isMixed && !quoteHash ? (
        <div className="mt-5 border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950" role="status">
          La sélection mixte est conservée, mais son envoi est temporairement indisponible : le contrat SAVIS ne confirme pas encore une demande Traiteur + Décoration sans Organisation.
        </div>
      ) : null}
      {orderEligible ? (
        <p className="mt-4 text-xs leading-5 text-espresso/55">Tous les articles sont aussi admissibles à la demande de commande ci-dessous.</p>
      ) : (
        <p className="mt-4 text-xs leading-5 text-espresso/55">La commande directe est réservée aux produits Dégustation tarifés.</p>
      )}
    </aside>
  );
}

function OrderForm({ cart, customer, errors, onCustomerChange, onSubmit, status }) {
  return (
    <aside className="border border-blush/60 bg-white p-5 shadow-sm">
      <p className="eyebrow">Demande de commande</p>
      <h2 className="mt-2 font-serif text-2xl font-bold text-zinc-950">
        Transmettre la demande
      </h2>

      <div className="my-6 flex items-center justify-between rounded-xl bg-zinc-100 px-4 py-4">
        <span className="font-semibold text-zinc-600">Sous-total indicatif</span>
        <strong className="text-2xl text-zinc-950">{formatCurrency(cart.totalCents)}</strong>
      </div>

      <form className="grid gap-4" onSubmit={onSubmit} noValidate>
        <ValidatedField id="order-name" label="Nom" required error={errors["customer.name"]}>
          <input
            autoComplete="name"
            value={customer.name}
            onChange={(event) => onCustomerChange("name", event.target.value)}
          />
        </ValidatedField>
        <ValidatedField
          id="order-phone"
          label="Téléphone"
          required
          error={errors["customer.phone"]}
        >
          <input
            autoComplete="tel"
            inputMode="tel"
            placeholder="(514) 555-1234"
            type="tel"
            value={customer.phone}
            onChange={(event) =>
              onCustomerChange("phone", formatPhoneInput(event.target.value))
            }
          />
        </ValidatedField>
        <ValidatedField id="order-email" label="Courriel" error={errors["customer.email"]}>
          <input
            autoComplete="email"
            type="email"
            value={customer.email}
            onChange={(event) => onCustomerChange("email", event.target.value)}
          />
        </ValidatedField>
        <ValidatedField id="order-note" label="Note">
          <textarea
            rows={4}
            value={customer.note}
            onChange={(event) => onCustomerChange("note", event.target.value)}
          />
        </ValidatedField>

        {errors.items ? (
          <p className="text-sm font-medium text-red-700" role="alert">
            {errors.items}
          </p>
        ) : null}
        {errors.totalCents ? (
          <p className="text-sm font-medium text-red-700" role="alert">
            {errors.totalCents}
          </p>
        ) : null}

        <Button className="mt-2 w-full" size="lg" type="submit" disabled={status === "saving"}>
          <Send className="h-5 w-5" />
          {status === "saving" ? "Envoi..." : "Envoyer la demande"}
        </Button>
        {status === "validation-error" ? (
          <p className="text-sm font-semibold text-red-700" role="alert">
            Certaines données ont été refusées. Votre sélection est conservée; vérifiez-la avant de réessayer.
          </p>
        ) : null}
        {status === "idempotency-error" ? (
          <p className="text-sm font-semibold text-red-700" role="alert">
            Cette demande entre en conflit avec une tentative précédente. Votre sélection est conservée; veuillez nous
            contacter avant de la renvoyer.
          </p>
        ) : null}
        {status === "network-error" ? (
          <p className="text-sm font-semibold text-red-700" role="alert">
            La réception n’a pas pu être confirmée. Votre sélection et la référence de la demande sont conservées;
            réessayez lorsque la connexion est rétablie.
          </p>
        ) : null}
        {status === "technical-error" ? (
          <p className="text-sm font-semibold text-red-700" role="alert">
            Le service de réception est indisponible. Votre sélection est conservée; veuillez réessayer plus tard.
          </p>
        ) : null}
      </form>
    </aside>
  );
}

function EmptyCart({ hasSubmitted }) {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-rose-200 bg-white p-10 text-center shadow-sm sm:p-14">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-rose-600">
        <ShoppingBag className="h-7 w-7" />
      </span>
      <h2 className="mt-5 font-serif text-3xl font-bold text-zinc-950">
        {hasSubmitted ? "Demande reçue" : "Votre sélection est vide"}
      </h2>
      <p className="mx-auto mt-3 max-w-md leading-7 text-zinc-600">
        {hasSubmitted
          ? "La réception technique est confirmée. La disponibilité, les prix et la commande restent à valider par notre équipe."
          : "Ajoutez les produits ou les décorations qui vous intéressent, puis revenez ici pour choisir votre parcours."}
      </p>
      <Button asChild className="mt-6">
        <a href="#/decoration">Explorer les catalogues</a>
      </Button>
    </div>
  );
}

function CartItemConfiguration({ item }) {
  const allocationNotes = (item.allocation || [])
    .filter((choice) => choice.quantity > 0)
    .map((choice) => `${choice.quantity} ${choice.choice_name}`);

  const ingredientNotes = (item.ingredients || [])
    .map((ingredient) => {
      if (ingredient.quantity === 0) return `Sans ${ingredient.name}`;

      const extraCount = Math.max(0, ingredient.quantity - ingredient.default_quantity);
      if (extraCount > 0) return `${ingredient.name} +${extraCount}`;

      return null;
    })
    .filter(Boolean);

  return (
    <div className="mt-2 grid gap-1 text-sm text-zinc-500">
      {item.purchase_mode ? <span>Format : {item.purchase_mode.label}</span> : null}
      {item.selection ? (
        <span>
          {item.selection.group_label} : {item.selection.choice_name}
        </span>
      ) : null}
      {allocationNotes.length ? <span>Répartition : {allocationNotes.join(", ")}</span> : null}
      {ingredientNotes.map((note) => (
        <span key={note}>{note}</span>
      ))}
      {item.note ? <span>Préférences : {item.note}</span> : null}
    </div>
  );
}

function updateFieldError(errors: ValidationErrors, path: string, error?: string) {
  const next = { ...errors };
  if (error) next[path] = error;
  else delete next[path];
  return next;
}
