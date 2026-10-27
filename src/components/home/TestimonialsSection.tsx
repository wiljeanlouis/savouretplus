import { ArrowRight, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState } from "react";
import type { HomeRealisationTestimonial } from "../../domain/realisation";

type TestimonialsSectionProps = {
  testimonials: HomeRealisationTestimonial[];
};

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  if (!testimonials.length) return null;
  const visibleIndex = activeIndex % testimonials.length;

  function selectRelative(offset: number) {
    setActiveIndex((current) => (current + offset + testimonials.length) % testimonials.length);
  }

  return (
    <section className="border-t border-blush/40 bg-white py-12 sm:py-16 lg:py-20" aria-labelledby="home-testimonials-title">
      <div className="container-page">
        <p className="eyebrow">Ils nous ont fait confiance</p>
        <h2 className="mt-3 font-serif text-4xl font-semibold leading-none tracking-[-0.02em] text-espresso sm:text-5xl" id="home-testimonials-title">
          Les témoignages de nos clients
        </h2>
        <aside className="surface-card mt-8 flex min-w-0 flex-col justify-between bg-blush/20 p-6 sm:p-8" aria-label="Témoignages" aria-roledescription="carrousel">
          {/* Superposed slides reserve the height of the longest quote without truncation. */}
          <div className="grid" aria-live="polite" aria-atomic="true">
            {testimonials.map(({ key, realisation, testimonial, image }, index) => (
              <div
                className={`grid min-w-0 items-start gap-4 [grid-area:1/1] sm:grid-cols-[minmax(0,1fr)_5rem] sm:gap-6 lg:grid-cols-[minmax(0,1fr)_7rem] lg:gap-8 ${index === visibleIndex ? "" : "invisible"}`}
                aria-hidden={index !== visibleIndex ? true : undefined}
                inert={index !== visibleIndex ? true : undefined}
                key={key}
              >
                <div className="min-w-0 [overflow-wrap:anywhere]">
                  <Quote className="h-6 w-6 stroke-[1.25] text-champagne" aria-hidden="true" />
                  <figure>
                    <blockquote className="mt-3 whitespace-pre-wrap font-serif text-2xl leading-8 text-espresso/85 sm:text-3xl sm:leading-9">
                      <p>{testimonial.quote}</p>
                    </blockquote>
                    <figcaption className="mt-4 text-sm leading-6">
                      <p className="font-bold text-wine">{testimonial.author}</p>
                      {testimonial.context ? <p className="mt-1 text-xs text-espresso/65">{testimonial.context}</p> : null}
                      {testimonial.date ? <p className="mt-1 text-xs text-espresso/55">{testimonial.date}</p> : null}
                    </figcaption>
                  </figure>
                  <p className="mt-3 text-xs tracking-wide text-espresso/60">Réf. {realisation.reference}</p>
                  <a className="editorial-link mt-2 text-xs" href={`#/realisations/${realisation.slug}`} tabIndex={index === visibleIndex ? undefined : -1}>
                    Voir cette réalisation
                    <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </a>
                </div>
                <div className="aspect-square w-20 max-w-full justify-self-end overflow-hidden border border-blush/50 bg-ivory sm:self-center lg:w-28">
                  {index === visibleIndex ? (
                    <img className="h-full w-full object-cover" src={image.src} alt={image.alt} width="160" height="160" loading="lazy" decoding="async" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          {testimonials.length > 1 ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap" role="group" aria-label="Choisir un témoignage">
                {testimonials.map(({ key, realisation, testimonial }, index) => (
                  <button
                    className="grid h-11 w-8 place-items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
                    type="button"
                    aria-label={`Afficher le témoignage ${index + 1} de ${testimonial.author} (${realisation.reference})`}
                    aria-current={index === visibleIndex ? "true" : undefined}
                    onClick={() => setActiveIndex(index)}
                    key={key}
                  >
                    <span className={`h-1.5 rounded-full transition-all motion-reduce:transition-none ${index === visibleIndex ? "w-6 bg-wine" : "w-1.5 bg-wine/25"}`} aria-hidden="true" />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  className="grid h-11 w-11 place-items-center rounded-full border border-blush bg-white/70 text-wine transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
                  type="button" onClick={() => selectRelative(-1)} aria-label="Témoignage précédent"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  className="grid h-11 w-11 place-items-center rounded-full border border-blush bg-white/70 text-wine transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
                  type="button" onClick={() => selectRelative(1)} aria-label="Témoignage suivant"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
