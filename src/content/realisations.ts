import {
  getPublishedRealisations,
  type Realisation,
  validateRealisationsManifest,
} from "../domain/realisation";

// Les exemples fictifs ci-dessous servent à la démonstration et sont identifiés
// visiblement. Les remplacer par des témoignages autorisés avant publication.
export const realisationsManifest = validateRealisationsManifest([
  {
    id: "realisation-grand-opening-soul-store",
    reference: "REA-0001",
    slug: "grand-opening-soul-store",
    title: "Grand Opening Soul Store",
    description:
      "Une décoration élégante pour le grand opening de la boutique Soul Store. Arche de ballons, table de champagne et bouchées.",
    category: "decoration",
    coverImage: "./images/realisations/grand-opening-soul-store/couverture.png",
    images: [
      {
        src: "./images/realisations/grand-opening-soul-store/couverture.png",
        alt: "Table de champagne avec ballons et décorations pour le grand opening de la boutique Soul Store",
        displayOrder: 1,
      },
      {
        src: "./images/realisations/grand-opening-soul-store/arche-ballons.png",
        alt: "Arche de ballons rouges et noirs pour le grand opening de la boutique Soul Store",
        displayOrder: 2,
      },
      {
        src: "./images/realisations/grand-opening-soul-store/table-de-degustation.jpg",
        alt: "Table de bouchées, desserts et boissons.",
        displayOrder: 3,
      },
    ],
    testimonials: [
      {
        quote: "Une décoration qui mettait notre boutique en valeur et créait une belle ambiance pour accueillir nos invités.",
        author: "Soul Store",
      },
    ],
    published: true,
    displayOrder: 1,
    quoteService: "decoration",
  },
  {
    id: "realisation-anniversaire-winnie",
    reference: "REA-0002",
    slug: "anniversaire-winnie",
    title: "Décoration d'anniversaire Winnie",
    description:
      "Décoration faite de sacs-cadeaux, de pochettes personnalisées et de chips personnalisés, préparés dans un thème vert et floral pour un anniversaire.",
    category: "decoration",
    coverImage: "./images/realisations/anniversaire-winnie/couverture.jpg",
    images: [
      {
        src: "./images/realisations/anniversaire-winnie/couverture.jpg",
        alt: "Chip personnalisé",
        displayOrder: 1,
      },
      {
        src: "./images/realisations/anniversaire-winnie/chips-personnalises.jpg",
        alt: "Ensemble de sachets de chips personnalisés disposés en rangées",
        displayOrder: 2,
      },
      {
        src: "./images/realisations/anniversaire-winnie/sacs-cadeaux.jpg",
        alt: "Sacs-cadeaux personnalisés avec rubans verts dans une mise en scène florale",
        displayOrder: 3,
      },
      {
        src: "./images/realisations/anniversaire-winnie/sacs-cadeaux-en-scene.jpg",
        alt: "Sacs-cadeaux personnalisés disposés sur une table",
        displayOrder: 4,
      },
      {
        src: "./images/realisations/anniversaire-winnie/boisson-personnalisee.jpg",
        alt: "Pochette de boisson Kool-Aid personnalisée pour un anniversaire",
        displayOrder: 5,
      },
      {
        src: "./images/realisations/anniversaire-winnie/boissons-personnalisees.jpg",
        alt: "Présentations de pochettes de boisson personnalisées sur un thème vert",
        displayOrder: 6,
      },
    ],
    testimonials: [
      {
        quote: "Les petites attentions personnalisées apportaient une belle cohérence à la fête.",
        author: "Maman de Winnie",
      },
    ],
    published: true,
    displayOrder: 2,
    quoteService: "decoration",
  },

  {
    id: "realisation-decor-colonne-ballons-rouge-blanc",
    reference: "REA-0003",
    slug: "decor-colonne-ballons-rouge-blanc",
    title: "Décor de colonne de ballons rouge et blanc",
    description:
      "Une mise en scène coordonnée avec deux colonnes de ballons rouges et blancs, un pupitre transparent et une composition florale.",
    category: "decoration",
    coverImage:
      "./images/realisations/decor-colonne-ballons-rouge-blanc/couverture.jpg",
    images: [
      {
        src: "./images/realisations/decor-colonne-ballons-rouge-blanc/couverture.jpg",
        alt: "Décor de colonne de ballons rouge et blanc avec pupitre transparent",
        displayOrder: 1,
      },
    ],
    testimonials: [
      {
        quote: "Le rouge et le blanc donnaient une belle présence au décor. Un ensemble à la fois sobre et chaleureux.",
        author: "Responsable de l'événement",
      },
    ],
    published: true,
    displayOrder: 3,
    quoteService: "decoration",
  },
  {
    id: "realisation-anniversaire-marvensley",
    reference: "REA-0004",
    slug: "anniversaire-marvensley",
    title: "Décoration d'anniversaire Marvensley",
    description:
      "Décoration faite de sacs-cadeaux, de pochettes personnalisées et de chips personnalisés, préparés dans un thème de gamer pour un anniversaire.",
    category: "decoration",
    coverImage: "./images/realisations/anniversaire-marvensley/couverture.jpg",
    images: [
      {
        src: "./images/realisations/anniversaire-marvensley/couverture.jpg",
        alt: "Pochette de boisson Kool-Aid personnalisée pour un anniversaire de gamer",
        displayOrder: 1,
      },
      {
        src: "./images/realisations/anniversaire-marvensley/boisson-personnalisee.jpg",
        alt: "Pochette de boisson Kool-Aid personnalisée pour un anniversaire de gamer",
        displayOrder: 2,
      },
    ],
    testimonials: [
      {
        quote: "Le thème gamer correspondait parfaitement à l’ambiance souhaitée pour cet anniversaire.",
        author: "Maman de Marvensley",
      },
    ],
    published: true,
    displayOrder: 4,
    quoteService: "decoration",
  },
  {
    id: "realisation-bouquet-cadeau-billets-bleu-or",
    reference: "REA-0005",
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
    testimonials: [
      {
        quote: "Une idée de cadeau originale, avec une présentation de billets en forme de fleurs qui faisait tout son charme.",
        author: "Maman de l'heureux destinataire",
      },
    ],
    published: true,
    displayOrder: 5,
    quoteService: "decoration",
  },
] satisfies Realisation[]);

export const publishedRealisations =
  getPublishedRealisations(realisationsManifest);
