import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useState } from "react";
import { testimonials } from "./homeContent";

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonial = testimonials[activeIndex];

  function selectRelative(offset) {
    setActiveIndex((current) => (current + offset + testimonials.length) % testimonials.length);
  }

  return (
    <aside className="surface-card flex min-h-72 flex-col justify-between bg-blush/20 p-7 sm:p-9" aria-label="Témoignages">
      <div>
        <Quote className="h-8 w-8 fill-wine text-wine" aria-hidden="true" />
        <blockquote className="mt-5 text-sm leading-7 text-espresso/75" aria-live="polite">
          « {testimonial.quote} »
        </blockquote>
        <p className="mt-5 text-sm font-bold text-wine">{testimonial.name}</p>
        <p className="mt-1 text-xs text-espresso/55">{testimonial.event}</p>
      </div>
      <div className="mt-8 flex items-center justify-between">
        <div className="flex gap-1.5" aria-label="Choisir un témoignage">
          {testimonials.map((item, index) => (
            <button
              className={`h-1.5 rounded-full transition-all ${index === activeIndex ? "w-6 bg-wine" : "w-1.5 bg-wine/25 hover:bg-wine/50"}`}
              type="button"
              aria-label={`Afficher le témoignage de ${item.name}`}
              aria-current={index === activeIndex ? "true" : undefined}
              onClick={() => setActiveIndex(index)}
              key={item.name}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-blush bg-white/70 text-wine transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
            type="button"
            onClick={() => selectRelative(-1)}
            aria-label="Témoignage précédent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-blush bg-white/70 text-wine transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wine"
            type="button"
            onClick={() => selectRelative(1)}
            aria-label="Témoignage suivant"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
