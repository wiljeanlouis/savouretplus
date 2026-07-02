import { ArrowRight, ClipboardList } from "lucide-react";
import { Button } from "../ui/button";
import { HeroSlideshow } from "./HeroSlideshow";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="container-page grid min-h-[calc(100svh-5rem)] items-center gap-12 py-12 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="max-w-2xl">
          <p className="eyebrow">Événements, traiteur & cuisine</p>
          <h1 className="mt-5 font-serif text-6xl font-extrabold leading-[0.95] tracking-tight text-zinc-950 sm:text-7xl">
            Célébrez avec élégance, savourez chaque moment.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
            Créez une ambiance mémorable avec notre service de décoration et d'organisation, ajoutez le traiteur au
            besoin, ou commandez nos spécialités faites avec soin.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#/soumission">
                Demander une soumission <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#/degustation">
                Commander nos spécialités <ClipboardList className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-8 top-10 h-48 w-48 rounded-full bg-rose-200 blur-3xl" />
          <div className="absolute -right-8 bottom-10 h-48 w-48 rounded-full bg-amber-200 blur-3xl" />
          <HeroSlideshow />
        </div>
      </div>
    </section>
  );
}
