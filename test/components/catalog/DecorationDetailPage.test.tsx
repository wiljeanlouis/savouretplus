import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { CatalogProduct } from "../../../src/domain/catalog";
import {
  DecorationDetailContent,
  DecorationDetailLoadingState,
  DecorationDetailUnavailableState,
} from "../../../src/components/catalog/page/DecorationDetailPage";
import { createDecorationQuoteItem } from "../../../src/domain/quote";

const product: CatalogProduct = {
  id: "offering-42",
  bom_id: "bom-42",
  slug: "arche-romantique",
  name: "Arche romantique",
  category: "decoration",
  subcategory: "decorative-arch",
  description: "Une arche florale délicate.",
  product_type: "standard",
  purchase_modes: [
    { id: "unit", label: "Location spéciale", quantity: 1, price_cents: 99900, allocation_type: "none" },
  ],
  choice_group: null,
  ingredient_options: [],
  image_url: "/arche-1.jpg",
  gallery: ["/arche-1.jpg", "/arche-2.jpg"],
  availability_note: "Sur demande",
};

describe("UI-2.1A decoration detail", () => {
  it("uses a loading skeleton that mirrors the detail layout", () => {
    const html = renderToStaticMarkup(<DecorationDetailLoadingState />);

    expect(html).toContain('aria-label="Chargement de la décoration"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain("lg:grid-cols-[1.08fr_0.92fr]");
    expect(html).toContain("h-[22rem]");
    expect(html).toContain("max-h-[38rem]");
    expect(html).not.toContain("aspect-[4/3]");
    expect(html).not.toContain("xl:grid-cols-3");
  });

  it("shows published information, gallery, breadcrumb, and quote action", () => {
    const html = renderToStaticMarkup(
      <DecorationDetailContent product={product} onSelect={() => undefined} />,
    );

    expect(html).toContain("Arche romantique");
    expect(html).toContain("Arche décorative");
    expect(html).toContain("Image suivante");
    expect(html).toContain('href="#/decoration"');
    expect(html).toContain("item=arche-romantique");
    expect(html).toContain("Sur demande");
    expect(html).toContain("rounded-none");
    expect(html).toContain("object-contain");
    expect(html).toContain("h-auto w-full object-contain");
    expect(html).not.toContain("max-h-[38rem]");
    expect(html).not.toContain("object-cover");
    expect(html).not.toContain("rounded-xl");
    expect(html).toContain("Ajouter à ma sélection");
    expect(html).toContain("Préférences");
    expect(html).toContain(
      'class="editorial-link mt-5" href="#/soumission?service=decoration&amp;item=arche-romantique"',
    );
  });

  it("does not invent a price or a commercial mode", () => {
    const html = renderToStaticMarkup(<DecorationDetailContent product={product} />);

    expect(html).not.toContain("999,00");
    expect(html).not.toContain("Location spéciale");
    expect(html).not.toContain("Achat");
  });

  it("keeps the business identifier as offering_id for the existing submission contract", () => {
    expect(createDecorationQuoteItem(product)).toMatchObject({
      offering_id: "offering-42",
      configuration: { catalog_slug: "arche-romantique" },
    });
  });

  it("renders a safe state for an unknown or unpublished article", () => {
    const html = renderToStaticMarkup(<DecorationDetailUnavailableState />);

    expect(html).toContain("n&#x27;est plus disponible");
    expect(html).toContain('href="#/decoration"');
    expect(html).toContain("#/soumission?service=decoration");
  });
});
