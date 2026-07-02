import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
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
    }, 5000);

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
      className="glass-panel relative overflow-hidden rounded-3xl p-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carrousel"
      aria-label="Aperçu des services Savour Et Plus"
    >
      <div className="relative h-[32rem] overflow-hidden rounded-2xl bg-zinc-100">
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

        <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/70 bg-white/90 p-5 shadow-lg backdrop-blur">
          <div aria-live="polite">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-rose-700">{currentSlide.eyebrow}</p>
            <p className="mt-2 text-lg font-bold text-zinc-950">{currentSlide.text}</p>
          </div>
          <div className="mt-4 flex gap-2" aria-label="Choisir une image">
            {heroSlides.map((slide, index) => (
              <button
                className={`h-2.5 rounded-full transition-all ${
                  activeSlide === index ? "w-8 bg-rose-600" : "w-2.5 bg-zinc-300 hover:bg-zinc-400"
                }`}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Afficher l'image ${index + 1}: ${slide.eyebrow}`}
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
