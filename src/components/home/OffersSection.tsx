import { ArrowRight, CalendarHeart, ChefHat, Sparkles } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { offerCards } from "./homeContent";

const offerIcons = {
  chef: ChefHat,
  event: CalendarHeart,
  sparkles: Sparkles,
};

export function OffersSection() {
  return (
    <section className="bg-white py-20">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">Ce que nous offrons</p>
          <h2 className="mt-3 font-serif text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl">
            Une offre pensée d'abord pour vos événements.
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {offerCards.map((offer) => (
            <OfferCard {...offer} key={offer.href} />
          ))}
        </div>
      </div>
    </section>
  );
}

function OfferCard({ href, icon, image, title, text }) {
  const Icon = offerIcons[icon] || Sparkles;

  return (
    <Card className="group overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-xl">
      <a href={href}>
        <img className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" src={image} alt="" />
      </a>
      <CardContent className="p-6">
        <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-rose-50 text-rose-700">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-2xl font-bold text-zinc-950">{title}</h3>
        <p className="mt-3 text-zinc-600">{text}</p>
        <a className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-rose-700" href={href}>
          Voir plus <ArrowRight className="h-4 w-4" />
        </a>
      </CardContent>
    </Card>
  );
}
