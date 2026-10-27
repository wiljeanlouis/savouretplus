import { ChefHat, Gem, HeartHandshake, Sparkles } from "lucide-react";

const reasons = [
  { icon: Gem, title: "Service sur mesure", text: "Des solutions adaptées à vos besoins" },
  { icon: ChefHat, title: "Gastronomie authentique", text: "Des créations gourmandes préparées avec soin" },
  { icon: HeartHandshake, title: "Accompagnement personnalisé", text: "Une équipe à l'écoute de vos idées" },
  { icon: Sparkles, title: "Attention aux détails", text: "Une présentation soignée à chaque étape" },
];

export function WhySection() {
  return (
    <div>
      <p className="eyebrow">Pourquoi SavouretPlus</p>
      <h2 className="mt-3 font-serif text-4xl font-semibold leading-none tracking-[-0.02em] text-espresso sm:text-5xl">
        Plus qu'un service, une expérience
      </h2>
      <div className="mt-8 grid gap-px overflow-hidden border border-blush/40 bg-blush/40 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map(({ icon: Icon, title, text }) => (
          <article className="bg-white px-5 py-7 text-center" key={title}>
            <Icon className="mx-auto h-7 w-7 stroke-[1.4] text-wine" aria-hidden="true" />
            <h3 className="mt-4 text-sm font-bold text-espresso">{title}</h3>
            <p className="mt-2 text-xs leading-5 text-espresso/60">{text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
