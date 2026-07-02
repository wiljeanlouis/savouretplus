import { Quote, Star } from "lucide-react";
import { testimonials } from "./homeContent";

export function TestimonialsSection() {
  return (
    <section className="bg-rose-50/60 py-20">
      <div className="container-page">
        <div className="max-w-2xl">
          <p className="eyebrow">Témoignages</p>
          <h2 className="mt-3 font-serif text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl">
            Des événements préparés avec attention.
          </h2>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article
              className="rounded-2xl border border-rose-100 bg-white p-6 shadow-sm"
              key={`${testimonial.name}-${testimonial.event}`}
            >
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-600 text-white">
                  <Quote className="h-5 w-5" />
                </span>
                <div className="flex gap-1 text-rose-600" aria-label="5 étoiles">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star className="h-4 w-4 fill-current" key={index} />
                  ))}
                </div>
              </div>
              <p className="text-lg font-semibold leading-8 text-zinc-800">“{testimonial.quote}”</p>
              <div className="mt-6 border-t border-zinc-100 pt-4">
                <p className="font-extrabold text-zinc-950">{testimonial.name}</p>
                <p className="mt-1 text-sm font-semibold text-zinc-500">{testimonial.event}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
