import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomePage } from "../../../src/components/home/HomePage";
import { publishedRealisations } from "../../../src/content/realisations";
import { Footer } from "../../../src/components/layout/Footer";
import { Header } from "../../../src/components/layout/Header";

describe("UI-1 home page", () => {
  it("renders the C2 editorial hierarchy and only existing commercial routes", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("Des moments inoubliables, à votre image");
    expect(html).toContain("Trois expertises, une même passion");
    expect(html).toContain('id="realisations"');
    expect(html).toContain("L&#x27;art de recevoir, le plaisir de savourer");
    expect(html).toContain("expérience gastronomique raffinée");
    expect(html).toContain("Saveurs et gourmandises");
    expect(html).toContain("Prêts à planifier votre prochain événement ?");
    expect(html).toContain('href="#/decoration"');
    expect(html).toContain('href="#/degustation"');
    expect(html).toContain('href="#/soumission"');
    expect(html).toContain('href="#/services"');
    expect(html).toContain('href="#/realisations"');
  });

  it("separates full-width commitments and testimonials before the final CTA", () => {
    const html = renderToStaticMarkup(<HomePage />);
    for (const title of ["Service sur mesure", "Gastronomie authentique", "Accompagnement personnalisé", "Attention aux détails"]) {
      expect(html).toContain(title);
    }
    expect(html).toContain('aria-label="Témoignages"');
    expect(html).not.toContain("Témoignage fictif");
    expect(html).not.toContain("xl:grid-cols-[1.45fr_0.75fr]");
    expect(html).toContain("sm:grid-cols-2 lg:grid-cols-4");
    expect(html).toContain("Ils nous ont fait confiance");
    expect(html).toContain("Les témoignages de nos clients");
    const testimonialSection = html.indexOf('aria-labelledby="home-testimonials-title"');
    expect(testimonialSection).toBeGreaterThan(html.indexOf("Attention aux détails"));
    expect(testimonialSection).toBeLessThan(html.indexOf("Prêts à planifier votre prochain événement ?"));
    expect(html).toMatch(/<\/section><section[^>]+aria-labelledby="home-testimonials-title"><div class="container-page">/);
  });

  it("removes the video section and preserves social links in the footer", () => {
    const html = renderToStaticMarkup(<HomePage />);
    expect(html).not.toContain("Dans les coulisses");
    expect(html).not.toContain("home-videos-title");
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("<script");
    const footer = renderToStaticMarkup(<Footer />);
    for (const url of ["https://www.tiktok.com/@savouretplus", "https://youtube.com/@SavourEtplus"]) {
      expect(footer).toContain(`href="${url}" target="_blank" rel="noopener noreferrer"`);
    }
  });

  it("loads the hero image eagerly and defers below-the-fold photographs", () => {
    const html = renderToStaticMarkup(<HomePage />);

    expect(html).toContain("ambient-hero-floral-reception.jpg");
    expect(html).toContain("ambient-gastronomy-table.jpg");
    expect(html).toContain("ambient-handcrafted-canapes.jpg");
    expect(html).toContain('fetchPriority="high"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain("Photographie d&#x27;ambiance");
    expect(html).toContain("Fait à la main avec amour");
  });

  it("keeps stock ambiance photography outside the SavouretPlus realization gallery", () => {
    expect(publishedRealisations.length).toBeGreaterThan(0);
    expect(publishedRealisations.every((realisation) => !realisation.coverImage.includes("ambient-"))).toBe(true);

    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain("col-span-2 row-span-2");
    expect(html).not.toContain("Dans les coulisses");
  });
});

describe("UI-1 header", () => {
  it("preserves the cart and quote destinations and marks the active route", () => {
    const html = renderToStaticMarkup(<Header activeRoute="accueil" cartCount={2} />);

    expect(html).toContain('href="#/panier"');
    expect(html).toContain("Voir ma sélection, 2 articles");
    expect(html).toContain('href="#/soumission"');
    expect(html).toContain('href="#/services"');
    expect(html).toContain("Demander une soumission");
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('href="#/realisations"');
  });

  it("separates service discovery from the direct quote action", () => {
    const html = renderToStaticMarkup(<Header activeRoute="services" cartCount={0} />);

    expect(html).toContain('href="#/services" aria-current="page"');
    expect(html).toContain('href="#/soumission"');
    expect(html).toContain("Demander une soumission");
  });
});
