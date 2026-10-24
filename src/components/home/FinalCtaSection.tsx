import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

export function FinalCtaSection() {
  return (
    <section className="relative overflow-hidden bg-espresso py-12 text-white lg:py-14">
      <img
        className="absolute inset-0 h-full w-full object-cover opacity-25"
        src="./images/catalog/decoration/decoration-1-530x480.png"
        alt=""
        width="530"
        height="480"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-espresso via-espresso/85 to-espresso/50" />
      <div className="container-page relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 className="font-serif text-4xl font-semibold leading-none sm:text-5xl">
            Prêts à planifier votre prochain événement ?
          </h2>
          <p className="mt-3 text-sm text-white/75">Parlons de votre projet. Notre équipe vous accompagnera avec plaisir.</p>
        </div>
        <Button asChild className="shrink-0 bg-champagne text-espresso hover:bg-white" size="lg">
          <a href="#/soumission">
            Demander une soumission
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </Button>
      </div>
    </section>
  );
}
