import { HeroSlideshow } from "./HeroSlideshow";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-12 lg:h-[calc(100svh-5rem)] lg:min-h-[44rem] lg:py-6">
      <div className="container-page flex h-full flex-col">
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow">Événements, décoration & dégustation</p>
          <h1 className="mt-4 font-serif text-5xl font-extrabold leading-[0.98] tracking-tight text-zinc-950 sm:text-6xl">
            Célébrez avec élégance, savourez chaque moment
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-7 text-zinc-600">
            Créez une ambiance mémorable en faisant le choix d'un service d'organisation d'événements, de décoration ou de dégustation
          </p>
        </div>

        <div className="relative mx-auto mt-6 w-full max-w-6xl lg:min-h-0 lg:flex-1">
          <div className="absolute -left-12 top-10 h-56 w-56 rounded-full bg-rose-200 blur-3xl" />
          <div className="absolute -right-12 bottom-10 h-56 w-56 rounded-full bg-amber-200 blur-3xl" />
          <HeroSlideshow />
        </div>
      </div>
    </section>
  );
}
