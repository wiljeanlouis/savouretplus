import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductGallery } from "../../../src/components/catalog/ProductGallery";

describe("ProductGallery", () => {
  it("renders an accessible lazy-loaded gallery without duplicating the fallback image", () => {
    const html = renderToStaticMarkup(
      <ProductGallery
        images={["/photo-1.png", "/photo-2.png"]}
        fallbackImage="/photo-1.png"
        productName="Pâté maison"
      />,
    );

    expect(html).toContain('loading="lazy"');
    expect(html).toContain("Pâté maison — image 1 sur 2");
    expect(html).toContain("Image suivante de Pâté maison");
    expect(html.match(/Voir l&#x27;image/g)).toHaveLength(2);
  });

  it("shows an elegant replacement when no image is available", () => {
    const html = renderToStaticMarkup(<ProductGallery productName="Produit sans photo" />);

    expect(html).toContain("Photographie à venir");
    expect(html).toContain("Photographie de Produit sans photo non disponible");
  });
});
