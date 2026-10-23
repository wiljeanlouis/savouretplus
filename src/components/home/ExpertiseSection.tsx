import { ArrowRight, CalendarDays, Flower2, HeartHandshake, Sprout, UtensilsCrossed, UsersRound } from "lucide-react";

const highlights = [
  {
    icon: Sprout,
    title: "Décoration personnalisée",
    text: "Des ambiances élégantes pour chaque occasion",
  },
  {
    icon: UtensilsCrossed,
    title: "Saveurs et gourmandises",
    text: "Des saveurs authentiques qui rassemblent",
  },
  {
    icon: CalendarDays,
    title: "Événements privés et corporatifs",
    text: "Des célébrations et rencontres professionnelles",
  },
  {
    icon: HeartHandshake,
    title: "Accompagnement de confiance",
    text: "Une écoute attentive de vos besoins",
  },
];

const expertiseCards = [
  {
    title: "Décoration",
    description: "Des décors sur mesure qui créent des ambiances uniques et mémorables.",
    image: "./images/home/ambient-floral-decoration.jpg",
    alt: "Photographie d'ambiance d'une composition florale blanche pour réception",
    href: "#/decoration",
    action: "Découvrir",
    icon: Flower2,
    ambiance: true,
  },
  {
    title: "Dégustation",
    description: "Des créations gourmandes préparées avec soin pour accompagner vos célébrations.",
    image: "./images/home/ambient-gastronomy-table.jpg",
    alt: "Photographie d'ambiance d'une table gastronomique fleurie pour réception",
    href: "#/degustation",
    action: "Voir nos produits",
    icon: UtensilsCrossed,
    ambiance: true,
  },
  {
    title: "Nos services",
    description: "Une organisation personnalisée pour des événements sans souci.",
    image: "./images/home/ambient-elegant-reception.jpg",
    alt: "Photographie d'ambiance d'une salle de réception élégante et fleurie",
    href: "#/soumission",
    action: "En savoir plus",
    icon: UsersRound,
    ambiance: true,
  },
];

export function ExpertiseStrip() {
  return (
    <section className="border-y border-blush/45 bg-white" aria-label="Nos expertises">
      <div className="container-page grid sm:grid-cols-2 xl:grid-cols-4">
        {highlights.map(({ icon: Icon, title, text }, index) => (
          <article
            className={`flex gap-4 px-2 py-7 sm:px-6 ${index > 0 ? "xl:border-l xl:border-blush/65" : ""}`}
            key={title}
          >
            <Icon className="mt-1 h-9 w-9 shrink-0 stroke-[1.35] text-wine" aria-hidden="true" />
            <div>
              <h2 className="text-xs font-bold text-espresso">{title}</h2>
              <p className="mt-1 text-xs leading-5 text-espresso/60">{text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ExpertiseSection() {
  return (
    <section className="py-16 lg:py-24" id="expertises">
      <div className="container-page">
        <p className="eyebrow">Notre univers</p>
        <div className="mt-3 flex items-end gap-6">
          <h2 className="section-title">Trois expertises, une même passion</h2>
          <span className="mb-2 hidden h-px w-20 bg-champagne md:block" aria-hidden="true" />
        </div>

        <div className="mt-9 grid gap-5 lg:grid-cols-3">
          {expertiseCards.map(({ title, description, image, alt, href, action, icon: Icon, ambiance }) => (
            <article className="surface-card group overflow-hidden" key={title}>
              <div className="relative">
                <div className="aspect-[16/9] overflow-hidden bg-blush/25">
                  <img
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                    src={image}
                    alt={alt}
                    width="530"
                    height="298"
                    loading="lazy"
                  />
                  {ambiance ? (
                    <span className="absolute right-3 top-3 rounded-full bg-espresso/65 px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.13em] text-white/90 backdrop-blur-sm">
                      Image d'ambiance
                    </span>
                  ) : null}
                </div>
                <span className="absolute -bottom-6 left-6 grid h-12 w-12 place-items-center rounded-full bg-ivory text-wine shadow-sm">
                  <Icon className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
                </span>
              </div>
              <div className="px-6 pb-6 pt-9">
                <h3 className="font-serif text-3xl font-semibold leading-none text-espresso">{title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-6 text-espresso/65">{description}</p>
                <a className="editorial-link mt-5" href={href}>
                  {action}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
