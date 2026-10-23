import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  AddedToCartNotice,
  CateringServiceSection,
  CatalogEmptyState,
  CatalogErrorState,
  CombinedServicesSection,
  TastingHero,
} from "../../../src/components/catalog/page/TastingCatalogPage";
import { CatalogLoadingState } from "../../../src/components/catalog/CatalogLoadingState";

describe("Tasting catalog states", () => {
  it("distinguishes a loading error from an empty published catalog", () => {
    const errorHtml = renderToStaticMarkup(<CatalogErrorState onRetry={vi.fn()} />);
    const emptyHtml = renderToStaticMarkup(<CatalogEmptyState />);

    expect(errorHtml).toContain("Le catalogue ne peut pas être chargé");
    expect(errorHtml).toContain("Réessayer");
    expect(emptyHtml).toContain("aucun produit publié");
    expect(emptyHtml).not.toContain("Réessayer");
  });

  it("confirms the product and quantity added with a cart action", () => {
    const html = renderToStaticMarkup(
      <AddedToCartNotice item={{ name: "Pâté kòde", quantity: 2 }} onDismiss={vi.fn()} />,
    );

    expect(html).toContain("2 × Pâté kòde");
    expect(html).toContain("Ajouté à ma sélection");
    expect(html).toContain("Voir ma sélection");
    expect(html).toContain("#/panier");
    expect(html).toContain('role="status"');
  });

  it("presents ordering and catering as two explicit hero paths", () => {
    const html = renderToStaticMarkup(<TastingHero />);

    expect(html).toContain("Des saveurs à partager, des moments à célébrer.");
    expect(html).toContain("Commander nos spécialités");
    expect(html).toContain("#/degustation?section=catalogue-degustation");
    expect(html).toContain("Demander un service traiteur");
    expect(html).toContain("#/soumission?service=traiteur");
    expect(html).toContain("Photographie SavouretPlus");
  });

  it("keeps catering autonomous and links the conclusion to mixed planning", () => {
    const cateringHtml = renderToStaticMarkup(<CateringServiceSection />);
    const combinedHtml = renderToStaticMarkup(<CombinedServicesSection />);

    expect(cateringHtml).toContain("Service traiteur événementiel");
    expect(cateringHtml).toContain("Demander une soumission traiteur");
    expect(cateringHtml.match(/<figure/g)).toHaveLength(3);
    expect(combinedHtml).toContain("Planifier une demande mixte");
    expect(combinedHtml).toContain("#/soumission?service=traiteur-decoration");
    expect(combinedHtml).toContain("#/panier");
  });

  it("uses an angular loading state aligned with the final tasting cards", () => {
    const html = renderToStaticMarkup(<CatalogLoadingState />);

    expect(html).toContain("aspect-[4/3]");
    expect(html).toContain("border-blush/50");
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain("rounded-3xl");
  });
});
