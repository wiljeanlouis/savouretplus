# Ajouter une réalisation

Le portfolio est statique : ses photographies sont versionnées dans le dépôt et ses métadonnées se trouvent dans `src/content/realisations.ts`. Aucun changement Supabase ou SAVIS n'est nécessaire.

## 1. Créer le dossier d'images

Créez un dossier dont le nom correspond au futur slug :

```text
public/images/realisations/mon-evenement/
├── couverture.webp
├── vue-02.webp
└── vue-03.webp
```

Utilisez uniquement des photographies SavouretPlus dont la provenance est confirmée. Une image d'ambiance, une image générée ou une photographie de catalogue ne doit pas être présentée comme une réalisation.

Recommandations :

- WebP ou AVIF lorsque la qualité de la source le permet;
- 1 600 à 2 000 px sur le côté le plus long;
- poids raisonnable pour le Web, sans dégrader les détails;
- noms de fichiers courts, descriptifs et sans espaces.

## 2. Compléter le manifeste

Ajoutez une entrée dans `src/content/realisations.ts`. Les composants React n'ont pas à être modifiés.

Exemple technique fictif — il ne représente pas une réalisation authentique :

```ts
{
  id: "exemple-technique-001",
  slug: "exemple-technique",
  title: "Titre confirmé de la réalisation",
  description: "Description factuelle fondée sur les informations confirmées.",
  category: "decoration",
  coverImage: "./images/realisations/exemple-technique/couverture.webp",
  images: [
    {
      src: "./images/realisations/exemple-technique/couverture.webp",
      alt: "Description précise de la photographie principale",
      displayOrder: 1,
    },
    {
      src: "./images/realisations/exemple-technique/vue-02.webp",
      alt: "Description précise de la deuxième photographie",
      displayOrder: 2,
    },
    {
      src: "./images/realisations/exemple-technique/vue-03.webp",
      alt: "Description précise de la troisième photographie",
      displayOrder: 3,
    },
  ],
  published: false,
  displayOrder: 10,
  quoteService: "decoration",
}
```

Le `coverImage` doit aussi être présent dans `images`. Une seule photographie suffit; ajoutez simplement d'autres objets au tableau lorsqu'ils sont disponibles.

## 3. Choisir la catégorie

Les catégories reconnues sont définies dans `src/domain/realisation.ts` :

- `decoration` : décors et mises en scène;
- `traiteur` : tables gourmandes et service traiteur.

N'ajoutez une catégorie que si elle correspond à plusieurs réalisations ou à un besoin de filtrage réel.

## 4. Publier ou masquer

- `published: true` rend la réalisation visible dans la grille et accessible par son URL.
- `published: false` la masque de la grille et rend sa fiche inaccessible publiquement.
- `displayOrder` détermine l'ordre; les valeurs identiques sont départagées par titre.

Le `slug` doit être unique, en minuscules, sans accent ni espace. L'`id` doit aussi être unique et rester stable.

## 5. Soumission

`quoteService` est facultatif. Utilisez-le seulement lorsque la correspondance est certaine :

- `decoration`;
- `traiteur`;
- `traiteur-decoration`.

Sinon, omettez la propriété : le CTA ouvrira la soumission générale. Une réalisation ne doit jamais créer artificiellement un article ou un `offering_id`.

## 6. Vérifier localement

```bash
npm run typecheck
npm test -- --run
npm run build
npm run dev
```

Contrôlez ensuite :

1. `#/realisations` sur mobile et ordinateur;
2. les filtres visibles;
3. l'ouverture de la fiche;
4. la galerie et sa navigation au clavier;
5. le CTA de soumission;
6. l'état introuvable avec un slug inexistant.

Les tests du manifeste vérifient aussi que chaque chemin d'image correspond à un fichier local dans `public`.

## 7. Déployer

Après revue, validation visuelle et commit approuvé, utilisez la procédure existante du projet (`npm run deploy`). L'ajout d'une réalisation n'est visible en production qu'après un nouveau build et un nouveau déploiement.
