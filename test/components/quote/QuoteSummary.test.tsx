import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { QuoteHero, QuoteSummary } from "../../../src/components/quote/QuotePage";
import type { CatalogProduct } from "../../../src/domain/catalog";

const form = {
  event_type: "Mariage",
  event_date: "2027-06-12",
  event_address: "Montréal",
  guest_count: "80",
  budget: "1000$ et plus",
};

const decoration: CatalogProduct = {
  id: "decor-42",
  bom_id: "decor-42",
  slug: "arche-romantique",
  name: "Arche romantique",
  category: "decoration",
  subcategory: "wedding",
  description: "",
  product_type: "standard",
  purchase_modes: [],
  choice_group: null,
  ingredient_options: [],
  image_url: "/arche.png",
  gallery: ["/arche.png"],
  availability_note: "Sur demande",
};

describe("QuoteSummary", () => {
  it("uses the light C2 quote hero without changing the form route", () => {
    const html = renderToStaticMarkup(<QuoteHero />);

    expect(html).toContain("Parlons de votre événement.");
    expect(html).toContain("bg-white");
    expect(html).not.toContain("BreadcrumbHero");
  });

  it("presents the selected service, model reference, event, and catering count", () => {
    const html = renderToStaticMarkup(
      <QuoteSummary
        requestLabel="Décoration + organisation + traiteur"
        form={form}
        selectedDecoration={decoration}
        selectedCateringItemsCount={2}
        includesGuestCount
      />,
    );

    expect(html).toContain("Résumé de la demande");
    expect(html).toContain("Arche romantique (arche-romantique)");
    expect(html).toContain("12 juin 2027");
    expect(html).toContain("80");
    expect(html).toContain("2 sélectionnés");
  });

  it("does not show irrelevant guest or catering information for decoration only", () => {
    const html = renderToStaticMarkup(
      <QuoteSummary
        requestLabel="Décoration"
        form={form}
        selectedDecoration={null}
        selectedCateringItemsCount={0}
        includesGuestCount={false}
      />,
    );

    expect(html).not.toContain("Invités");
    expect(html).not.toContain("Items traiteur");
  });
});
