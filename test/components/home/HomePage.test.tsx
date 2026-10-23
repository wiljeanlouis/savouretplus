import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HomePage } from "../../../src/components/home/HomePage";
import { realizationPhotos } from "../../../src/components/home/homeContent";
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
    expect(html).not.toContain('href="#/services"');
    expect(html).not.toContain('href="#/realisations"');
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
    expect(realizationPhotos).toHaveLength(4);
    expect(realizationPhotos.every((photo) => !photo.src.includes("ambient-"))).toBe(true);

    const html = renderToStaticMarkup(<HomePage />);
    expect(html).toContain("col-span-2 row-span-2");
    expect(html).toContain("Dans les coulisses");
  });
});

describe("UI-1 header", () => {
  it("preserves the cart and quote destinations and marks the active route", () => {
    const html = renderToStaticMarkup(<Header activeRoute="accueil" cartCount={2} />);

    expect(html).toContain('href="#/panier"');
    expect(html).toContain("Voir le panier, 2 articles");
    expect(html).toContain('href="#/soumission"');
    expect(html).toContain("Demander une soumission");
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("section=realisations");
  });
});
