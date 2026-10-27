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
  reference: "REA-0006",
  slug: "exemple-technique",
  title: "Titre confirmé de la réalisation",
  description: "Description factuelle fondée sur les informations confirmées.",
  category: "decoration",
  coverImage: "./images/realisations/exemple-technique/couverture.webp",
  images: [
    {
      src: "./images/realisations/exemple-technique/couverture.webp",
      alt: "Description précise de la photographie principale",
      caption: "Légende éditoriale facultative, fondée sur les informations confirmées",
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

La `reference` est un identifiant public permanent, attribué explicitement au format
`REA-0001` à `REA-9999` (`REA-0000` est réservé). Choisissez le prochain numéro
jamais attribué en consultant aussi l'historique Git. Ne réutilisez pas le numéro
d'une réalisation supprimée ou masquée. Ne le recalculez pas depuis l'index,
le titre, la catégorie ou `displayOrder`. Les références initiales `REA-0001` à
`REA-0005` sont inscrites dans le manifeste; leur association aux identifiants
est protégée par les tests. La validation refuse les doublons, y compris masqués.

La photographie principale et la vue agrandie affichent chacune une seule légende sous l'image : `caption`
si elle contient du texte, sinon `alt`. Conservez toujours un `alt` descriptif
pour l'accessibilité. La légende suit la miniature sélectionnée et la navigation
dans la lightbox, sans modifier les photographies ni leur regroupement.

## 5. Référence dans une commande ou une soumission

La fiche présente la référence et une action « Copier la référence », avec
confirmation accessible et message en cas d'échec du presse-papiers. Le client
peut également sélectionner le texte manuellement. Le CTA global du header
reste disponible; la fiche n'a plus son propre CTA de soumission.

Le client peut coller une référence dans « Note » de la commande (`customer.note` dans le formulaire, `note` dans le payload)
ou dans les commentaires/besoins particuliers de la soumission
(`event_details.note`). Une indication accessible accompagne ces champs existants.
Aucun changement de RPC ou de contrat SAVIS, aucune association automatique à un
produit. La référence reste du texte libre : elle ne constitue pas une relation
structurée ou validée par le backend. `quoteService` reste une métadonnée
facultative existante, sans action de soumission dans la fiche.

## Témoignages clients

Une réalisation peut recevoir une propriété facultative `testimonials`, liste
conservée uniquement dans `src/content/realisations.ts`. Chaque élément contient :

- `quote` : texte authentique reproduit intégralement, sans reformulation non validée;
- `author` : nom public dont le client a autorisé l'affichage;
- `context` : contexte facultatif, confirmé et autorisé;
- `date` : date facultative sous forme de texte, avec seulement la précision confirmée (jour, mois ou année).

La validation du manifeste exige des chaînes non vides pour `quote` et `author`,
et pour les champs facultatifs lorsqu'ils sont présents. Elle ne modifie pas les
textes. Elle ne peut pas vérifier l'authenticité ni le consentement : confirmez
l'autorisation du client et les informations publiables avant d'ajouter un
élément. N'incluez pas de coordonnées ni d'informations personnelles non autorisées.
Les exemples fictifs actuellement présents servent uniquement à la démonstration
et portent tous le libellé visible « Témoignage fictif — démonstration ».
Ils ne proviennent pas de clients réels. Les retirer ou les remplacer par des avis
authentiques autorisés avant toute publication en production.

Omettez `testimonials` ou utilisez une liste vide en l'absence de contenu autorisé.
La section « Le témoignage de notre client » est alors entièrement absente.
Les témoignages apparaissent dans un encadré de la colonne de droite, après la
description et le bloc de référence. Ils restent empilés, sans carrousel. Sur mobile
et tablette, la galerie puis le contenu de la fiche suivent un ordre vertical
naturel. Le titre passe à « Les témoignages de nos clients » pour plusieurs avis.

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
5. la référence sur les cartes et la fiche, sa copie et les légendes actives;
6. l'état introuvable avec un slug inexistant;
7. les témoignages autorisés, leurs champs facultatifs et leur lisibilité sur mobile.

Les tests du manifeste vérifient aussi que chaque chemin d'image correspond à un fichier local dans `public`.

## 7. Déployer

Un push sur `main` déclenche GitHub Pages. Ne lancez pas de publication sans demande explicite. L'ajout d'une réalisation n'est visible en production qu'après un nouveau build et un nouveau déploiement.
