import { Send, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { createCustomerOrder } from "../application/commerce";
import { formatCurrency } from "../lib/format";

export function CartDrawer({ cart, open, onClose }) {
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
    <aside className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        className={`absolute inset-0 bg-zinc-950/45 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        type="button"
        onClick={onClose}
        aria-label="Fermer"
      />
      <div
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
          <div>
            <p className="eyebrow">Panier</p>
            <h2 className="text-2xl font-extrabold text-zinc-950">Votre commande</h2>
          </div>
          <Button variant="ghost" size="icon" type="button" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-5">
          {cart.items.length ? (
            <div className="grid gap-4">
              {cart.items.map((item) => (
                <div className="grid grid-cols-[4rem_1fr_auto] gap-3 rounded-xl border border-zinc-200 p-3" key={item.key}>
                  <img className="h-16 w-16 rounded-lg object-cover" src={item.image_url} alt="" />
                  <div>
                    <strong className="block text-sm text-zinc-950">{item.name}</strong>
                    <CartItemConfiguration item={item} />
                    <span className="text-sm font-bold text-rose-700">
                      {formatCurrency(item.unit_price_cents ?? item.price_cents)}
                    </span>
                    <input
                      className="mt-2 h-9 w-20 rounded-md border border-zinc-200 text-center text-sm font-bold"
                      min="1"
                      type="number"
                      value={item.quantity}
                      onChange={(event) => cart.updateQuantity(item.key, event.target.value)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" type="button" onClick={() => cart.remove(item.key)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
              Votre panier est vide.
            </div>
          )}

          <div className="my-6 flex items-center justify-between rounded-2xl bg-zinc-100 px-5 py-4">
            <span className="font-semibold text-zinc-600">Total estimé</span>
            <strong className="text-2xl text-zinc-950">{formatCurrency(cart.totalCents)}</strong>
          </div>

          <form className="grid gap-4" onSubmit={submitOrder}>
            <Field label="Nom">
              <input required value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} />
            </Field>
            <Field label="Téléphone">
              <input required type="tel" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} />
            </Field>
            <Field label="Courriel">
              <input type="email" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} />
            </Field>
            <Field label="Note">
              <textarea rows={3} value={customer.note} onChange={(event) => setCustomer({ ...customer, note: event.target.value })}></textarea>
            </Field>
            <Button size="lg" type="submit" disabled={!cart.items.length || status === "saving"}>
              <Send className="h-5 w-5" />
              {status === "saving" ? "Envoi..." : "Envoyer la commande"}
            </Button>
            {status === "success" ? <p className="text-sm font-semibold text-emerald-700">Commande envoyée.</p> : null}
            {status === "error" ? <p className="text-sm font-semibold text-red-700">Impossible d'envoyer la commande.</p> : null}
          </form>
        </div>
      </div>
    </aside>
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
    <div className="mt-1 grid gap-1 text-xs text-zinc-500">
      {item.purchase_mode ? (
        <span>
          Format: {item.purchase_mode.label}
        </span>
      ) : null}
      {item.selection ? (
        <span>
          {item.selection.group_label}: {item.selection.choice_name}
        </span>
      ) : null}
      {allocationNotes.length ? <span>Répartition: {allocationNotes.join(", ")}</span> : null}
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
