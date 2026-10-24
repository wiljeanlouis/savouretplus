import {
  getPublishedRealisations,
  type Realisation,
  validateRealisationsManifest,
} from "../domain/realisation";

export const realisationsManifest = validateRealisationsManifest([
  {
    id: "realisation-decor-rouge-noir",
    slug: "decor-rouge-noir",
    title: "Décor rouge et noir",
    description:
      "Une composition de ballons rouges et noirs installée autour d'un fond photo circulaire.",
    category: "decoration",
    coverImage: "./images/realisations/decor-rouge-noir/couverture.png",
    images: [
      {
        src: "./images/realisations/decor-rouge-noir/couverture.png",
        alt: "Composition de ballons rouges et noirs autour d'un fond photo circulaire",
        displayOrder: 1,
      },
    ],
    published: true,
    displayOrder: 1,
    quoteService: "decoration",
  },
  {
    id: "realisation-arche-mauve",
    slug: "arche-mauve-papillons",
    title: "Arche mauve et papillons",
    description:
      "Une arche de ballons mauves, blancs et métallisés, agrémentée de fleurs et d'un décor papillon.",
    category: "decoration",
    coverImage: "./images/realisations/arche-mauve-papillons/couverture.png",
    images: [
      {
        src: "./images/realisations/arche-mauve-papillons/couverture.png",
        alt: "Arche de ballons mauves et blancs avec fleurs, papillons et cubes décoratifs",
        displayOrder: 1,
      },
    ],
    published: true,
    displayOrder: 2,
    quoteService: "decoration",
  },
  {
    id: "realisation-accueil-rouge-noir",
    slug: "accueil-rouge-noir",
    title: "Accueil rouge et noir",
    description:
      "Une mise en place d'accueil avec ballons rouges et noirs, verres et rafraîchissements.",
    category: "decoration",
    coverImage: "./images/realisations/accueil-rouge-noir/couverture.png",
    images: [
      {
        src: "./images/realisations/accueil-rouge-noir/couverture.png",
        alt: "Espace d'accueil avec ballons rouges et noirs, bouteille et verres",
        displayOrder: 1,
      },
    ],
    published: true,
    displayOrder: 3,
    quoteService: "decoration",
  },
  {
    id: "realisation-table-gourmande",
    slug: "table-gourmande-rouge-noir",
    title: "Table gourmande rouge et noire",
    description:
      "Une table garnie de bouchées, desserts et boissons, coordonnée avec une décoration rouge et noire.",
    category: "traiteur",
    coverImage: "./images/realisations/table-gourmande-rouge-noir/couverture.jpg",
    images: [
      {
        src: "./images/realisations/table-gourmande-rouge-noir/couverture.jpg",
        alt: "Table de bouchées, desserts et boissons avec une décoration rouge et noire",
        displayOrder: 1,
      },
    ],
    published: true,
    displayOrder: 4,
    quoteService: "traiteur-decoration",
  },
] satisfies Realisation[]);

export const publishedRealisations = getPublishedRealisations(realisationsManifest);
