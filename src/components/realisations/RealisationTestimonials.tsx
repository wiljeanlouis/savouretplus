import { Quote } from "lucide-react";
import { useId } from "react";
import type { RealisationTestimonial } from "../../domain/realisation";

type RealisationTestimonialsProps = {
  testimonials?: RealisationTestimonial[];
};

export function RealisationTestimonials({ testimonials }: RealisationTestimonialsProps) {
  const headingId = useId();
  if (!testimonials?.length) return null;

  return (
    <section className="mt-4 min-w-0 border border-champagne/40 bg-ivory p-5 sm:p-6" aria-labelledby={headingId}>
      <h2 className="font-serif text-2xl font-semibold leading-tight text-espresso sm:text-3xl" id={headingId}>
        {testimonials.length === 1 ? "Le témoignage de notre client" : "Les témoignages de nos clients"}
      </h2>
      <div className="mt-5 grid grid-cols-1 gap-5">
        {testimonials.map((testimonial, index) => (
          <figure className="min-w-0 border-t border-champagne/30 pt-4" key={index}>
            <Quote className="h-6 w-6 stroke-[1.25] text-champagne" aria-hidden="true" />
            <blockquote className="mt-3 whitespace-pre-wrap [overflow-wrap:anywhere] font-serif text-xl leading-8 text-espresso">
              <p>{testimonial.quote}</p>
            </blockquote>
            <figcaption className="mt-4 [overflow-wrap:anywhere] text-sm leading-6">
              <p className="font-semibold text-wine">{testimonial.author}</p>
              {testimonial.context ? <p className="mt-1 text-espresso/65">{testimonial.context}</p> : null}
              {testimonial.date ? <p className="mt-1 text-espresso/55">{testimonial.date}</p> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
