import { Mail, Phone, PlayCircle } from "lucide-react";
import { BreadcrumbHero } from "./BreadcrumbHero";
import { Card, CardContent } from "./ui/card";

export function ContactPage() {
  return (
    <>
      <BreadcrumbHero
        title="Nous contacter"
        image="./images/breadcrumbs-bg-nous-contacter.png"
        subtitle="Pour savourer nos produits ou réserver un service, écrivez-nous ou appelez-nous."
      />
      <section className="py-20">
        <div className="container-page grid gap-5 md:grid-cols-3">
          <ContactCard icon={<Phone />} title="Téléphones" lines={[["+1 (438) 969-1433", "tel:+14389691433"], ["+1 (514) 604-2246", "tel:+15146042246"]]} />
          <ContactCard icon={<Mail />} title="Courriel" lines={[["savouretplus@gmail.com", "mailto:savouretplus@gmail.com"]]} />
          <ContactCard icon={<PlayCircle />} title="YouTube" lines={[["@SavourEtplus", "https://youtube.com/@SavourEtplus"]]} />
        </div>
      </section>
    </>
  );
}

function ContactCard({ icon, title, lines }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-7">
        <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-rose-50 text-rose-700">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-zinc-950">{title}</h3>
        <div className="mt-4 grid gap-2">
          {lines.map(([label, href]) => (
            <a className="font-semibold text-zinc-600 transition hover:text-rose-700" href={href} key={href}>
              {label}
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
