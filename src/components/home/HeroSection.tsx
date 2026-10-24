import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-ivory">
      <div className="grid min-h-[40rem] lg:grid-cols-[0.88fr_1.12fr] xl:min-h-[42rem]">
        <div className="relative z-10 flex items-center px-5 py-14 sm:px-8 sm:py-16 lg:px-[max(3rem,calc((100vw-90rem)/2+3rem))] lg:py-20">
          <div className="max-w-xl">
            <p className="eyebrow">Des célébrations qui ont du sens</p>
            <h1 className="mt-5 font-serif text-5xl font-semibold leading-[0.9] tracking-[-0.035em] text-wine sm:text-6xl lg:text-7xl xl:text-[5.15rem]">
              Des moments inoubliables, à votre image
            </h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-espresso/75 sm:text-lg">
              SavouretPlus imagine et réalise des événements élégants et authentiques, avec une
              décoration soignée, une expérience gastronomique raffinée et un accompagnement personnalisé.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="#/soumission">
                  Planifier mon événement
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#/realisations">Voir nos réalisations</a>
              </Button>
            </div>
          </div>
        </div>

        <div className="relative min-h-[25rem] overflow-hidden lg:min-h-full">
          <img
            className="absolute inset-0 h-full w-full object-cover object-[58%_center] lg:object-center"
            src="./images/home/ambient-hero-floral-reception.jpg"
            alt="Photographie d'ambiance d'une réception fleurie aux chandelles"
            width="1800"
            height="1202"
            fetchPriority="high"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ivory to-transparent lg:inset-y-0 lg:left-0 lg:right-auto lg:h-auto lg:w-32 lg:bg-gradient-to-r xl:w-40"
            aria-hidden="true"
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-espresso/25 to-transparent" />
          <span className="absolute bottom-4 right-5 rounded-full bg-espresso/65 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur-sm">
            Photographie d'ambiance
          </span>
        </div>
      </div>
    </section>
  );
}
