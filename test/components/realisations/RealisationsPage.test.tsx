import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { RealisationDetailPage } from "../../../src/components/realisations/RealisationDetailPage";
import { RealisationEmptyState, RealisationsPage } from "../../../src/components/realisations/RealisationsPage";
import type { Realisation } from "../../../src/domain/realisation";

const multiImageRealisation: Realisation = {
  id: "multi",
  reference: "REA-0100",
  slug: "galerie-multiple",
  title: "Galerie multiple",
  description: "Une réalisation avec plusieurs vues.",
  category: "decoration",
  coverImage: "./images/one.jpg",
  images: [
    { src: "./images/one.jpg", alt: "Vue principale", displayOrder: 1 },
    { src: "./images/two.jpg", alt: "Vue secondaire", displayOrder: 2 },
    { src: "./images/three.jpg", alt: "Vue de détail", displayOrder: 3 },
  ],
  published: true,
  displayOrder: 1,
  quoteService: "decoration",
};

describe("UI-2.4 realisations portfolio", () => {
  it("renders published cards, their categories and detail links", () => {
    const html = renderToStaticMarkup(<RealisationsPage />);

    expect(html).toContain("Nos réalisations");
    expect(html).toContain("Décoration");
    expect(html).toContain('href="#/realisations/grand-opening-soul-store"');
    expect(html).toContain('href="#/realisations/anniversaire-winnie"');
    expect(html).toContain('href="#/realisations/anniversaire-marvensley"');
    expect(html).toContain('href="#/realisations/decor-colonne-ballons-rouge-blanc"');
    expect(html).toContain('href="#/realisations/bouquet-cadeau-billets-bleu-or"');
    for (const reference of ["REA-0001", "REA-0002", "REA-0003", "REA-0004", "REA-0005"]) {
      expect(html).toContain(`Réf. ${reference}`);
    }
    expect(html).not.toContain('aria-label="Filtrer les réalisations"');
    expect(html).toContain("py-9 text-center sm:py-10 lg:py-11");
  });

  it("renders a useful global empty state", () => {
    const html = renderToStaticMarkup(<RealisationsPage realisations={[]} />);
    const emptyHtml = renderToStaticMarkup(<RealisationEmptyState />);

    expect(html).toContain("De nouvelles réalisations seront ajoutées prochainement");
    expect(emptyHtml).toContain('href="#/soumission"');
  });

  it.each([1, 2, 3, 4, 7])("keeps a stable grid for %i published realisations", (count) => {
    const realisations = Array.from({ length: count }, (_, index) => ({
      ...multiImageRealisation,
      id: `realisation-${index}`,
      slug: `realisation-${index}`,
      title: `Réalisation ${index + 1}`,
      displayOrder: index + 1,
    }));
    const html = renderToStaticMarkup(<RealisationsPage realisations={realisations} />);

    expect(html.match(/Voir la réalisation/g)).toHaveLength(count);
    expect(html).toContain("items-start");
    expect(html).toContain("sm:grid-cols-2");
    expect(html).toContain("xl:grid-cols-3");
  });

  it("supports a multi-image detail gallery with a reference instead of a quote CTA", () => {
    const html = renderToStaticMarkup(
      <RealisationDetailPage slug="galerie-multiple" realisations={[multiImageRealisation]} />,
    );

    expect(html).toContain("Vue principale");
    expect(html).toContain("Afficher la photographie 2");
    expect(html).toContain("Afficher la photographie 3");
    expect(html).not.toContain("Demander une soumission");
    expect(html).not.toContain('href="#/soumission');
    expect(html).not.toContain("Cette réalisation sert");
    expect(html).toContain("Référence : REA-0100");
    expect(html).toContain("Copier la référence");
    expect(html).toContain('role="status"');
    expect(html).toContain("Mentionnez cette référence lors de votre commande ou de votre demande de soumission.");
    expect(html).toContain('<figcaption');
    expect(html).toContain('alt="Vue principale"');
    expect(html).toContain('href="#/realisations"');
  });

  it("renders a single photograph without unnecessary thumbnails", () => {
    const single = { ...multiImageRealisation, images: [multiImageRealisation.images[0]] };
    const html = renderToStaticMarkup(
      <RealisationDetailPage slug="galerie-multiple" realisations={[single]} />,
    );

    expect(html).toContain("Agrandir Vue principale");
    expect(html).not.toContain("Afficher la photographie 1");
  });

  it("does not expose unknown or unpublished slugs", () => {
    const hidden = { ...multiImageRealisation, published: false };
    const unknownHtml = renderToStaticMarkup(
      <RealisationDetailPage slug="absente" realisations={[multiImageRealisation]} />,
    );
    const hiddenHtml = renderToStaticMarkup(
      <RealisationDetailPage slug="galerie-multiple" realisations={[hidden]} />,
    );

    expect(unknownHtml).toContain("Cette réalisation n&#x27;est pas disponible");
    expect(hiddenHtml).toContain("Cette réalisation n&#x27;est pas disponible");
  });
});
