import { ArrowRight, Sprout } from "lucide-react";
import { Button } from "../ui/button";

export function GastronomySection() {
  return (
    <section className="bg-white">
      <div className="grid lg:grid-cols-2 lg:items-stretch">
        <div className="relative min-h-[22rem] overflow-hidden bg-blush/20 lg:min-h-[30rem]">
          <img
            className="absolute inset-0 h-full w-full object-cover object-center"
            src="./images/home/ambient-handcrafted-canapes.jpg"
            alt="Illustration d'ambiance d'une table de bouchées artisanales pour réception"
            width="1536"
            height="1024"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/20 via-transparent to-white/5" />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-28 lg:bg-gradient-to-r lg:from-transparent lg:to-white"
            aria-hidden="true"
          />
          <span className="absolute bottom-4 left-5 rounded-full bg-espresso/65 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm">
            Image d'ambiance
          </span>
        </div>
        <div className="flex items-center px-5 py-14 sm:px-8 lg:px-14 lg:py-20 xl:px-24">
          <div className="max-w-2xl">
            <p className="eyebrow">Notre signature gourmande</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-[1] tracking-[-0.02em] text-espresso sm:text-5xl">
              L'art de recevoir, le plaisir de savourer
            </h2>
            <p className="mt-5 text-base leading-7 text-espresso/65">
              Des créations gourmandes préparées avec soin pour apporter une touche de saveur, de
              convivialité et de raffinement à vos célébrations.
            </p>
            <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <Button asChild variant="outline">
                <a href="#/degustation">
                  Découvrir nos produits
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
              <div className="relative w-fit pr-3 text-right text-wine" aria-label="Fait à la main avec amour">
                <Sprout className="absolute -left-9 -top-2 h-8 w-8 rotate-[-18deg] stroke-[1.2] text-champagne" aria-hidden="true" />
                <p className="rotate-[-3deg] font-signature text-[2.35rem] leading-[0.72]" aria-hidden="true">
                  Fait à la main
                  <span className="mt-2 block">avec amour</span>
                </p>
                <span className="mt-3 block h-px w-full origin-right rotate-[-4deg] bg-wine/55" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
