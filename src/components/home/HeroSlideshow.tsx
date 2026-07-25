import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { heroSlides } from "./homeContent";

export function HeroSlideshow() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) return;

    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 10000);

    return () => window.clearInterval(timer);
  }, [activeSlide, paused, reducedMotion]);

  function showPreviousSlide() {
    setActiveSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length);
  }

  function showNextSlide() {
    setActiveSlide((current) => (current + 1) % heroSlides.length);
  }

  const currentSlide = heroSlides[activeSlide];

  return (
    <div
      className="glass-panel relative h-full overflow-hidden rounded-3xl p-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carrousel"
      aria-label="Aperçu des services Savour Et Plus"
    >
      <div className="relative h-[32rem] overflow-hidden rounded-2xl bg-zinc-100 sm:h-auto sm:aspect-[16/9] lg:h-full lg:aspect-auto">
        {heroSlides.map((slide, index) => (
          <img
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              activeSlide === index ? "opacity-100" : "opacity-0"
            }`}
            src={slide.image}
            alt={activeSlide === index ? slide.alt : ""}
            aria-hidden={activeSlide !== index}
            key={slide.image}
          />
        ))}

        <button
          className="absolute left-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-zinc-800 shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          type="button"
          onClick={showPreviousSlide}
          aria-label="Image précédente"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          className="absolute right-4 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-zinc-800 shadow-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          type="button"
          onClick={showNextSlide}
          aria-label="Image suivante"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/70 bg-white/92 p-5 shadow-lg backdrop-blur sm:bottom-8 sm:left-8 sm:right-8 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl" aria-live="polite">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-700">
                Ce que nous offrons
              </p>
              <h2 className="mt-2 font-serif text-2xl font-extrabold text-zinc-950 sm:text-3xl">
                {currentSlide.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 sm:text-base">
                {currentSlide.text}
              </p>
            </div>
            <Button asChild className="shrink-0">
              <a href={currentSlide.href}>
                {currentSlide.actionLabel}
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="mt-4 flex gap-2" aria-label="Choisir une image">
            {heroSlides.map((slide, index) => (
              <button
                className={`h-2.5 rounded-full transition-all ${
                  activeSlide === index ? "w-8 bg-rose-600" : "w-2.5 bg-zinc-300 hover:bg-zinc-400"
                }`}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Afficher le service ${index + 1}: ${slide.title}`}
                aria-current={activeSlide === index ? "true" : undefined}
                key={slide.image}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
