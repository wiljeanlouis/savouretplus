import { Check, ClipboardList, Send } from "lucide-react";
import { useState } from "react";
import { BreadcrumbHero } from "./BreadcrumbHero";
import { Button } from "./ui/button";
import { submitQuoteRequest } from "../application/commerce";

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
  note: "",
};

const requestTypes = [
  { value: "decoration", label: "Décoration seulement" },
  { value: "organisation", label: "Organisation d'évènement" },
  { value: "decoration-organisation", label: "Décoration + organisation" },
];

const eventTypes = ["Anniversaire", "Mariage", "Baptême", "Baby shower", "Corporatif", "Autre"];

const budgetOptions = ["300$ - 500$", "500$ - 1000$", "1000$ et plus", "À discuter"];

export function ServicePage({ title, heroImage, images, heading, text }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");

  const canSubmit =
    form.request_type &&
    form.event_type &&
    form.event_date &&
    form.event_address &&
    form.name &&
    form.phone &&
    form.budget;

  function updateForm(patch) {
    setForm((current) => ({ ...current, ...patch }));
  }

  async function submitQuote(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus("saving");
    try {
      await submitQuoteRequest({
        type: "EVENT_SERVICE_QUOTE_REQUEST",
        customer: {
          name: form.name,
          phone: form.phone,
          email: form.email || null,
        },
        event_details: {
          request_type: form.request_type,
          event_type: form.event_type,
          event_date: form.event_date,
          event_time: form.event_time || null,
          event_address: form.event_address,
          guest_count: form.guest_count ? Number(form.guest_count) : null,
          budget: form.budget,
          note: form.note || null,
        },
      });
      setForm(initialForm);
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  return (
    <>
      <BreadcrumbHero title={title} image={heroImage} subtitle={heading} />
      <section className="py-20">
        <div className="container-page grid items-start gap-10 lg:grid-cols-2">
          <div className="grid gap-4 sm:grid-cols-[1fr_0.72fr]">
            <img className="h-[32rem] w-full rounded-3xl object-cover shadow-xl" src={images[0]} alt={title} />
            <div className="grid gap-4">
              {images.slice(1).map((image) => (
                <img className="h-60 w-full rounded-2xl object-cover shadow-md" key={image} src={image} alt="" />
              ))}
            </div>
          </div>
          <div className="glass-panel rounded-3xl p-8 lg:p-10">
            <p className="eyebrow">{title}</p>
            <h2 className="mt-3 font-serif text-4xl font-extrabold tracking-tight text-zinc-950">{heading}</h2>
            <p className="mt-5 text-lg leading-8 text-zinc-600">{text}</p>
            <div className="mt-7 grid gap-3 text-sm font-semibold text-zinc-700">
              {["Décor personnalisé selon le thème", "Coordination des détails importants", "Soumission adaptée à votre budget"].map((item) => (
                <div className="flex items-center gap-3" key={item}>
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-rose-100 text-rose-700">
                    <Check className="h-4 w-4" />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="eyebrow">Demande de soumission</p>
            <h2 className="mt-3 font-serif text-4xl font-extrabold tracking-tight text-zinc-950">
              Parlez-nous de votre évènement.
            </h2>
            <p className="mt-5 text-lg leading-8 text-zinc-600">
              Remplissez les informations principales. L'équipe vous contactera pour préciser les besoins, les quantités,
              la livraison et les ajustements possibles.
            </p>
          </div>

          <form className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm" onSubmit={submitQuote}>
            <div>
              <p className="mb-3 flex items-center gap-2 text-sm font-extrabold text-zinc-950">
                <ClipboardList className="h-5 w-5 text-rose-700" />
                Type de demande
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                {requestTypes.map((option) => {
                  const selected = form.request_type === option.value;

                  return (
                    <button
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                        selected
                          ? "border-rose-600 bg-rose-50 text-rose-800"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-rose-300"
                      }`}
                      key={option.value}
                      type="button"
                      onClick={() => updateForm({ request_type: option.value })}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Nom" required>
                <input required value={form.name} onChange={(event) => updateForm({ name: event.target.value })} />
              </Field>
              <Field label="Téléphone" required>
                <input required type="tel" value={form.phone} onChange={(event) => updateForm({ phone: event.target.value })} />
              </Field>
              <Field label="Courriel">
                <input type="email" value={form.email} onChange={(event) => updateForm({ email: event.target.value })} />
              </Field>
              <Field label="Type d'évènement" required>
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

            <div className="mt-4 grid gap-4">
              <Field label="Adresse de l'évènement" required>
                <input required value={form.event_address} onChange={(event) => updateForm({ event_address: event.target.value })} />
              </Field>
              <Field label="Détails, thème ou besoins particuliers">
                <textarea rows={4} value={form.note} onChange={(event) => updateForm({ note: event.target.value })}></textarea>
              </Field>
            </div>

            <Button className="mt-6 w-full" size="lg" type="submit" disabled={!canSubmit || status === "saving"}>
              <Send className="h-5 w-5" />
              {status === "saving" ? "Envoi..." : "Envoyer la demande"}
            </Button>
            {status === "success" ? <p className="mt-3 text-sm font-semibold text-emerald-700">Demande envoyée.</p> : null}
            {status === "error" ? <p className="mt-3 text-sm font-semibold text-red-700">Impossible d'envoyer la demande.</p> : null}
            {!canSubmit ? <p className="mt-3 text-xs text-zinc-500">Remplissez les champs requis pour envoyer la demande.</p> : null}
          </form>
        </div>
      </section>
    </>
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
