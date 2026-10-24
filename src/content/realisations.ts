import {
  getPublishedRealisations,
  type Realisation,
  validateRealisationsManifest,
} from "../domain/realisation";

export const realisationsManifest = validateRealisationsManifest([
  {
    id: "realisation-decor-arche-ballon-rouge-noir",
    slug: "decor-arche-ballon-rouge-noir",
    title: "Décor d'arche de ballons rouge et noir",
    description:
      "Une composition de ballons rouges et noirs installée autour d'une arche de fond circulaire.",
    category: "decoration",
    coverImage: "./images/realisations/decor-arche-ballon-rouge-noir/couverture.png",
    images: [
      {
        src: "./images/realisations/decor-arche-ballon-rouge-noir/couverture.png",
        alt: "Composition de ballons rouges et noirs autour d'une arche de fond circulaire",
        displayOrder: 1,
      },
    ],
    published: true,
    displayOrder: 1,
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
    title: "Table gourmande",
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
  {
    id: "realisation-decor-colonne-ballons-rouge-blanc",
    slug: "decor-colonne-ballons-rouge-blanc",
    title: "Décor de colonne de ballons rouge et blanc",
    description:
      "Une mise en scène coordonnée avec deux colonnes de ballons rouges et blancs, un pupitre transparent et une composition florale.",
    category: "decoration",
    coverImage: "./images/realisations/decor-colonne-ballons-rouge-blanc/couverture.jpg",
    images: [
      {
        src: "./images/realisations/decor-colonne-ballons-rouge-blanc/couverture.jpg",
        alt: "Décor de colonne de ballons rouge et blanc avec pupitre transparent",
        displayOrder: 1,
      },
    ],
    published: true,
    displayOrder: 5,
    quoteService: "decoration",
  },
  {
    id: "realisation-cadeaux-personnalises-anniversaire",
    slug: "cadeaux-personnalises-anniversaire",
    title: "Cadeaux personnalisés d’anniversaire",
    description:
      "Un ensemble coordonné de sacs-cadeaux et de pochettes personnalisées, préparé dans un thème vert et floral pour un anniversaire.",
    category: "decoration",
    coverImage: "./images/realisations/cadeaux-personnalises-anniversaire/couverture.jpg",
    images: [
      {
        src: "./images/realisations/cadeaux-personnalises-anniversaire/couverture.jpg",
        alt: "Ensemble de sacs-cadeaux transparents ornés de rubans verts",
        displayOrder: 1,
      },
      {
        src: "./images/realisations/cadeaux-personnalises-anniversaire/sacs-cadeaux.jpg",
        alt: "Vue complète des sacs-cadeaux personnalisés disposés en rangées",
        displayOrder: 2,
      },
      {
        src: "./images/realisations/cadeaux-personnalises-anniversaire/sacs-cadeaux-en-scene.jpg",
        alt: "Sacs-cadeaux personnalisés avec rubans verts dans une mise en scène florale",
        displayOrder: 3,
      },
    ],
    published: true,
    displayOrder: 6,
    quoteService: "decoration",
  },
  {
    id: "realisation-chips-personnalisees",
    slug: "chips-personnalises",
    title: "Chips personnalisés",
    description:
      "Des sachets de chips personnalisés et coordonnés au thème vert et floral d’un anniversaire.",
    category: "decoration",
    coverImage: "./images/realisations/chips-personnalises/couverture.jpg",
    images: [
      {
        src: "./images/realisations/chips-personnalises/couverture.jpg",
        alt: "Sachets de chips personnalisés dans un décor vert et floral",
        displayOrder: 1,
      },
      {
        src: "./images/realisations/chips-personnalises/collection-verte.jpg",
        alt: "Collection de sachets de chips personnalisés pour un anniversaire",
        displayOrder: 2,
      },
    ],
    published: true,
    displayOrder: 7,
    quoteService: "decoration",
  },
  {
    id: "realisation-boissons-personnalisees",
    slug: "boissons-personnalisees",
    title: "Boissons personnalisées",
    description:
      "Des pochettes de boisson Kool-Aid habillées d’un visuel personnalisé pour s’accorder au thème de la célébration.",
    category: "decoration",
    coverImage: "./images/realisations/boissons-personnalisees/couverture.jpg",
    images: [
      {
        src: "./images/realisations/boissons-personnalisees/couverture.jpg",
        alt: "Pochette de boisson Kool-Aid personnalisée pour un anniversaire",
        displayOrder: 1,
      },
      {
        src: "./images/realisations/boissons-personnalisees/collection-verte.jpg",
        alt: "Deux présentations de pochettes de boisson personnalisées sur un thème vert",
        displayOrder: 2,
      },
      {
        src: "./images/realisations/boissons-personnalisees/collection-bleue.jpg",
        alt: "Deux présentations de pochettes de boisson personnalisées sur un thème bleu",
        displayOrder: 3,
      },
    ],
    published: true,
    displayOrder: 8,
    quoteService: "decoration",
  },
  {
    id: "realisation-bouquet-cadeau-billets-bleu-or",
    slug: "bouquet-cadeau-billets-bleu-or",
    title: "Bouquet-cadeau de billets bleu et or",
    description:
      "Une composition-cadeau bleu et or réalisée avec des billets canadiens et américains, des fleurs décoratives et des chocolats.",
    category: "decoration",
    coverImage: "./images/realisations/bouquet-cadeau-bleu-or/couverture.jpg",
    images: [
      {
        src: "./images/realisations/bouquet-cadeau-bleu-or/couverture.jpg",
        alt: "Bouquet-cadeau bleu et or composé de billets canadiens et américains",
        displayOrder: 1,
      },
    ],
    published: true,
    displayOrder: 9,
    quoteService: "decoration",
  },
] satisfies Realisation[]);

export const publishedRealisations = getPublishedRealisations(realisationsManifest);
