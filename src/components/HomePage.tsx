import { ArrowRight, CalendarHeart, ChefHat, ChevronLeft, ChevronRight, ClipboardList, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const heroSlides = [
  {
    image: "./images/shareable-pates.png",
    alt: "Spécialités Savour Et Plus prêtes à partager",
    eyebrow: "Préparé avec soin",
    text: "Des spécialités savoureuses pour vos repas et vos moments à partager.",
  },
  {
    image: "./images/offer-2-340x243.png",
    alt: "Présentation du service traiteur Savour Et Plus",
    eyebrow: "Service traiteur",
    text: "Des plateaux et des formules adaptés à votre événement.",
  },
  {
    image: "./images/decoration-1-530x480.png",
    alt: "Décoration d'événement réalisée par Savour Et Plus",
    eyebrow: "Décoration personnalisée",
    text: "Une ambiance pensée selon votre thème et votre occasion.",
  },
  {
    image: "./images/decoration-3-530x480.png",
    alt: "Organisation et décoration d'un événement",
    eyebrow: "Votre événement",
    text: "Traiteur, décoration et organisation réunis dans une seule demande.",
  },
];

export function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="container-page grid min-h-[calc(100svh-5rem)] items-center gap-12 py-12 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="max-w-2xl">
            <p className="eyebrow">Cuisine, traiteur & événements</p>
            <h1 className="mt-5 font-serif text-6xl font-extrabold leading-[0.95] tracking-tight text-zinc-950 sm:text-7xl">
              Savourez, recevez et célébrez avec Savour Et Plus.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
              Commandez nos spécialités faites avec soin, ou demandez une soumission pour un service traiteur, une
              décoration ou l'organisation de votre événement.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href="#/degustation">
                  Commander maintenant <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#/soumission">
                  Demander une soumission <ClipboardList className="h-5 w-5" />
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

      <section className="bg-white py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">Ce que nous offrons</p>
            <h2 className="mt-3 font-serif text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl">
              Une offre simple pour vos repas et vos célébrations.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <OfferCard
              href="#/degustation"
              icon={<ChefHat className="h-6 w-6" />}
              image="./images/offer-1-340x243.png"
              title="Spécialités à commander"
              text="Pâtés et recettes Savour Et Plus disponibles pour une commande directe."
            />
            <OfferCard
              href="#/soumission?service=traiteur"
              icon={<Sparkles className="h-6 w-6" />}
              image="./images/offer-2-340x243.png"
              title="Service traiteur"
              text="Plateaux, items et accompagnement pour vos fêtes, rencontres et activités."
            />
            <OfferCard
              href="#/soumission?service=decoration-organisation"
              icon={<CalendarHeart className="h-6 w-6" />}
              image="./images/offer-3-340x243.png"
              title="Décoration & évènements"
              text="Décoration, mise en place et organisation selon l'occasion et le style souhaité."
            />
          </div>
        </div>
      </section>
    </>
  );
}

function HeroSlideshow() {
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

function OfferCard({ href, icon, image, title, text }) {
  return (
    <Card className="group overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-xl">
      <a href={href}>
        <img className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" src={image} alt="" />
      </a>
      <CardContent className="p-6">
        <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-rose-50 text-rose-700">{icon}</div>
        <h3 className="text-2xl font-bold text-zinc-950">{title}</h3>
        <p className="mt-3 text-zinc-600">{text}</p>
        <a className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-rose-700" href={href}>
          Voir plus <ArrowRight className="h-4 w-4" />
        </a>
      </CardContent>
    </Card>
  );
}
