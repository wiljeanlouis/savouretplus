export const REALISATION_CATEGORIES = {
  decoration: "Décoration",
  cartering: "Service traiteur",
  decoAndCatering: "Décoration et service traiteur",
} as const;

export type RealisationCategory = keyof typeof REALISATION_CATEGORIES;

export type RealisationImage = {
  type?: "image";
  src: string;
  alt: string;
  caption?: string;
  displayOrder?: number;
};

export type RealisationVideo = {
  type: "video";
  platform: "youtube" | "tiktok";
  url: string;
  thumbnail?: string;
  thumbnailAlt?: string;
  title: string;
  caption?: string;
  displayOrder?: number;
};

export type RealisationMedia = (RealisationImage & { type: "image" }) | RealisationVideo;

export function isRealisationVideoUrl(value: unknown, platform: RealisationVideo["platform"]): value is string {
  if (typeof value !== "string" || !/^https:\/\/[^/?#]+(?:[/?#]|$)/i.test(value) || /[\s\\]/.test(value)) return false;
  try {
    const url = new URL(value);
    const hosts = platform === "youtube"
      ? ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]
      : platform === "tiktok" ? ["tiktok.com", "www.tiktok.com", "m.tiktok.com", "vm.tiktok.com", "vt.tiktok.com"] : [];
    return url.protocol === "https:" && !url.username && !url.password && !url.port && hosts.includes(url.hostname);
  } catch {
    return false;
  }
}

function isLocalMediaPath(value: unknown): value is string {
  return typeof value === "string" && /^\.\/images\/[a-zA-Z0-9_/-]+\.[a-zA-Z0-9]+$/.test(value);
}

export type RealisationTestimonial = {
  featuredOnHome?: boolean;
  homeImageSrc?: string;
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
  videos?: RealisationVideo[];
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
    if (!Array.isArray(realisation.images) || realisation.images.length === 0) {
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
        if (testimonial.featuredOnHome !== undefined && typeof testimonial.featuredOnHome !== "boolean") {
          throw new Error(`Champ featuredOnHome invalide dans un témoignage de ${realisation.slug}.`);
        }
        if (testimonial.homeImageSrc !== undefined && !realisation.images.some((image) => image.src === testimonial.homeImageSrc)) {
          throw new Error(`Photographie homeImageSrc invalide dans un témoignage de ${realisation.slug}.`);
        }
        for (const field of ["context", "date"] as const) {
          if (testimonial[field] !== undefined && (typeof testimonial[field] !== "string" || !testimonial[field].trim())) {
            throw new Error(`Champ ${field} invalide dans un témoignage de ${realisation.slug}.`);
          }
        }
      }
    }

    if (realisation.videos !== undefined && !Array.isArray(realisation.videos)) {
      throw new Error(`Liste de vidéos invalide pour ${realisation.slug}.`);
    }
    for (const video of realisation.videos ?? []) {
      if (!video || video.type !== "video" || !["youtube", "tiktok"].includes(video.platform)) {
        throw new Error(`Type ou plateforme vidéo invalide pour ${realisation.slug}.`);
      }
      if (!isRealisationVideoUrl(video.url, video.platform)) {
        throw new Error(`URL vidéo invalide pour ${realisation.slug}.`);
      }
      if (typeof video.title !== "string" || !video.title.trim()) {
        throw new Error(`Titre vidéo manquant pour ${realisation.slug}.`);
      }
      if (video.thumbnail !== undefined && (!isLocalMediaPath(video.thumbnail) || typeof video.thumbnailAlt !== "string" || !video.thumbnailAlt.trim())) {
        throw new Error(`Miniature vidéo ou texte alternatif invalide pour ${realisation.slug}.`);
      }
    }
    for (const media of [...realisation.images, ...(realisation.videos ?? [])]) {
      if (media.displayOrder !== undefined && !Number.isFinite(media.displayOrder)) {
        throw new Error(`Ordre de média invalide pour ${realisation.slug}.`);
      }
      if (media.caption !== undefined && typeof media.caption !== "string") {
        throw new Error(`Légende de média invalide pour ${realisation.slug}.`);
      }
    }
    for (const image of realisation.images) {
      if (!image || (image.type !== undefined && image.type !== "image")) {
        throw new Error(`Type de photographie invalide pour ${realisation.slug}.`);
      }
      if (!isLocalMediaPath(image.src)) {
        throw new Error(`Chemin d'image non local ou invalide pour ${realisation.slug} : ${image.src}`);
      }
      if (typeof image.alt !== "string" || !image.alt.trim()) throw new Error(`Texte alternatif manquant pour ${realisation.slug}.`);
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

export function getOrderedRealisationMedia(realisation: Realisation): RealisationMedia[] {
  return [
    ...realisation.images.map((image) => ({ ...image, type: "image" as const })),
    ...(realisation.videos ?? []),
  ].sort((first, second) => (first.displayOrder ?? 0) - (second.displayOrder ?? 0));
}

export function getRealisationQuoteHref(realisation: Realisation) {
  return realisation.quoteService
    ? `#/soumission?service=${realisation.quoteService}`
    : "#/soumission";
}

export type HomeRealisationTestimonial = {
  key: string;
  realisation: Realisation;
  testimonial: RealisationTestimonial;
  image: RealisationImage;
};

export function getHomeRealisationTestimonials(realisations: Realisation[]): HomeRealisationTestimonial[] {
  return getPublishedRealisations(realisations)
    .sort((first, second) =>
      first.displayOrder - second.displayOrder || first.title.localeCompare(second.title, "fr") || first.id.localeCompare(second.id, "fr"),
    )
    .flatMap((realisation) => (realisation.testimonials ?? []).flatMap((testimonial, index) => {
      if (testimonial.featuredOnHome !== true) return [];
      const image = realisation.images.find((image) => image.src === (testimonial.homeImageSrc ?? realisation.coverImage));
      if (!image) return [];
      return [{ key: `${realisation.id}:${index}`, realisation, testimonial, image }];
    }));
}
