import { ArrowLeft, Send, ShoppingBag, Trash2 } from "lucide-react";
import { useState } from "react";
import { createCustomerOrder } from "../../application/commerce";
import { formatCurrency } from "../../shared/format";
import { BreadcrumbHero } from "../layout/BreadcrumbHero";
import { Button } from "../ui/button";

export function CartPage({ cart }) {
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "", note: "" });
  const [status, setStatus] = useState("idle");

  async function submitOrder(event) {
    event.preventDefault();
    if (!cart.items.length) return;

    setStatus("saving");
    try {
      await createCustomerOrder({
        customer,
        items: cart.items,
        totalCents: cart.totalCents,
      });
      cart.clear();
      setCustomer({ name: "", phone: "", email: "", note: "" });
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  return (
    <>
      <BreadcrumbHero
        title="Votre panier"
        image="./images/catalog/tasting/breadcrumbs-bg-pates.png"
        subtitle="Vérifiez vos articles, puis remplissez vos coordonnées pour envoyer votre commande."
      />

      <section className="py-16 sm:py-20">
        <div className="container-page">
          {status === "success" ? (
            <div
              className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800"
              role="status"
            >
              <p className="font-bold">Votre commande a bien été envoyée.</p>
              <p className="mt-1 text-sm">Nous communiquerons avec vous pour confirmer les détails.</p>
            </div>
          ) : null}

          {cart.items.length ? (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
              <div>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow">Votre sélection</p>
                    <h2 className="mt-2 font-serif text-3xl font-bold text-zinc-950">
                      {cart.count} article{cart.count > 1 ? "s" : ""}
                    </h2>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a href="#/degustation">
                      <ArrowLeft className="h-4 w-4" />
                      Continuer mes achats
                    </a>
                  </Button>
                </div>

                <div className="grid gap-4">
                  {cart.items.map((item) => (
                    <CartItem cart={cart} item={item} key={item.key} />
                  ))}
                </div>
              </div>

              <OrderForm
                cart={cart}
                customer={customer}
                onCustomerChange={setCustomer}
                onSubmit={submitOrder}
                status={status}
              />
            </div>
          ) : (
            <EmptyCart hasSubmitted={status === "success"} />
          )}
        </div>
      </section>
    </>
  );
}

function CartItem({ cart, item }) {
  const unitPrice = item.unit_price_cents ?? item.price_cents ?? 0;

  return (
    <article className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:p-5">
      <img
        className="h-28 w-full rounded-xl bg-rose-50 object-contain sm:w-28"
        src={item.image_url}
        alt=""
      />
      <div>
        <h3 className="font-serif text-xl font-bold text-zinc-950">{item.name}</h3>
        <CartItemConfiguration item={item} />
        <p className="mt-3 text-sm font-bold text-rose-700">{formatCurrency(unitPrice)} l’unité</p>
        <label className="mt-4 flex w-fit items-center gap-3 text-sm font-semibold text-zinc-700">
          Quantité
          <input
            className="h-10 w-20 rounded-md border border-zinc-200 px-2 text-center font-bold"
            min="1"
            type="number"
            value={item.quantity}
            onChange={(event) => cart.updateQuantity(item.key, event.target.value)}
          />
        </label>
      </div>
      <div className="flex items-start justify-between gap-3 sm:block sm:text-right">
        <strong className="text-lg text-zinc-950">{formatCurrency(unitPrice * item.quantity)}</strong>
        <Button
          className="sm:ml-auto sm:mt-5"
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => cart.remove(item.key)}
          aria-label={`Retirer ${item.name} du panier`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  );
}

function OrderForm({ cart, customer, onCustomerChange, onSubmit, status }) {
  return (
    <aside className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:sticky lg:top-28">
      <p className="eyebrow">Finaliser</p>
      <h2 className="mt-2 font-serif text-2xl font-bold text-zinc-950">Soumettre la commande</h2>

      <div className="my-6 flex items-center justify-between rounded-xl bg-zinc-100 px-4 py-4">
        <span className="font-semibold text-zinc-600">Total estimé</span>
        <strong className="text-2xl text-zinc-950">{formatCurrency(cart.totalCents)}</strong>
      </div>

      <form className="grid gap-4" onSubmit={onSubmit}>
        <Field label="Nom">
          <input
            required
            autoComplete="name"
            value={customer.name}
            onChange={(event) => onCustomerChange({ ...customer, name: event.target.value })}
          />
        </Field>
        <Field label="Téléphone">
          <input
            required
            autoComplete="tel"
            type="tel"
            value={customer.phone}
            onChange={(event) => onCustomerChange({ ...customer, phone: event.target.value })}
          />
        </Field>
        <Field label="Courriel">
          <input
            autoComplete="email"
            type="email"
            value={customer.email}
            onChange={(event) => onCustomerChange({ ...customer, email: event.target.value })}
          />
        </Field>
        <Field label="Note">
          <textarea
            rows={4}
            value={customer.note}
            onChange={(event) => onCustomerChange({ ...customer, note: event.target.value })}
          />
        </Field>

        <Button className="mt-2 w-full" size="lg" type="submit" disabled={status === "saving"}>
          <Send className="h-5 w-5" />
          {status === "saving" ? "Envoi..." : "Envoyer la commande"}
        </Button>
        {status === "error" ? (
          <p className="text-sm font-semibold text-red-700" role="alert">
            Impossible d’envoyer la commande. Veuillez réessayer.
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
        {hasSubmitted ? "Merci pour votre commande" : "Votre panier est vide"}
      </h2>
      <p className="mx-auto mt-3 max-w-md leading-7 text-zinc-600">
        {hasSubmitted
          ? "Vous pouvez retourner au catalogue si vous souhaitez découvrir nos autres produits."
          : "Ajoutez les produits qui vous intéressent, puis revenez ici pour envoyer votre commande."}
      </p>
      <Button asChild className="mt-6">
        <a href="#/degustation">Voir les produits</a>
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
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-zinc-700">
      {label}
      <div className="[&>input]:h-11 [&>input]:w-full [&>input]:rounded-md [&>input]:border [&>input]:border-zinc-200 [&>input]:px-3 [&>textarea]:w-full [&>textarea]:rounded-md [&>textarea]:border [&>textarea]:border-zinc-200 [&>textarea]:px-3 [&>textarea]:py-2">
        {children}
      </div>
    </label>
  );
}
