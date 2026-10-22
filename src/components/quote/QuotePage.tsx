import { CalendarDays, Check, ClipboardList, HeartHandshake, Send, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchCatalogProducts, submitQuoteRequest } from "../../application/commerce";
import type { CatalogProduct } from "../../domain/catalog";
import {
  CommercialValidationError,
  formatDateForDisplay,
  formatPhoneInput,
  type QuoteRequest,
  type ValidationErrors,
  validateQuoteRequest,
} from "../../domain/commercialValidation";
import { getDecorationCategory } from "../../domain/decoration";
import {
  createDecorationQuoteItem,
  findSelectedDecoration,
  getQuoteQueryFromHash,
  type QuoteQuery,
} from "../../domain/quote";
import { BreadcrumbHero } from "../layout/BreadcrumbHero";
import { focusFirstInvalidField, ValidatedField } from "../forms/ValidatedField";
import { Button } from "../ui/button";

type QuoteItemDraft = {
  offering_id: string;
  name: string;
  requested_quantity: number | string;
  configuration: Record<string, unknown>;
  note: string;
};

const initialForm = {
  request_type: "" as QuoteQuery["service"],
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
    value: "decoration",
    label: "Décoration",
    description: "Ambiance, thème et mise en place visuelle.",
    image: "./images/catalog/decoration/decoration-1-530x480.png",
    services: ["decoration"],
  },
  {
    value: "decoration-organisation",
    label: "Décoration + organisation",
    description: "Un accompagnement plus complet pour votre occasion.",
    image: "./images/catalog/decoration/decoration-2-530x480.png",
    services: ["decoration", "organisation"],
  },
  {
    value: "organisation",
    label: "Organisation d'évènement",
    description: "Aide pour coordonner les détails importants.",
    image: "./images/home/offer-3-340x243.png",
    services: ["organisation"],
  },
  {
    value: "traiteur-decoration-organisation",
    label: "Décoration + organisation + traiteur",
    description: "Une demande combinée pour simplifier les échanges.",
    image: "./images/catalog/decoration/decoration-3-530x480.png",
    services: ["decoration", "organisation", "traiteur"],
  },
  {
    value: "traiteur",
    label: "Traiteur",
    description: "Repas, plateaux et items pour votre événement.",
    image: "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=900&h=700&q=80",
    services: ["traiteur"],
  },
];

const eventTypes = ["Anniversaire", "Mariage", "Baptême", "Baby shower", "Corporatif", "Autre"];

const budgetOptions = ["300$ - 500$", "500$ - 1000$", "1000$ et plus", "À discuter"];

export function QuotePage() {
  const initialQuery = getQuoteQueryFromHash(window.location.hash);
  const [form, setForm] = useState(() => ({
    ...initialForm,
    request_type: initialQuery.service,
  }));
  const [selectedItemSlug, setSelectedItemSlug] = useState(initialQuery.itemSlug);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [decorationProducts, setDecorationProducts] = useState<CatalogProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [items, setItems] = useState<Record<string, QuoteItemDraft>>({});
  const [status, setStatus] = useState("idle");
  const [errors, setErrors] = useState<ValidationErrors>({});

  const selectedRequest = requestTypes.find((type) => type.value === form.request_type) || null;
  const includesCatering = Boolean(selectedRequest?.services.includes("traiteur"));
  const includesDecoration = Boolean(selectedRequest?.services.includes("decoration"));
  const selectedDecoration = includesDecoration
    ? findSelectedDecoration(decorationProducts, selectedItemSlug)
    : null;

  const selectedCateringItems = useMemo(
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
  const quoteItems = useMemo(
    () => [
      ...(selectedDecoration ? [createDecorationQuoteItem(selectedDecoration)] : []),
      ...(includesCatering ? selectedCateringItems : []),
    ],
    [includesCatering, selectedCateringItems, selectedDecoration],
  );

  const canSubmit =
    form.request_type &&
    form.event_type &&
    form.event_date &&
    form.event_address &&
    form.name &&
    form.phone &&
    form.budget &&
    (!includesCatering || selectedCateringItems.length > 0);

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      fetchCatalogProducts("tasting"),
      fetchCatalogProducts("decoration"),
    ])
      .then(([tastingResult, decorationResult]) => {
        if (!mounted) return;
        setProducts(tastingResult.status === "fulfilled" ? tastingResult.value : []);
        setDecorationProducts(
          decorationResult.status === "fulfilled" ? decorationResult.value : [],
        );
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
      const query = getQuoteQueryFromHash(window.location.hash);
      setSelectedItemSlug(query.itemSlug);
      setForm((current) => ({
        ...current,
        request_type: query.service || current.request_type,
      }));
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function updateForm(patch) {
    const nextForm = { ...form, ...patch };
    setForm(nextForm);
    if (status !== "idle") setStatus("idle");

    const validation = validateQuoteRequest(buildQuoteRequest(nextForm, quoteItems));
    const paths = Object.keys(patch).flatMap((field) => formFieldPaths[field] || []);
    if (!paths.some((path) => errors[path])) return;

    setErrors((current) => {
      let next = current;
      paths.forEach((path) => {
        next = updateFieldError(next, path, validation.errors[path]);
      });
      return next;
    });
  }

  function updateItem(product: CatalogProduct, patch: Partial<QuoteItemDraft>) {
    setItems((current) => ({
      ...current,
      [product.id]: {
        offering_id: product.id,
        name: product.name,
        requested_quantity: current[product.id]?.requested_quantity || 0,
        configuration: current[product.id]?.configuration || {
          catalog_slug: product.slug,
          category: product.category,
          subcategory: product.subcategory,
        },
        note: current[product.id]?.note || "",
        ...patch,
      },
    }));
    if (patch.requested_quantity !== undefined) {
      const requestedQuantity = Number(patch.requested_quantity);
      if (Number.isInteger(requestedQuantity) && requestedQuantity > 0) {
        setErrors((current) => {
          const next = { ...current };
          delete next.items;
          Object.keys(next)
            .filter((path) => path.startsWith("items."))
            .forEach((path) => delete next[path]);
          return next;
        });
      }
    }
    if (status !== "idle") setStatus("idle");
  }

  async function submitQuote(event) {
    event.preventDefault();
    const payload = buildQuoteRequest(form, quoteItems);
    const validation = validateQuoteRequest(payload);
    if (!validation.valid) {
      setErrors(validation.errors);
      focusFirstInvalidField();
      return;
    }

    setErrors({});
    setStatus("saving");
    try {
      await submitQuoteRequest(validation.value);
      setForm(initialForm);
      setItems({});
      setStatus("success");
    } catch (error) {
      if (error instanceof CommercialValidationError) {
        setErrors(error.errors);
        setStatus("idle");
        focusFirstInvalidField();
        return;
      }
      console.error(error);
      setStatus("error");
    }
  }

  return (
    <>
      <BreadcrumbHero
        title="Soumission"
        image="./images/catalog/decoration/breadcrumbs-bg-decoration.png"
        subtitle="Une seule demande pour la décoration, l'organisation et le traiteur de votre événement."
      />
      <section className="py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="eyebrow">Demande personnalisée</p>
            <h2 className="mt-3 font-serif text-4xl font-extrabold tracking-tight text-zinc-950">
              Dites-nous l'ambiance que vous imaginez.
            </h2>
            <p className="mt-5 text-lg leading-8 text-zinc-600">
              Choisissez votre besoin de décoration ou d'organisation, ajoutez les informations de l'événement et, au
              besoin, les items traiteur qui vous intéressent.
            </p>
            <div className="mt-7 grid gap-3 text-sm font-semibold text-zinc-700">
              {["Décoration et événement d'abord", "Traiteur disponible au besoin", "Réponse adaptée à votre budget"].map((item) => (
                <div className="flex items-center gap-3" key={item}>
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-rose-100 text-rose-700">
                    <Check className="h-4 w-4" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <form
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            onSubmit={submitQuote}
            noValidate
          >
            <section>
              <p className="mb-3 flex items-center gap-2 text-sm font-extrabold text-zinc-950">
                <ClipboardList className="h-5 w-5 text-rose-700" />
                Type de demande
              </p>
              <div
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                aria-invalid={Boolean(errors["event_details.request_type"])}
                aria-describedby={
                  errors["event_details.request_type"] ? "quote-request-type-error" : undefined
                }
                tabIndex={errors["event_details.request_type"] ? -1 : undefined}
              >
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
              {errors["event_details.request_type"] ? (
                <p
                  className="mt-2 text-sm font-medium text-red-700"
                  id="quote-request-type-error"
                  role="alert"
                >
                  {errors["event_details.request_type"]}
                </p>
              ) : null}
            </section>

            {includesDecoration && selectedItemSlug ? (
              <SelectedDecorationSection
                loading={loadingProducts}
                product={selectedDecoration}
              />
            ) : null}

            <section className="mt-8 grid gap-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-zinc-950">
                <CalendarDays className="h-5 w-5 text-rose-700" />
                Informations de l'événement
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <ValidatedField
                  id="quote-name"
                  label="Nom"
                  required
                  error={errors["customer.name"]}
                >
                  <input
                    autoComplete="name"
                    value={form.name}
                    onChange={(event) => updateForm({ name: event.target.value })}
                  />
                </ValidatedField>
                <ValidatedField
                  id="quote-phone"
                  label="Téléphone"
                  required
                  error={errors["customer.phone"]}
                >
                  <input
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="(514) 555-1234"
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateForm({ phone: formatPhoneInput(event.target.value) })
                    }
                  />
                </ValidatedField>
                <ValidatedField
                  id="quote-email"
                  label="Courriel"
                  error={errors["customer.email"]}
                >
                  <input type="email" value={form.email} onChange={(event) => updateForm({ email: event.target.value })} />
                </ValidatedField>
                <ValidatedField
                  id="quote-event-type"
                  label="Type d'événement"
                  required
                  error={errors["event_details.event_type"]}
                >
                  <select value={form.event_type} onChange={(event) => updateForm({ event_type: event.target.value })}>
                    <option value="">Sélectionner</option>
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </ValidatedField>
                <ValidatedField
                  id="quote-event-date"
                  label="Date"
                  required
                  error={errors["event_details.event_date"]}
                  hint={
                    formatDateForDisplay(form.event_date)
                      ? `Date sélectionnée : ${formatDateForDisplay(form.event_date)}`
                      : undefined
                  }
                >
                  <input
                    type="date"
                    lang="fr-CA"
                    value={form.event_date}
                    onChange={(event) => updateForm({ event_date: event.target.value })}
                  />
                </ValidatedField>
                <ValidatedField
                  id="quote-event-time"
                  label="Heure"
                  error={errors["event_details.event_time"]}
                >
                  <input type="time" value={form.event_time} onChange={(event) => updateForm({ event_time: event.target.value })} />
                </ValidatedField>
                <ValidatedField
                  id="quote-guest-count"
                  label="Nombre d'invités"
                  error={errors["event_details.guest_count"]}
                >
                  <input min="1" step="1" type="number" value={form.guest_count} onChange={(event) => updateForm({ guest_count: event.target.value })} />
                </ValidatedField>
                <ValidatedField
                  id="quote-budget"
                  label="Budget"
                  required
                  error={errors["event_details.budget"]}
                >
                  <select value={form.budget} onChange={(event) => updateForm({ budget: event.target.value })}>
                    <option value="">Sélectionner</option>
                    {budgetOptions.map((budget) => (
                      <option key={budget} value={budget}>
                        {budget}
                      </option>
                    ))}
                  </select>
                </ValidatedField>
              </div>
              <ValidatedField
                id="quote-event-address"
                label="Adresse de l'événement"
                required
                error={errors["event_details.event_address"]}
              >
                <input value={form.event_address} onChange={(event) => updateForm({ event_address: event.target.value })} />
              </ValidatedField>
              {includesCatering ? (
                <ValidatedField
                  id="quote-allergies"
                  label="Allergies ou restrictions alimentaires"
                >
                  <textarea rows={2} value={form.allergies} onChange={(event) => updateForm({ allergies: event.target.value })}></textarea>
                </ValidatedField>
              ) : null}
              <ValidatedField id="quote-note" label="Détails, thème ou besoins particuliers">
                <textarea rows={4} value={form.note} onChange={(event) => updateForm({ note: event.target.value })}></textarea>
              </ValidatedField>
            </section>

            {includesCatering ? (
              <CateringItemsSection
                loading={loadingProducts}
                products={products}
                selectedItemsCount={selectedCateringItems.length}
                items={items}
                quoteItems={quoteItems}
                errors={errors}
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

            <Button className="mt-6 w-full" size="lg" type="submit" disabled={status === "saving"}>
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

function SelectedDecorationSection({ loading, product }) {
  if (loading) {
    return (
      <section className="mt-8" aria-live="polite">
        <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-5 text-sm text-zinc-500">
          Chargement du modèle sélectionné...
        </p>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="font-bold text-amber-950">Modèle non disponible</h3>
        <p className="mt-1 text-sm leading-6 text-amber-900">
          Le modèle demandé est introuvable ou n’est plus publié. Vous pouvez tout de même décrire
          le décor souhaité ci-dessous.
        </p>
      </section>
    );
  }

  const category = getDecorationCategory(product.subcategory);

  return (
    <section className="mt-8" aria-labelledby="selected-decoration-title">
      <p className="mb-3 text-sm font-extrabold text-zinc-950">Modèle sélectionné</p>
      <div className="grid gap-4 rounded-xl border border-rose-200 bg-rose-50/60 p-4 sm:grid-cols-[7rem_1fr] sm:items-center">
        <img
          className="aspect-[4/3] w-full rounded-lg bg-white object-cover"
          src={product.image_url}
          alt=""
        />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-700">
            {category?.label || "Autres décorations"}
          </p>
          <h3 className="mt-1 text-lg font-extrabold text-zinc-950" id="selected-decoration-title">
            {product.name}
          </h3>
          {product.description ? (
            <p className="mt-1 text-sm leading-6 text-zinc-600">{product.description}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function CateringItemsSection({
  loading,
  products,
  selectedItemsCount,
  items,
  quoteItems,
  errors,
  onUpdateItem,
}) {
  const sectionError = errors.items;

  return (
    <section
      className="mt-8"
      aria-invalid={Boolean(sectionError)}
      aria-describedby={sectionError ? "catering-items-error" : undefined}
      tabIndex={sectionError ? -1 : undefined}
    >
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
            const quoteItemIndex = quoteItems.findIndex(
              (quoteItem) => quoteItem.offering_id === product.id,
            );
            const quantityError =
              quoteItemIndex >= 0
                ? errors[`items.${quoteItemIndex}.requested_quantity`]
                : undefined;

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
                      className="h-10 w-12 border-0 bg-transparent text-center text-sm font-bold outline-none aria-invalid:ring-2 aria-invalid:ring-red-400"
                      min="0"
                      step="1"
                      type="number"
                      value={requestedQuantity}
                      aria-invalid={Boolean(quantityError)}
                      aria-describedby={
                        quantityError ? `quote-item-${product.id}-quantity-error` : undefined
                      }
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
                {quantityError ? (
                  <p
                    className="mt-2 text-sm font-medium text-red-700"
                    id={`quote-item-${product.id}-quantity-error`}
                    role="alert"
                  >
                    {quantityError}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
      {sectionError ? (
        <p
          className="mt-3 text-sm font-medium text-red-700"
          id="catering-items-error"
          role="alert"
        >
          {sectionError}
        </p>
      ) : null}
    </section>
  );
}

const formFieldPaths = {
  request_type: ["event_details.request_type", "requested_services"],
  event_type: ["event_details.event_type"],
  event_date: ["event_details.event_date"],
  event_time: ["event_details.event_time"],
  event_address: ["event_details.event_address"],
  guest_count: ["event_details.guest_count"],
  budget: ["event_details.budget"],
  name: ["customer.name"],
  phone: ["customer.phone"],
  email: ["customer.email"],
};

function buildQuoteRequest(form, items): QuoteRequest {
  const request = requestTypes.find((type) => type.value === form.request_type) || null;

  return {
    type: "QUOTE_REQUEST",
    customer: {
      name: form.name,
      phone: form.phone,
      email: form.email,
    },
    requested_services: request ? [...request.services] : [],
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
    items,
  };
}

function updateFieldError(errors: ValidationErrors, path: string, error?: string) {
  const next = { ...errors };
  if (error) next[path] = error;
  else delete next[path];
  return next;
}
