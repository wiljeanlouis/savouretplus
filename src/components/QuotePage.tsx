import { CalendarDays, Check, ClipboardList, HeartHandshake, Send, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BreadcrumbHero } from "./BreadcrumbHero";
import { Button } from "./ui/button";
import { fetchCatalogProducts, submitQuoteRequest } from "../application/commerce";
import type { CatalogProduct } from "../domain/catalog";

type QuoteItemDraft = {
  offering_id: string;
  name: string;
  requested_quantity: number | string;
  configuration: Record<string, unknown>;
  note: string;
};

const initialForm = {
  request_type: "",
  event_type: "",
  event_date: "",
  event_time: "",
  event_address: "",
  guest_count: "",
  budget: "",
  name: "",
  phone: "",
  email: "",
  allergies: "",
  note: "",
};

const requestTypes = [
  {
    value: "traiteur",
    label: "Traiteur",
    description: "Repas, plateaux et items pour votre événement.",
    image: "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=900&h=700&q=80",
    services: ["traiteur"],
  },
  {
    value: "decoration",
    label: "Décoration",
    description: "Ambiance, thème et mise en place visuelle.",
    image: "./images/decoration-1-530x480.png",
    services: ["decoration"],
  },
  {
    value: "organisation",
    label: "Organisation d'évènement",
    description: "Aide pour coordonner les détails importants.",
    image: "./images/offer-3-340x243.png",
    services: ["organisation"],
  },
  {
    value: "decoration-organisation",
    label: "Décoration + organisation",
    description: "Un accompagnement plus complet pour votre occasion.",
    image: "./images/decoration-2-530x480.png",
    services: ["decoration", "organisation"],
  },
  {
    value: "traiteur-decoration-organisation",
    label: "Traiteur + décoration/organisation",
    description: "Une demande combinée pour simplifier les échanges.",
    image: "./images/decoration-3-530x480.png",
    services: ["traiteur", "decoration", "organisation"],
  },
];

const serviceQueryMap = {
  traiteur: "traiteur",
  decoration: "decoration",
  organisation: "organisation",
  "decoration-organisation": "decoration-organisation",
  "traiteur-decoration-organisation": "traiteur-decoration-organisation",
};

const eventTypes = ["Anniversaire", "Mariage", "Baptême", "Baby shower", "Corporatif", "Autre"];

const budgetOptions = ["300$ - 500$", "500$ - 1000$", "1000$ et plus", "À discuter"];

export function QuotePage() {
  const [form, setForm] = useState(() => ({
    ...initialForm,
    request_type: getSelectedServiceFromHash(),
  }));
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [items, setItems] = useState<Record<string, QuoteItemDraft>>({});
  const [status, setStatus] = useState("idle");

  const selectedRequest = requestTypes.find((type) => type.value === form.request_type) || null;
  const includesCatering = Boolean(selectedRequest?.services.includes("traiteur"));

  const selectedItems = useMemo(
    () =>
      Object.values(items)
        .filter((item) => Number(item.requested_quantity) > 0)
        .map((item) => ({
          offering_id: item.offering_id,
          name: item.name,
          requested_quantity: Number(item.requested_quantity),
          configuration: item.configuration || {},
          note: item.note || null,
        })),
    [items],
  );

  const canSubmit =
    form.request_type &&
    form.event_type &&
    form.event_date &&
    form.event_address &&
    form.name &&
    form.phone &&
    form.budget &&
    (!includesCatering || selectedItems.length > 0);

  useEffect(() => {
    let mounted = true;
    fetchCatalogProducts()
      .then((data) => {
        if (mounted) setProducts(data);
      })
      .finally(() => {
        if (mounted) setLoadingProducts(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const requestType = getSelectedServiceFromHash();
      setForm((current) => ({ ...current, request_type: requestType || current.request_type }));
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function updateForm(patch) {
    setForm((current) => ({ ...current, ...patch }));
    if (status !== "idle") setStatus("idle");
  }

  function updateItem(product: CatalogProduct, patch: Partial<QuoteItemDraft>) {
    setItems((current) => ({
      ...current,
      [product.id]: {
        offering_id: product.id,
        name: product.name,
        requested_quantity: current[product.id]?.requested_quantity || 0,
        configuration: current[product.id]?.configuration || {},
        note: current[product.id]?.note || "",
        ...patch,
      },
    }));
    if (status !== "idle") setStatus("idle");
  }

  async function submitQuote(event) {
    event.preventDefault();
    if (!canSubmit || !selectedRequest) return;

    setStatus("saving");
    try {
      await submitQuoteRequest({
        type: "QUOTE_REQUEST",
        customer: {
          name: form.name,
          phone: form.phone,
          email: form.email || null,
        },
        requested_services: selectedRequest.services,
        event_details: {
          request_type: form.request_type,
          event_type: form.event_type,
          event_date: form.event_date,
          event_time: form.event_time || null,
          event_address: form.event_address,
          guest_count: form.guest_count ? Number(form.guest_count) : null,
          budget: form.budget,
          allergies: form.allergies || null,
          note: form.note || null,
        },
        items: includesCatering ? selectedItems : [],
      });
      setForm(initialForm);
      setItems({});
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  return (
    <>
      <BreadcrumbHero
        title="Soumission"
        image="./images/breadcrumbs-bg-decoration.png"
        subtitle="Une seule demande pour le traiteur, la décoration et l'organisation de votre événement."
      />
      <section className="py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="eyebrow">Demande personnalisée</p>
            <h2 className="mt-3 font-serif text-4xl font-extrabold tracking-tight text-zinc-950">
              Dites-nous ce que vous préparez.
            </h2>
            <p className="mt-5 text-lg leading-8 text-zinc-600">
              Choisissez le service souhaité, ajoutez les informations de l'événement et, au besoin, les items traiteur
              qui vous intéressent.
            </p>
            <div className="mt-7 grid gap-3 text-sm font-semibold text-zinc-700">
              {["Une seule demande à remplir", "Traiteur, décoration ou organisation", "Réponse adaptée à votre budget"].map((item) => (
                <div className="flex items-center gap-3" key={item}>
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-rose-100 text-rose-700">
                    <Check className="h-4 w-4" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <form className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm" onSubmit={submitQuote}>
            <section>
              <p className="mb-3 flex items-center gap-2 text-sm font-extrabold text-zinc-950">
                <ClipboardList className="h-5 w-5 text-rose-700" />
                Type de demande
              </p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {requestTypes.map((option) => {
                  const selected = form.request_type === option.value;

                  return (
                    <button
                      className={`group overflow-hidden rounded-xl border bg-white text-left transition ${
                        selected
                          ? "border-rose-600 text-rose-900 shadow-md ring-2 ring-rose-100"
                          : "border-zinc-200 text-zinc-700 hover:border-rose-300 hover:shadow-sm"
                      }`}
                      key={option.value}
                      type="button"
                      onClick={() => updateForm({ request_type: option.value })}
                      aria-pressed={selected}
                    >
                      <span className="relative block h-36 overflow-hidden bg-zinc-100">
                        <img
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          src={option.image}
                          alt=""
                        />
                        <span
                          className={`absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full shadow-sm ${
                            selected ? "bg-rose-600 text-white" : "bg-white/90 text-zinc-500"
                          }`}
                        >
                          {selected ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                        </span>
                      </span>
                      <span className={`block min-h-28 p-4 ${selected ? "bg-rose-50" : "bg-white"}`}>
                        <span className="block text-sm font-extrabold">{option.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-zinc-500">{option.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-8 grid gap-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-950">
                <CalendarDays className="h-5 w-5 text-rose-700" />
                Informations de l'événement
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nom" required>
                  <input required value={form.name} onChange={(event) => updateForm({ name: event.target.value })} />
                </Field>
                <Field label="Téléphone" required>
                  <input required type="tel" value={form.phone} onChange={(event) => updateForm({ phone: event.target.value })} />
                </Field>
                <Field label="Courriel">
                  <input type="email" value={form.email} onChange={(event) => updateForm({ email: event.target.value })} />
                </Field>
                <Field label="Type d'événement" required>
                  <select required value={form.event_type} onChange={(event) => updateForm({ event_type: event.target.value })}>
                    <option value="">Sélectionner</option>
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Date" required>
                  <input required type="date" value={form.event_date} onChange={(event) => updateForm({ event_date: event.target.value })} />
                </Field>
                <Field label="Heure">
                  <input type="time" value={form.event_time} onChange={(event) => updateForm({ event_time: event.target.value })} />
                </Field>
                <Field label="Nombre d'invités">
                  <input min="1" type="number" value={form.guest_count} onChange={(event) => updateForm({ guest_count: event.target.value })} />
                </Field>
                <Field label="Budget" required>
                  <select required value={form.budget} onChange={(event) => updateForm({ budget: event.target.value })}>
                    <option value="">Sélectionner</option>
                    {budgetOptions.map((budget) => (
                      <option key={budget} value={budget}>
                        {budget}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Adresse de l'événement" required>
                <input required value={form.event_address} onChange={(event) => updateForm({ event_address: event.target.value })} />
              </Field>
              {includesCatering ? (
                <Field label="Allergies ou restrictions alimentaires">
                  <textarea rows={2} value={form.allergies} onChange={(event) => updateForm({ allergies: event.target.value })}></textarea>
                </Field>
              ) : null}
              <Field label="Détails, thème ou besoins particuliers">
                <textarea rows={4} value={form.note} onChange={(event) => updateForm({ note: event.target.value })}></textarea>
              </Field>
            </section>

            {includesCatering ? (
              <CateringItemsSection
                loading={loadingProducts}
                products={products}
                selectedItemsCount={selectedItems.length}
                items={items}
                onUpdateItem={updateItem}
              />
            ) : null}

            <div className="mt-8 rounded-xl border border-rose-100 bg-rose-50 p-4">
              <div className="flex gap-3">
                <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-rose-700" />
                <p className="text-sm leading-6 text-rose-950">
                  Après l'envoi, l'équipe valide les détails, les quantités et les ajustements possibles avant de confirmer la soumission.
                </p>
              </div>
            </div>

            <Button className="mt-6 w-full" size="lg" type="submit" disabled={!canSubmit || status === "saving"}>
              <Send className="h-5 w-5" />
              {status === "saving" ? "Envoi..." : "Envoyer la demande"}
            </Button>
            {status === "success" ? <p className="mt-3 text-sm font-semibold text-emerald-700">Demande envoyée.</p> : null}
            {status === "error" ? <p className="mt-3 text-sm font-semibold text-red-700">Impossible d'envoyer la demande.</p> : null}
            {!canSubmit ? (
              <p className="mt-3 text-xs text-zinc-500">
                Remplissez les champs requis{includesCatering ? " et ajoutez au moins un item traiteur" : ""}.
              </p>
            ) : null}
          </form>
        </div>
      </section>
    </>
  );
}

function CateringItemsSection({ loading, products, selectedItemsCount, items, onUpdateItem }) {
  return (
    <section className="mt-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-950">
            <Sparkles className="h-5 w-5 text-rose-700" />
            Items traiteur souhaités
          </h3>
          <p className="mt-1 text-sm text-zinc-500">Indiquez les produits qui vous intéressent pour la fête.</p>
        </div>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">
          {selectedItemsCount} sélectionné{selectedItemsCount > 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-sm text-zinc-500">
          Chargement des items...
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {products.map((product) => {
            const item = items[product.id] || {};
            const requestedQuantity = Number(item.requested_quantity || 0);

            return (
              <div className="rounded-xl border border-zinc-200 bg-white p-4" key={product.id}>
                <div className="grid gap-3 sm:grid-cols-[4.5rem_1fr_auto] sm:items-start">
                  <img className="h-18 w-18 rounded-lg bg-rose-50 object-contain p-2" src={product.image_url} alt="" />
                  <div>
                    <p className="font-bold text-zinc-950">{product.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{product.description}</p>
                    <input
                      className="mt-3 h-10 w-full rounded-md border border-zinc-200 px-3 text-sm"
                      placeholder="Note pour cet item"
                      value={item.note || ""}
                      onChange={(event) => onUpdateItem(product, { note: event.target.value })}
                    />
                  </div>
                  <div className="inline-flex h-10 items-center rounded-md border border-zinc-200 bg-zinc-50">
                    <button
                      className="grid h-10 w-9 place-items-center text-zinc-500 hover:text-zinc-950"
                      type="button"
                      onClick={() => onUpdateItem(product, { requested_quantity: Math.max(0, requestedQuantity - 1) })}
                    >
                      -
                    </button>
                    <input
                      className="h-10 w-12 border-0 bg-transparent text-center text-sm font-bold outline-none"
                      min="0"
                      type="number"
                      value={requestedQuantity}
                      onChange={(event) => onUpdateItem(product, { requested_quantity: event.target.value })}
                    />
                    <button
                      className="grid h-10 w-9 place-items-center text-zinc-500 hover:text-zinc-950"
                      type="button"
                      onClick={() => onUpdateItem(product, { requested_quantity: requestedQuantity + 1 })}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Field({ label, required = false, children }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-zinc-700">
      <span>
        {label}
        {required ? <span className="ml-1 text-rose-600">*</span> : null}
      </span>
      <div className="[&>input]:h-11 [&>input]:w-full [&>input]:rounded-md [&>input]:border [&>input]:border-zinc-200 [&>input]:bg-white [&>input]:px-3 [&>select]:h-11 [&>select]:w-full [&>select]:rounded-md [&>select]:border [&>select]:border-zinc-200 [&>select]:bg-white [&>select]:px-3 [&>textarea]:w-full [&>textarea]:rounded-md [&>textarea]:border [&>textarea]:border-zinc-200 [&>textarea]:bg-white [&>textarea]:px-3 [&>textarea]:py-2">
        {children}
      </div>
    </label>
  );
}

function getSelectedServiceFromHash() {
  const hashQuery = window.location.hash.split("?")[1] || "";
  const params = new URLSearchParams(hashQuery);
  return serviceQueryMap[params.get("service")] || "";
}
