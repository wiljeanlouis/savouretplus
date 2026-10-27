import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RealisationDetail, RealisationGallery } from "../../../src/components/realisations/RealisationDetailPage";
import { RealisationLightbox } from "../../../src/components/realisations/RealisationLightbox";
import { Button } from "../../../src/components/ui/button";
import type { Realisation } from "../../../src/domain/realisation";

// Exercise the component's event handlers and subsequent render without a DOM dependency.
const state = vi.hoisted(() => ({ values: [] as unknown[], cursor: 0 }));
vi.mock("react", async (importOriginal) => ({
  ...await importOriginal<typeof import("react")>(),
  useState: (initial: unknown) => {
    const index = state.cursor++;
    if (index >= state.values.length) state.values[index] = initial;
    return [state.values[index], (value: unknown) => {
      state.values[index] = typeof value === "function" ? value(state.values[index]) : value;
    }];
  },
  useRef: (initial: unknown) => ({ current: initial }),
}));

const realisation: Realisation = {
  id: "gallery", reference: "REA-0123", slug: "gallery", title: "Galerie test",
  description: "Description test", category: "decoration", coverImage: "./images/one.jpg",
  images: [
    { src: "./images/one.jpg", alt: "Vue principale" },
    { src: "./images/two.jpg", alt: "Vue secondaire", caption: "Légende éditoriale" },
    { src: "./images/three.jpg", alt: "Vue de détail", caption: " " },
  ],
  published: true, displayOrder: 1,
};

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
function renderDetail() {
  state.cursor = 0;
  return RealisationDetail({ realisation });
}
function gallery(tree: ReactNode) {
  return find(tree, (element) => element.type === RealisationGallery);
}
function galleryHtml(tree: ReactNode) {
  return renderToStaticMarkup(gallery(tree));
}

afterEach(() => {
  state.values = [];
  vi.unstubAllGlobals();
});

describe("realisation interactions", () => {
  it("copies the exact public reference and announces success accessibly", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const tree = renderDetail();
    const copy = find(tree, (element) => element.type === Button);
    await copy.props.onClick();
    expect(writeText).toHaveBeenCalledWith("REA-0123");
    const html = renderToStaticMarkup(renderDetail());
    expect(html).toContain('role="status" aria-live="polite" aria-atomic="true"');
    expect(html).toContain("Référence REA-0123 copiée.");
    expect(copy.props.type).toBe("button");
    expect(copy.props["aria-label"]).toBe("Copier la référence REA-0123");
    expect(copy.props.variant).toBe("ghost");
    expect(copy.props.size).toBe("icon");
    const controlHtml = renderToStaticMarkup(copy);
    expect(controlHtml).toContain("focus-visible:ring-2");
    expect(controlHtml).toContain("h-11 w-11");
    expect(controlHtml).toContain('aria-hidden="true"');
    expect(controlHtml).not.toContain(">Copier la référence");
  });

  it("keeps the reference readable without reserving visible space for empty feedback", () => {
    const html = renderToStaticMarkup(renderDetail());
    expect(html).toContain("Référence : REA-0123");
    expect(html).toContain('<p class="sr-only" role="status" aria-live="polite" aria-atomic="true"></p>');
    expect(html).not.toContain("min-h-10");
    expect(html).toContain("Mentionnez cette référence lors de votre commande ou de votre demande de soumission.");
  });

  it.each(["unavailable", "denied"])("offers manual copy when the clipboard is %s", async (reason) => {
    const writeText = vi.fn().mockRejectedValue(new Error("Denied"));
    vi.stubGlobal("navigator", reason === "unavailable" ? {} : { clipboard: { writeText } });
    const copy = find(renderDetail(), (element) => element.type === Button);
    await copy.props.onClick();
    const html = renderToStaticMarkup(renderDetail());
    expect(html).toContain("Copie impossible. Sélectionnez et copiez la référence REA-0123 manuellement.");
    expect(html).not.toContain("copiée.");
  });

  it("updates the caption and alt through thumbnails, with a single visible caption", () => {
    let tree = renderDetail();
    expect(galleryHtml(tree)).toMatch(/<figcaption[^>]*>Vue principale<\/figcaption>/);
    let controls = RealisationGallery(gallery(tree).props as any);
    const second = find(controls, (element) => element.props["aria-label"] === "Afficher la photographie 2");
    second.props.onClick();
    tree = renderDetail();
    let html = galleryHtml(tree);
    expect(html).toMatch(/<figcaption[^>]*>Légende éditoriale<\/figcaption>/);
    expect(html.match(/Légende éditoriale/g)).toHaveLength(1);
    expect(html).toContain('alt="Vue secondaire"');
    expect(html).toContain('aria-label="Afficher la photographie 2" aria-pressed="true"');
    expect(html).not.toMatch(/<figcaption[^>]*>Vue secondaire/);
    controls = RealisationGallery(gallery(tree).props as any);
    find(controls, (element) => element.props["aria-label"] === "Afficher la photographie 3").props.onClick();
    html = galleryHtml(renderDetail());
    expect(html).toMatch(/<figcaption[^>]*>Vue de détail<\/figcaption>/);
  });

  it("keeps the active photo and caption in sync after lightbox navigation", () => {
    let tree = renderDetail();
    gallery(tree).props.onOpen(null);
    tree = renderDetail();
    const lightbox = find(tree, (element) => element.type === RealisationLightbox);
    expect(renderToStaticMarkup(lightbox)).toContain('aria-label="Photographie suivante"');
    expect(renderToStaticMarkup(lightbox)).toContain('aria-label="Fermer la galerie"');
    expect(renderToStaticMarkup(lightbox)).toMatch(/<figcaption[^>]*>Vue principale<\/figcaption>/);
    lightbox.props.onNavigate(1);
    tree = renderDetail();
    expect(galleryHtml(tree)).toMatch(/<figcaption[^>]*>Légende éditoriale<\/figcaption>/);
    expect(renderToStaticMarkup(find(tree, (element) => element.type === RealisationLightbox)))
      .toContain('alt="Vue secondaire"');
    const nextLightbox = find(tree, (element) => element.type === RealisationLightbox);
    const html = renderToStaticMarkup(nextLightbox);
    expect(html).toMatch(/<figcaption[^>]*>Légende éditoriale<\/figcaption>/);
    expect(html.match(/Légende éditoriale/g)).toHaveLength(1);
    nextLightbox.props.onNavigate(1);
    tree = renderDetail();
    expect(renderToStaticMarkup(find(tree, (element) => element.type === RealisationLightbox)))
      .toMatch(/<figcaption[^>]*>Vue de détail<\/figcaption>/);
    find(tree, (element) => element.type === RealisationLightbox).props.onClose();
    expect(find(renderDetail(), (element) => element.type === RealisationLightbox)).toBeUndefined();
    expect(galleryHtml(renderDetail())).toContain("Vue de détail");
  });
});
