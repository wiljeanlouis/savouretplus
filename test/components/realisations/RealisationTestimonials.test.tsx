import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RealisationDetailPage } from "../../../src/components/realisations/RealisationDetailPage";
import { RealisationTestimonials } from "../../../src/components/realisations/RealisationTestimonials";
import type { Realisation, RealisationTestimonial } from "../../../src/domain/realisation";

// Technical fixtures only: these are never imported into the published manifest.
const testimonial: RealisationTestimonial = {
  quote: "Texte de test — non publiable.\nDeuxième ligne conservée.",
  author: "Auteur de test — non publiable",
};
const realisation: Realisation = {
  id: "test", reference: "REA-0123", slug: "test", title: "Fiche de test",
  description: "Description de test", category: "decoration",
  coverImage: "./images/test.jpg", images: [{ src: "./images/test.jpg", alt: "Image de test" }],
  published: true, displayOrder: 1,
};

describe("realisation testimonials", () => {
  it("renders a labelled section, a semantic quotation and its attribution", () => {
    const html = renderToStaticMarkup(<RealisationTestimonials testimonials={[testimonial]} />);
    const headingId = html.match(/<h2[^>]*id="([^"]+)"/)?.[1];
    expect(headingId).toBeTruthy();
    expect(html).toContain(`aria-labelledby="${headingId}"`);
    expect(html).toContain("Le témoignage de notre client");
    expect(html).toContain(`<blockquote`);
    expect(html).toContain(`<p>${testimonial.quote}</p>`);
    expect(html).toContain("<figcaption");
    expect(html).toContain(testimonial.author);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("whitespace-pre-wrap");
    expect(html).not.toContain("<button");
  });

  it("stacks multiple testimonials within the detail column with a plural heading", () => {
    const html = renderToStaticMarkup(<RealisationTestimonials testimonials={[
      testimonial, { quote: "Deuxième texte de test — non publiable", author: "Autre attribution de test" },
      { quote: "Troisième texte de test — non publiable", author: "Troisième attribution de test" },
    ]} />);
    expect(html.match(/<blockquote/g)).toHaveLength(3);
    expect(html.match(/<figure /g)).toHaveLength(3);
    expect(html).toContain("Les témoignages de nos clients");
    expect(html).not.toContain("Le témoignage de notre client");
    expect(html).toContain("grid grid-cols-1 gap-5");
    expect(html).not.toContain("md:grid-cols-2");
    expect(html).toContain("min-w-0");
    expect(html).toContain("[overflow-wrap:anywhere]");
  });

  it("preserves long content and allows wrapping in the constrained column", () => {
    const quote = "Texte long de test. ".repeat(100) + "mot".repeat(100);
    const author = "Attribution".repeat(50);
    const html = renderToStaticMarkup(<RealisationTestimonials testimonials={[{ quote, author }]} />);
    expect(html).toContain(`<p>${quote}</p>`);
    expect(html).toContain(author);
    expect(html.match(/\[overflow-wrap:anywhere\]/g)).toHaveLength(2);
    expect(html).toContain("min-w-0");
    expect(html).not.toContain("line-clamp");
    expect(html).not.toContain("truncate");
  });

  it.each([undefined, []])("omits the entire section without testimonials (%j)", (testimonials) => {
    expect(renderToStaticMarkup(<RealisationTestimonials testimonials={testimonials} />)).toBe("");
    const html = renderToStaticMarkup(<RealisationDetailPage slug="test" realisations={[{ ...realisation, testimonials }]} />);
    expect(html).not.toContain("Le témoignage de notre client");
    expect(html).not.toContain("<blockquote");
  });

  it.each([
    { context: "Contexte de test" },
    { date: "Date de test" },
    { context: "Contexte de test", date: "Date de test" },
    {},
  ])("renders only the provided optional fields (%j)", (optional) => {
    const html = renderToStaticMarkup(<RealisationTestimonials testimonials={[{ ...testimonial, ...optional }]} />);
    expect(html.includes("Contexte de test")).toBe("context" in optional);
    expect(html.includes("Date de test")).toBe("date" in optional);
    expect(html).not.toContain("undefined");
    expect(html).not.toContain("À préciser");
  });

  it("places testimonials inside the right column after the reference and escapes HTML", () => {
    const html = renderToStaticMarkup(<RealisationDetailPage slug="test" realisations={[{
      ...realisation, testimonials: [{ ...testimonial, quote: "<script>texte de test</script>" }],
    }]} />);
    const rightColumnStart = html.indexOf('class="min-w-0 lg:sticky lg:top-28"');
    const sectionStart = html.indexOf('<section', rightColumnStart);
    expect(rightColumnStart).toBeGreaterThan(-1);
    expect(sectionStart).toBeGreaterThan(rightColumnStart);
    expect(html).toContain('</section></div></div></div>');
    expect(html.match(/Le témoignage de notre client/g)).toHaveLength(1);
    expect(html.indexOf("Le témoignage de notre client")).toBeGreaterThan(html.indexOf("Copier la référence"));
    expect(html).toContain("&lt;script&gt;texte de test&lt;/script&gt;");
    expect(html).not.toContain("<script>");
  });
});
