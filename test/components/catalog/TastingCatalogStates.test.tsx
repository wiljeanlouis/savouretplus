import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  AddedToCartNotice,
  CatalogEmptyState,
  CatalogErrorState,
} from "../../../src/components/catalog/page/TastingCatalogPage";

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
});
