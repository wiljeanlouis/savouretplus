import type { CatalogProduct } from "../../domain/catalog";

export const fallbackCatalog: CatalogProduct[] = [
  {
    id: "pate-four",
    bom_id: "local-pate-four",
    slug: "pate-cuit-au-four",
    name: "Pâté cuit au four",
    category: "degustation",
    description:
      "Une pâte brisée croustillante enveloppe généreusement une farce savoureuse faite à partir d'ingrédients frais.",
    product_type: "single_choice_bundle",
    purchase_modes: [
      {
        id: "unit",
        label: "À l'unité",
        quantity: 1,
        price_cents: 300,
        allocation_type: "single_choice",
      },
      {
        id: "dozen",
        label: "Douzaine",
        quantity: 12,
        price_cents: 3000,
        allocation_type: "choice_allocation",
      },
    ],
    choice_group: {
      label: "Farce",
      required: true,
      options: [
        { id: "poulet-creole", name: "Poulet Créole" },
        { id: "boeuf-epice", name: "Boeuf Épicé" },
        { id: "hareng-saur", name: "Hareng saur" },
        { id: "thon", name: "Thon" },
      ],
    },
    ingredient_options: [],
    image_url: "./images/pate-au-four-1-530x480.png",
    gallery: [
      "./images/pate-au-four-1-530x480.png",
      "./images/pate-au-four-2-530x480.png",
      "./images/pate-au-four-3-530x480.png",
    ],
    availability_note: "Préparé sur commande",
  },
  {
    id: "pate-kode",
    bom_id: "local-pate-kode",
    slug: "pate-kode",
    name: "Pâté kòde",
    category: "degustation",
    description:
      "Une pâte frite soigneusement dans l'huile, servie avec une sauce piquante haïtienne pour une expérience authentique.",
    product_type: "ingredient_customization",
    purchase_modes: [
      {
        id: "unit",
        label: "À l'unité",
        quantity: 1,
        price_cents: 800,
        allocation_type: "single_choice",
      },
    ],
    choice_group: null,
    ingredient_options: [
      {
        id: "poulet-creole",
        name: "Poulet Créole",
        default_quantity: 1,
        min_quantity: 0,
        max_quantity: 3,
        extra_price_cents: 200,
      },
      {
        id: "oeuf-bouilli",
        name: "Oeuf bouilli",
        default_quantity: 1,
        min_quantity: 0,
        max_quantity: 3,
        extra_price_cents: 100,
      },
      {
        id: "hareng-saur",
        name: "Hareng saur",
        default_quantity: 1,
        min_quantity: 0,
        max_quantity: 3,
        extra_price_cents: 200,
      },
      {
        id: "saucisse",
        name: "Saucisse",
        default_quantity: 1,
        min_quantity: 0,
        max_quantity: 3,
        extra_price_cents: 150,
      },
    ],
    image_url: "./images/pate-kode-1-530x480.png",
    gallery: [
      "./images/pate-kode-1-530x480.png",
      "./images/pate-kode-2-530x480.png",
      "./images/pate-kode-3-530x480.png",
    ],
    availability_note: "Préparé chaque samedi",
  },
];
