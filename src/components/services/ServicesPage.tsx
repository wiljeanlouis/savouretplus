import {
  ArrowRight,
  CalendarCheck2,
  ClipboardList,
  Flower2,
  HeartHandshake,
  ListChecks,
  SlidersHorizontal,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "../ui/button";

const services = [
  {
    id: "decoration",
    eyebrow: "Décoration événementielle",
    title: "Une mise en scène qui reflète votre célébration",
    description:
      "SavouretPlus imagine des décors adaptés à votre thème, à votre lieu et à l'ambiance recherchée, des éléments décoratifs à la composition d'ensemble.",
    image: "./images/services-decoration-ambiance.jpg",
    alt: "Photographie d'ambiance d'une installation florale rose et blanche pour une réception",
    imageAspect: "aspect-[4/5]",
    imagePosition: "object-center",
    ambient: true,
    icon: Flower2,
    actions: [
      { label: "Découvrir nos décorations", href: "#/decoration", primary: false },
      {
        label: "Demander une soumission",
        href: "#/soumission?service=decoration",
        primary: true,
      },
    ],
  },
  {
    id: "degustation",
    eyebrow: "Dégustation et service traiteur",
    title: "Des spécialités à commander ou à partager en événement",
    description:
      "Commandez nos créations gourmandes dans les formats proposés, ou présentez-nous votre réception afin de préparer une demande de service traiteur adaptée.",
    image: "./images/services-traiteur-plateaux.jpg",
    alt: "Assortiment de plateaux sucrés et salés préparés par SavouretPlus",
    imageAspect: "aspect-[5/4]",
    icon: UtensilsCrossed,
    actions: [
      { label: "Commander nos spécialités", href: "#/degustation", primary: false },
      {
        label: "Demander un service traiteur",
        href: "#/soumission?service=traiteur",
        primary: true,
      },
    ],
  },
  {
    id: "organisation",
    eyebrow: "Organisation d'événements",
    title: "Un accompagnement pour structurer votre projet",
    description:
      "Nous vous accompagnons dans la préparation et la coordination des éléments convenus pour votre événement, selon vos priorités, votre contexte et les informations partagées.",
    visual: "organisation",
    icon: HeartHandshake,
    actions: [
      {
        label: "Parler de mon événement",
        href: "#/soumission?service=organisation",
        primary: true,
      },
    ],
  },
];

export function ServicesPage() {
  return (
    <>
      <ServicesHero />

      <section className="bg-ivory" aria-label="Prestations SavouretPlus">
        {services.map((service, index) => (
          <ServiceFeature service={service} reverse={index % 2 === 1} key={service.id} />
        ))}
      </section>

      <CombinedServicesCallout />
    </>
  );
}

export function ServicesHero() {
  return (
    <section className="overflow-hidden bg-white" aria-labelledby="services-hero-title">
      <div className="grid min-h-[38rem] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative z-10 flex items-center px-5 py-14 sm:px-8 sm:py-16 lg:px-[max(3rem,calc((100vw-90rem)/2+3rem))] lg:py-20">
          <div className="max-w-xl">
            <p className="eyebrow">Nos services</p>
            <h1
              className="mt-5 font-serif text-5xl font-semibold leading-[0.92] tracking-[-0.035em] text-espresso sm:text-6xl lg:text-7xl"
              id="services-hero-title"
            >
              Chaque célébration mérite une attention particulière.
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-espresso/70 sm:text-lg">
              Décoration, gourmandises et organisation : SavouretPlus vous accompagne pour créer des moments qui vous ressemblent.
            </p>
            <Button asChild className="mt-8" size="lg">
              <a href="#/soumission">
                Demander une soumission
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>

        <div className="relative min-h-[25rem] overflow-hidden lg:min-h-full">
          <img
            className="absolute inset-0 h-full w-full object-cover object-center"
            src="./images/home/ambient-elegant-reception.jpg"
            alt="Photographie d'ambiance d'une salle de réception élégante et fleurie"
            width="1600"
            height="900"
            fetchPriority="high"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white to-transparent lg:inset-y-0 lg:left-0 lg:right-auto lg:h-auto lg:w-32 lg:bg-gradient-to-r xl:w-40"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-espresso/30 to-transparent"
            aria-hidden="true"
          />
          <span className="absolute bottom-5 right-5 rounded-full bg-espresso/70 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm">
            Photographie d'ambiance
          </span>
        </div>
      </div>
    </section>
  );
}

function ServiceFeature({ service, reverse }) {
  const Icon = service.icon;

  return (
    <article className="border-t border-blush/45 bg-white first:border-t-0 even:bg-blush/15">
      <div className="container-page grid gap-9 py-16 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
        <div className={reverse ? "lg:order-2" : ""}>
          {service.visual === "organisation" ? (
            <OrganisationServiceVisual />
          ) : (
            <div
              className={`relative overflow-hidden bg-blush/25 shadow-[0_18px_50px_rgba(53,42,43,0.08)] ${
                service.imageAspect || "aspect-[4/3]"
              }`}
            >
              <img
                className={`h-full w-full ${service.imageFit || "object-cover"} ${service.imagePosition || ""}`}
                src={service.image}
                alt={service.alt}
                loading="lazy"
                decoding="async"
              />
              {service.ambient ? (
                <span className="absolute bottom-4 right-4 rounded-full bg-espresso/70 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm">
                  Photographie d'ambiance
                </span>
              ) : null}
            </div>
          )}
        </div>
        <div className={`max-w-xl ${reverse ? "lg:order-1 lg:justify-self-end" : ""}`}>
          <Icon className="h-10 w-10 stroke-[1.35] text-champagne" aria-hidden="true" />
          <p className="eyebrow mt-5">{service.eyebrow}</p>
          <h2 className="mt-4 font-serif text-4xl font-semibold leading-[0.95] text-espresso sm:text-5xl">
            {service.title}
          </h2>
          <p className="mt-5 text-base leading-7 text-espresso/65 sm:text-lg">
            {service.description}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {service.actions.map((action) => (
              <Button
                asChild
                size="lg"
                variant={action.primary ? "default" : "outline"}
                key={action.href}
              >
                <a href={action.href}>
                  {action.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

const organisationDimensions = [
  {
    icon: CalendarCheck2,
    title: "Préparation",
    description: "Clarifier les informations et les priorités partagées pour votre événement.",
  },
  {
    icon: ListChecks,
    title: "Coordination",
    description: "Rassembler les éléments convenus autour du déroulement souhaité.",
  },
  {
    icon: SlidersHorizontal,
    title: "Personnalisation",
    description: "Adapter les échanges au contexte et aux besoins que vous exprimez.",
  },
];

export function OrganisationServiceVisual() {
  return (
    <div
      className="relative overflow-hidden border border-blush/60 bg-ivory px-5 py-7 shadow-[0_18px_50px_rgba(53,42,43,0.06)] sm:px-8 sm:py-9"
      aria-label="Dimensions de l'accompagnement"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full border border-champagne/30"
        aria-hidden="true"
      />
      <p className="eyebrow relative">Notre approche</p>
      <div className="relative mt-5 grid gap-3">
        {organisationDimensions.map(({ icon: Icon, title, description }, index) => (
          <div
            className="grid grid-cols-[auto_1fr] gap-4 border border-blush/55 bg-white px-4 py-4 sm:px-5"
            key={title}
          >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-blush/25 text-wine">
              <Icon className="h-5 w-5 stroke-[1.5]" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-serif text-2xl font-semibold text-espresso">{title}</h3>
                <span className="text-xs font-bold text-champagne" aria-hidden="true">
                  0{index + 1}
                </span>
              </div>
              <p className="mt-1 text-sm leading-6 text-espresso/60">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CombinedServicesCallout() {
  return (
    <section className="bg-espresso py-14 text-white sm:py-16" aria-labelledby="services-combined-title">
      <div className="container-page flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-champagne">Combiner nos services</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold leading-tight sm:text-4xl" id="services-combined-title">
            Une demande commune pour un événement cohérent
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-white/70">
            Vous pouvez réunir Décoration et Traiteur dans une même demande, sans ajouter le service d'organisation.
          </p>
        </div>
        <Button asChild className="shrink-0 bg-white text-wine hover:bg-ivory" size="lg">
          <a href="#/soumission?service=traiteur-decoration">
            Demander Décoration + Traiteur
            <ClipboardList className="h-4 w-4" aria-hidden="true" />
          </a>
        </Button>
      </div>
    </section>
  );
}
