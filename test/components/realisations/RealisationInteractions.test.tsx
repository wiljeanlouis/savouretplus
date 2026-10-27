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
function renderDetail(item = realisation) {
  state.cursor = 0;
  return RealisationDetail({ realisation: item });
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


describe("multimedia gallery interactions", () => {
  const mixed: Realisation = {
    ...realisation,
    images: realisation.images.map((image, index) => ({ ...image, displayOrder: index * 2 })),
    videos: [
      { type: "video", platform: "youtube", url: "https://youtu.be/test", title: "Vidéo de test", caption: "Légende vidéo", thumbnail: "./images/video.jpg", thumbnailAlt: "Aperçu vidéo", displayOrder: 1 },
      { type: "video", platform: "tiktok", url: "https://www.tiktok.com/@test/video/123", title: "Sans miniature", displayOrder: 3 },
    ],
  };

  it("selects a video without opening it, then exposes only the explicit safe external action", () => {
    const open = vi.fn();
    vi.stubGlobal("open", open);
    let tree = renderDetail(mixed);
    let controls = RealisationGallery(gallery(tree).props as any);
    const select = find(controls, (element) => element.props["aria-label"] === "Afficher la vidéo YouTube : Vidéo de test");
    select.props.onClick();
    tree = renderDetail(mixed);
    const html = galleryHtml(tree);
    expect(open).not.toHaveBeenCalled();
    expect(html).toContain('src="./images/video.jpg"');
    expect(html).toContain('alt="Aperçu vidéo"');
    expect(html).toContain('href="https://youtu.be/test" target="_blank" rel="noopener noreferrer"');
    expect(html).toContain("Voir la vidéo sur YouTube");
    expect(html).toMatch(/<figcaption[^>]*>Légende vidéo<\/figcaption>/);
    expect(html).not.toContain("<iframe");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("Agrandir");
    expect(find(tree, (element) => element.type === RealisationLightbox)).toBeUndefined();
    controls = RealisationGallery(gallery(tree).props as any);
    find(controls, (element) => element.props["aria-label"] === "Afficher la photographie 2").props.onClick();
    tree = renderDetail(mixed);
    expect(galleryHtml(tree)).toContain("Légende éditoriale");
    gallery(tree).props.onOpen(null);
    tree = renderDetail(mixed);
    let lightbox = find(tree, (element) => element.type === RealisationLightbox);
    expect(lightbox.props.images).toHaveLength(3);
    expect(lightbox.props.activeIndex).toBe(1);
    lightbox.props.onNavigate(-1);
    tree = renderDetail(mixed);
    expect(galleryHtml(tree)).toContain("Vue principale");
    lightbox = find(tree, (element) => element.type === RealisationLightbox);
    lightbox.props.onNavigate(-1);
    expect(galleryHtml(renderDetail(mixed))).toContain("Vue de détail");
  });

  it("replaces a failed thumbnail with the accessible fallback", () => {
    const controls = RealisationGallery({
      media: mixed.videos!, activeIndex: 0, title: "Test", onSelect: vi.fn(), onOpen: vi.fn(),
    });
    const preview = find(controls, (element) => element.props.video && !element.props.compact);
    const component = preview.type as (props: any) => Element;
    state.cursor = 0;
    const image = component(preview.props);
    expect(image.type).toBe("img");
    image.props.onError();
    state.cursor = 0;
    const html = renderToStaticMarkup(component(preview.props));
    expect(html).toContain("Aperçu indisponible");
    expect(html).not.toContain("<img");
  });

  it("selects missing-preview TikTok video via keyboard and preserves a stable preview", () => {
    const controls = RealisationGallery(gallery(renderDetail(mixed)).props as any);
    const first = find(controls, (element) => element.props["aria-label"] === "Afficher la photographie 1");
    const preventDefault = vi.fn();
    const focus = vi.fn();
    const event = { key: "ArrowRight", preventDefault, currentTarget: { parentElement: { querySelectorAll: () => [{}, { focus }] } } };
    first.props.onKeyDown(event);
    expect(preventDefault).toHaveBeenCalled();
    expect(focus).toHaveBeenCalled();
    expect(galleryHtml(renderDetail(mixed))).toContain("Voir la vidéo sur YouTube");
    const next = RealisationGallery(gallery(renderDetail(mixed)).props as any);
    find(next, (element) => element.props["aria-label"] === "Afficher la vidéo TikTok : Sans miniature").props.onClick();
    const html = galleryHtml(renderDetail(mixed));
    expect(html).toContain("Aperçu indisponible");
    expect(html).toContain("Voir la vidéo sur TikTok");
    expect(html).toContain('href="https://www.tiktok.com/@test/video/123"');
    expect(html).toContain("h-[22rem]");
    expect(html).toContain("sm:h-[30rem]");
    expect(html).toContain("lg:h-[38rem]");
    expect(html).toMatch(/<figcaption[^>]*>Sans miniature<\/figcaption>/);
  });
});
