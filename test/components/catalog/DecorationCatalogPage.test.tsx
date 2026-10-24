import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { CatalogProduct } from "../../../src/domain/catalog";
import {
  DecorationCatalogEmptyState,
  DecorationCatalogErrorState,
  DecorationCatalogLoadingState,
  DecorationCatalogPage,
  DecorationProductCollection,
} from "../../../src/components/catalog/page/DecorationCatalogPage";

function decorationProduct(id: string): CatalogProduct {
  return {
    id,
    bom_id: id,
    slug: `modele-${id}`,
    name: `Modèle ${id}`,
    category: "decoration",
    subcategory: "wedding",
    description: `Description ${id}`,
    product_type: "standard",
    purchase_modes: [
      { id: "unit", label: "Unité", quantity: 1, price_cents: 12500, allocation_type: "none" },
    ],
    choice_group: null,
    ingredient_options: [],
    image_url: `/decor-${id}.jpg`,
    gallery: [`/decor-${id}.jpg`],
    availability_note: "Sur demande",
  };
}

describe("UI-2.1A decoration catalogue", () => {
  it("uses a square-edged skeleton matching the decoration cards", () => {
    const html = renderToStaticMarkup(<DecorationCatalogLoadingState />);

    expect(html).toContain('aria-label="Chargement des décorations"');
    expect(html).toContain("xl:grid-cols-3");
    expect(html).toContain("aspect-[4/3]");
    expect(html).not.toContain("rounded-3xl");
    expect(html).not.toContain("rounded-2xl");
  });

  it("renders an elegant empty state with the custom quote destination", () => {
    const html = renderToStaticMarkup(<DecorationCatalogEmptyState />);

    expect(html).toContain("Aucun article n&#x27;est publié");
    expect(html).toContain("#/soumission?service=decoration");
  });

  it("uses an editorial layout for one published article", () => {
    const html = renderToStaticMarkup(
      <DecorationProductCollection products={[decorationProduct("one")]} />,
    );

    expect(html).toContain("lg:grid-cols-[1.15fr_0.85fr]");
    expect(html).toContain("#/decoration/modele-one");
    expect(html).toContain("Voir le détail");
    expect(html).toContain("object-cover");
    expect(html).not.toContain("125,00");
  });

  it("uses at most three columns for multiple published articles", () => {
    const html = renderToStaticMarkup(
      <DecorationProductCollection
        products={[decorationProduct("one"), decorationProduct("two"), decorationProduct("three")]}
      />,
    );

    expect(html).toContain("xl:grid-cols-3");
    expect(html.match(/Voir le détail/g)).toHaveLength(3);
  });

  it("offers selection without inventing a decoration price", () => {
    const html = renderToStaticMarkup(
      <DecorationProductCollection products={[decorationProduct("one")]} onSelect={vi.fn()} />,
    );

    expect(html).toContain("Ajouter à ma sélection");
    expect(html).toContain("editorial-link");
    expect(html).toContain('aria-label="Consulter la fiche de Modèle one"');
    expect(html.match(/href="#\/decoration\/modele-one"/g)).toHaveLength(3);
    expect(html).not.toContain("Demander une soumission");
    expect(html).not.toContain("125,00");
  });

  it("aligns compact card actions at the bottom", () => {
    const html = renderToStaticMarkup(
      <DecorationProductCollection
        products={[decorationProduct("one"), decorationProduct("two")]}
        onSelect={vi.fn()}
      />,
    );

    expect(html.match(/mt-auto pt-7/g)).toHaveLength(2);
    expect(html.match(/Ajouter à ma sélection/g)).toHaveLength(2);
    expect(html.match(/<button/g)).toHaveLength(2);
  });

  it("distinguishes a catalogue error from an empty catalogue", () => {
    const errorHtml = renderToStaticMarkup(<DecorationCatalogErrorState onRetry={vi.fn()} />);
    const emptyHtml = renderToStaticMarkup(<DecorationCatalogEmptyState />);

    expect(errorHtml).toContain("La collection ne peut pas être chargée");
    expect(errorHtml).toContain("Réessayer");
    expect(emptyHtml).not.toContain("Réessayer");
  });

  it("keeps the hero and custom-decoration CTAs on the catalogue page", () => {
    const html = renderToStaticMarkup(<DecorationCatalogPage />);

    expect(html).toContain("Imaginer mon décor");
    expect(html).toContain("Explorer nos décorations");
    expect(html).toContain("Un décor imaginé pour vous");
    expect(html).toContain("Demander une décoration sur mesure");
    expect(html).toContain("Fait à la main avec amour");
  });
});
