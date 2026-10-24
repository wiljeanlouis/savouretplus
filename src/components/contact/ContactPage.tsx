import { ArrowRight, Mail, MessageCircle, Phone, PlayCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../ui/button";

const contactMethods = [
  {
    icon: <Phone className="h-5 w-5" aria-hidden="true" />,
    title: "Téléphones",
    description: "Appelez-nous pour une question générale ou un premier échange.",
    lines: [
      ["+1 (438) 969-1433", "tel:+14389691433"],
      ["+1 (514) 604-2246", "tel:+15146042246"],
    ],
  },
  {
    icon: <Mail className="h-5 w-5" aria-hidden="true" />,
    title: "Courriel",
    description: "Écrivez-nous et nous vous répondrons dès que possible.",
    lines: [["savouretplus@gmail.com", "mailto:savouretplus@gmail.com"]],
  },
  {
    icon: <PlayCircle className="h-5 w-5" aria-hidden="true" />,
    title: "YouTube",
    description: "Découvrez les préparations et les moments partagés par SavouretPlus.",
    lines: [["@SavourEtplus", "https://youtube.com/@SavourEtplus"]],
  },
];

export function ContactPage() {
  return (
    <>
      <section
        className="overflow-hidden border-b border-blush/50 bg-ivory"
        aria-labelledby="contact-title"
      >
        <div className="container-page relative py-9 text-center sm:py-10 lg:py-11">
          <div
            className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border border-champagne/25"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-blush/20 blur-3xl"
            aria-hidden="true"
          />
          <MessageCircle
            className="relative mx-auto h-7 w-7 stroke-[1.35] text-champagne"
            aria-hidden="true"
          />
          <p className="eyebrow relative mt-3">Échangeons</p>
          <h1
            className="relative mx-auto mt-2 max-w-3xl font-serif text-4xl font-semibold leading-[0.92] tracking-[-0.035em] text-espresso sm:text-5xl lg:text-6xl"
            id="contact-title"
          >
            Nous contacter
          </h1>
          <p className="relative mx-auto mt-3 max-w-2xl text-base leading-7 text-espresso/65 sm:text-lg">
            Une question, un projet ou une occasion à célébrer ? Notre équipe est à votre écoute.
          </p>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16 lg:py-20" aria-labelledby="contact-methods-title">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">Coordonnées</p>
            <h2 className="mt-3 font-serif text-4xl font-semibold text-espresso" id="contact-methods-title">
              Choisissez le moyen qui vous convient
            </h2>
          </div>
          <div className="mt-9 grid items-stretch gap-5 md:grid-cols-3">
            {contactMethods.map((method) => (
              <ContactCard {...method} key={method.title} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-blush/50 bg-blush/15 py-10 sm:py-12" aria-labelledby="contact-quote-title">
        <div className="container-page flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl font-semibold text-espresso sm:text-4xl" id="contact-quote-title">
              Vous préparez un événement ?
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-espresso/65">
              Présentez-nous votre projet pour recevoir une proposition adaptée.
            </p>
          </div>
          <Button asChild className="shrink-0" size="lg">
            <a href="#/soumission">
              Demander une soumission
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </section>
    </>
  );
}

function ContactCard({
  icon,
  title,
  description,
  lines,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  lines: string[][];
}) {
  return (
    <article className="surface-card flex h-full flex-col p-6 sm:p-7">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-blush/25 text-wine">
        {icon}
      </span>
      <h3 className="mt-5 font-serif text-3xl font-semibold text-espresso">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-espresso/60">{description}</p>
      <div className="mt-auto grid gap-2 pt-6">
        {lines.map(([label, href]) => (
          <a className="editorial-link w-fit" href={href} key={href}>
            {label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        ))}
      </div>
    </article>
  );
}
