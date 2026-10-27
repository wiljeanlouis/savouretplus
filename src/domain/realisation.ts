export const REALISATION_CATEGORIES = {
  decoration: "Décoration",
  cartering: "Service traiteur",
  decoAndCatering: "Décoration et service traiteur",
} as const;

export type RealisationCategory = keyof typeof REALISATION_CATEGORIES;

export type RealisationImage = {
  src: string;
  alt: string;
  caption?: string;
  displayOrder?: number;
};

export type RealisationTestimonial = {
  quote: string;
  author: string;
  context?: string;
  date?: string;
};

export type Realisation = {
  id: string;
  reference: string;
  slug: string;
  title: string;
  description: string;
  category: RealisationCategory;
  coverImage: string;
  images: RealisationImage[];
  testimonials?: RealisationTestimonial[];
  published: boolean;
  displayOrder: number;
  quoteService?: "decoration" | "traiteur" | "traiteur-decoration";
  date?: string;
  location?: string;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isRealisationSlug(value: unknown): value is string {
  return typeof value === "string" && slugPattern.test(value);
}

export function validateRealisationsManifest(realisations: Realisation[]) {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const references = new Set<string>();

  for (const realisation of realisations) {
    if (!realisation.id.trim()) throw new Error("Une réalisation doit avoir un identifiant stable.");
    if (ids.has(realisation.id)) throw new Error(`Identifiant de réalisation dupliqué : ${realisation.id}`);
    ids.add(realisation.id);

    if (!isRealisationSlug(realisation.slug)) {
      throw new Error(`Slug de réalisation invalide : ${realisation.slug}`);
    }
    if (slugs.has(realisation.slug)) throw new Error(`Slug de réalisation dupliqué : ${realisation.slug}`);
    slugs.add(realisation.slug);

    if (typeof realisation.reference !== "string" || realisation.reference.length !== 8 || !/^REA-(?!0000)[0-9]{4}$/.test(realisation.reference)) {
      throw new Error(`Référence de réalisation invalide : ${realisation.reference}`);
    }
    if (references.has(realisation.reference)) {
      throw new Error(`Référence de réalisation dupliquée : ${realisation.reference}`);
    }
    references.add(realisation.reference);

    if (!(realisation.category in REALISATION_CATEGORIES)) {
      throw new Error(`Catégorie de réalisation inconnue : ${realisation.category}`);
    }
    if (!Number.isFinite(realisation.displayOrder)) {
      throw new Error(`Ordre d'affichage invalide pour ${realisation.slug}.`);
    }
    if (realisation.images.length === 0) {
      throw new Error(`La réalisation ${realisation.slug} doit contenir au moins une photographie.`);
    }
    if (!realisation.images.some((image) => image.src === realisation.coverImage)) {
      throw new Error(`La couverture de ${realisation.slug} doit figurer dans son tableau d'images.`);
    }

    if (realisation.testimonials !== undefined) {
      if (!Array.isArray(realisation.testimonials)) {
        throw new Error(`Liste de témoignages invalide pour ${realisation.slug}.`);
      }
      for (const testimonial of realisation.testimonials) {
        if (!testimonial || typeof testimonial !== "object" || Array.isArray(testimonial)) {
          throw new Error(`Témoignage invalide pour ${realisation.slug}.`);
        }
        for (const field of ["quote", "author"] as const) {
          if (typeof testimonial[field] !== "string" || !testimonial[field].trim()) {
            throw new Error(`Champ ${field} manquant ou invalide dans un témoignage de ${realisation.slug}.`);
          }
        }
        for (const field of ["context", "date"] as const) {
          if (testimonial[field] !== undefined && (typeof testimonial[field] !== "string" || !testimonial[field].trim())) {
            throw new Error(`Champ ${field} invalide dans un témoignage de ${realisation.slug}.`);
          }
        }
      }
    }

    for (const image of realisation.images) {
      if (!image.src.startsWith("./images/") || image.src.includes("..")) {
        throw new Error(`Chemin d'image non local ou invalide pour ${realisation.slug} : ${image.src}`);
      }
      if (!image.alt.trim()) throw new Error(`Texte alternatif manquant pour ${realisation.slug}.`);
    }
  }

  return realisations;
}

export function getPublishedRealisations(realisations: Realisation[]) {
  return realisations
    .filter((realisation) => realisation.published)
    .sort((first, second) => first.displayOrder - second.displayOrder || first.title.localeCompare(second.title, "fr"));
}

export function filterRealisations(realisations: Realisation[], category: RealisationCategory | "all") {
  return category === "all" ? realisations : realisations.filter((realisation) => realisation.category === category);
}

export function getAvailableRealisationCategories(realisations: Realisation[]) {
  const presentCategories = new Set(realisations.map((realisation) => realisation.category));
  return Object.entries(REALISATION_CATEGORIES)
    .filter(([category]) => presentCategories.has(category as RealisationCategory))
    .map(([id, label]) => ({ id: id as RealisationCategory, label }));
}

export function findPublishedRealisationBySlug(realisations: Realisation[], slug: string | null | undefined) {
  if (!isRealisationSlug(slug)) return null;
  return realisations.find((realisation) => realisation.published && realisation.slug === slug) || null;
}

export function getOrderedRealisationImages(realisation: Realisation) {
  return [...realisation.images].sort(
    (first, second) => (first.displayOrder ?? 0) - (second.displayOrder ?? 0),
  );
}

export function getRealisationQuoteHref(realisation: Realisation) {
  return realisation.quoteService
    ? `#/soumission?service=${realisation.quoteService}`
    : "#/soumission";
}
