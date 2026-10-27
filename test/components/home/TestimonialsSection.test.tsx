import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestimonialsSection } from "../../../src/components/home/TestimonialsSection";
import { getHomeRealisationTestimonials, type Realisation } from "../../../src/domain/realisation";

// Local technical fixtures, never imported into the content manifest.
const state = vi.hoisted(() => ({ active: 0 }));
vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useState: () => [state.active, (value: number | ((current: number) => number)) => {
    state.active = typeof value === "function" ? value(state.active) : value;
  }],
}));
const realisation: Realisation = {
  id: "technical", reference: "REA-0100", slug: "technical", title: "Titre technique", description: "Description technique",
  category: "decoration", coverImage: "./images/cover.jpg", published: true, displayOrder: 1,
  images: [{ src: "./images/cover.jpg", alt: "Photo technique" }, { src: "./images/detail.jpg", alt: "Détail technique" }],
  testimonials: [
    { quote: "Premier texte technique\nnon publiable", author: "Attribution de test", context: "Contexte de test", date: "Date de test", featuredOnHome: true },
    { quote: "Deuxième texte technique", author: "Attribution de test", featuredOnHome: true, homeImageSrc: "./images/detail.jpg" },
    { quote: "Troisième texte technique", author: "Autre attribution de test", featuredOnHome: true },
  ],
};
const entries = getHomeRealisationTestimonials([realisation]);
type Element = ReactElement<Record<string, any>>;
function find(node: ReactNode, predicate: (element: Element) => boolean): Element {
  for (const child of Children.toArray(node)) {
    if (!isValidElement(child)) continue;
    const element = child as Element;
    if (predicate(element)) return element;
    const found = find(element.props.children, predicate);
    if (found) return found;
  }
}
function tree(testimonials = entries) { return TestimonialsSection({ testimonials }); }
function activeHtml() {
  return renderToStaticMarkup(find(tree(), (element) => element.props.className?.includes("[grid-area:1/1]") && !element.props["aria-hidden"]));
}
function click(label: string) { find(tree(), (element) => element.props["aria-label"] === label).props.onClick(); }
afterEach(() => { state.active = 0; });

describe("home testimonial carousel", () => {
  it("renders the original quote, attribution, metadata, reference and realisation link", () => {
    const html = activeHtml();
    expect(html).toContain(realisation.testimonials[0].quote);
    expect(html).toContain("Attribution de test");
    expect(html).toContain("Contexte de test");
    expect(html).toContain("Date de test");
    expect(html).toContain("Réf. REA-0100");
    expect(html).toContain('href="#/realisations/technical"');
    expect(html).toContain("Voir cette réalisation");
    expect(html).toContain("editorial-link");
    expect(html).toContain("<blockquote");
    expect(html).toContain("<figcaption");
    expect(html).toContain('src="./images/cover.jpg" alt="Photo technique"');
    expect(html).toContain('width="160" height="160" loading="lazy" decoding="async"');
  });

  it("puts the editorial quote and attribution before a small secondary photograph", () => {
    const html = activeHtml();
    expect(html.indexOf("<blockquote")).toBeLessThan(html.indexOf("<img"));
    expect(html.indexOf("Voir cette réalisation")).toBeLessThan(html.indexOf("<img"));
    expect(html).toContain("font-serif text-2xl");
    expect(html).toContain("aspect-square w-20");
    expect(html).toContain("lg:w-28");
  });

  it("renders no empty card or controls without selected testimonials", () => {
    expect(renderToStaticMarkup(tree([]))).toBe("");
  });

  it("hides all navigation controls for one testimonial", () => {
    const html = renderToStaticMarkup(tree(entries.slice(0, 1)));
    expect(html).toContain("Premier texte technique");
    expect(html).toContain('aria-labelledby="home-testimonials-title"');
    expect(html).toContain("Ils nous ont fait confiance");
    expect(html).toContain("Les témoignages de nos clients");
    expect(html).toContain('<div class="container-page">');
    expect(html).not.toContain("<button");
    expect(html).not.toContain("Choisir un témoignage");
  });

  it("navigates forward, backward with wrapping, and directly through indicators", () => {
    click("Témoignage suivant");
    expect(activeHtml()).toContain("Deuxième texte technique");
    expect(activeHtml()).toContain('src="./images/detail.jpg" alt="Détail technique"');
    expect(activeHtml()).not.toContain("Contexte de test");
    click("Témoignage précédent");
    expect(activeHtml()).toContain("Premier texte technique");
    click("Témoignage précédent");
    expect(activeHtml()).toContain("Troisième texte technique");
    click("Témoignage suivant");
    expect(activeHtml()).toContain("Premier texte technique");
    click("Afficher le témoignage 2 de Attribution de test (REA-0100)");
    expect(activeHtml()).toContain("Deuxième texte technique");
    const indicator = find(tree(), (element) => element.props["aria-label"] === "Afficher le témoignage 2 de Attribution de test (REA-0100)");
    expect(indicator.props["aria-current"]).toBe("true");
  });

  it("keeps inactive slides out of the accessibility tree and keyboard order, loading only the active image", () => {
    const html = renderToStaticMarkup(tree());
    expect(html).toContain('aria-live="polite" aria-atomic="true"');
    expect(html.match(/aria-hidden="true" inert=""/g)).toHaveLength(2);
    expect(html.match(/tabindex="-1"/g)).toHaveLength(2);
    expect(html.match(/<img /g)).toHaveLength(1);
    expect(html).toContain("focus-visible:ring-2");
    expect(html).toContain("motion-reduce:transition-none");
    const before = activeHtml();
    vi.useFakeTimers();
    vi.advanceTimersByTime(60_000);
    expect(activeHtml()).toBe(before);
    vi.useRealTimers();
  });

  it("reserves room for all quotes and supports full long text without truncation", () => {
    const quote = "Texte technique long. ".repeat(100) + "mot".repeat(200);
    const testimonials = getHomeRealisationTestimonials([{ ...realisation, testimonials: [
      { ...realisation.testimonials[0], quote }, realisation.testimonials[1],
    ] }]);
    const html = renderToStaticMarkup(tree(testimonials));
    expect(html).toContain(quote);
    expect(html.match(/\[grid-area:1\/1\]/g)).toHaveLength(2);
    expect(html).toContain("[overflow-wrap:anywhere]");
    expect(html).toContain("sm:grid-cols-[minmax(0,1fr)_5rem]");
    expect(html).toContain("lg:grid-cols-[minmax(0,1fr)_7rem]");
    expect(html).not.toContain("line-clamp");
    expect(html).not.toContain("truncate");
  });
});
