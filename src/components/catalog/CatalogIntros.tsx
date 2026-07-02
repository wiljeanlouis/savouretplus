import { ClipboardList } from "lucide-react";
import { Button } from "../ui/button";

const cateringHighlights = [
  {
    label: "Plateaux à partager",
    image: "https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?auto=format&fit=crop&w=900&h=700&q=80",
  },
  {
    label: "Service pour événements",
    image: "./images/home/offer-2-340x243.png",
  },
  {
    label: "Tables de réception",
    image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=900&h=700&q=80",
  },
];

const decorationImages = [
  "./images/catalog/decoration/decoration-1-530x480.png",
  "./images/catalog/decoration/decoration-2-530x480.png",
  "./images/catalog/decoration/decoration-3-530x480.png",
];

export function TastingIntro() {
  return (
    <div className="mb-10 grid gap-6 rounded-3xl border border-rose-100 bg-white p-5 shadow-sm lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:p-6">
      <div className="max-w-xl">
        <p className="eyebrow">Complément événementiel</p>
        <h2 className="mt-2 font-serif text-4xl font-extrabold tracking-tight text-zinc-950">
          Ajoutez le traiteur à votre événement.
        </h2>
        <p className="mt-4 text-base leading-7 text-zinc-600">
          Découvrez quelques présentations possibles, puis envoyez les détails de votre activité pour compléter votre
          décor avec une offre traiteur adaptée.
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
  );
}

export function DecorationIntro() {
  return (
    <div className="mb-10 grid gap-6 rounded-3xl border border-rose-100 bg-white p-5 shadow-sm lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:p-6">
      <div className="max-w-xl">
        <p className="eyebrow">Décoration d'événement</p>
        <h2 className="mt-2 font-serif text-4xl font-extrabold tracking-tight text-zinc-950">
          Des décors pensés pour célébrer.
        </h2>
        <p className="mt-4 text-base leading-7 text-zinc-600">
          Parcourez nos éléments de décoration, puis envoyez vos détails d'événement pour recevoir une proposition
          adaptée à votre salle, votre thème et votre budget.
        </p>
        <Button asChild className="mt-6 w-full sm:w-auto">
          <a href="#/soumission?service=decoration">
            <ClipboardList className="h-4 w-4" />
            Demander une soumission décoration
          </a>
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {decorationImages.map((image, index) => (
          <figure className="relative overflow-hidden rounded-2xl bg-zinc-100" key={image}>
            <img className="h-56 w-full object-cover" src={image} alt={`Décoration ${index + 1}`} />
          </figure>
        ))}
      </div>
    </div>
  );
}
