# Ajouter une réalisation

Le portfolio est statique : ses photographies et miniatures vidéo sont versionnées dans le dépôt et ses métadonnées se trouvent dans `src/content/realisations.ts`. Aucun changement Supabase ou SAVIS n'est nécessaire.

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

Exemple technique fictif et non publié — il ne représente pas une réalisation authentique :

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

## Ajouter des vidéos à la même réalisation

Conservez `images` pour les photographies et ajoutez un tableau facultatif
`videos`. Les fiches existantes fonctionnent sans modification. Le sélecteur
`getOrderedRealisationMedia()` réunit ces deux listes sous le type discriminé
`RealisationMedia` (`image` ou `video`) et les trie par `displayOrder` croissant
(0 par défaut; égalités dans l'ordre des photos puis des vidéos). Pour intercaler
une vidéo, attribuez des ordres explicites aux médias concernés.

**Exemple fictif, non publié, à ajouter seulement à l'entrée `published: false`
ci-dessus. Les URL et fichiers de démonstration ne sont pas du contenu réel.**

```ts
videos: [
  {
    type: "video",
    platform: "tiktok",
    url: "https://www.tiktok.com/@compte-exemple/video/1234567890",
    thumbnail: "./images/realisations/exemple-technique/video-tiktok.webp",
    thumbnailAlt: "Description factuelle de la capture TikTok",
    title: "Titre descriptif de la vidéo TikTok",
    caption: "Légende facultative de cette vidéo",
    displayOrder: 4,
  },
  {
    type: "video",
    platform: "youtube",
    url: "https://www.youtube.com/watch?v=EXEMPLE",
    thumbnail: "./images/realisations/exemple-technique/video-youtube.webp",
    thumbnailAlt: "Description factuelle de la capture YouTube",
    title: "Titre descriptif de la vidéo YouTube",
    displayOrder: 5,
  },
],
```

Confirmez explicitement auprès du responsable du contenu que chaque vidéo montre
cet événement. Une ressemblance visuelle ne suffit pas. Plusieurs vidéos du même
événement conservent l'`id`, le `slug`, la `reference` REA-XXXX, la description et
les témoignages de la réalisation : n'ajoutez pas une nouvelle réalisation pour
une nouvelle vidéo. Gardez `coverImage` et `homeImageSrc` parmi les photographies;
les miniatures vidéo ne remplacent pas la couverture des cartes ou des témoignages.

Pour une nouvelle miniature, utilisez une couverture officielle ou une capture
autorisée de la vidéo réelle. Enregistrez-la dans le dossier de la réalisation,
avec un nom descriptif et un poids adapté au Web. Réutilisez un fichier local
existant correspondant exactement à cette vidéo plutôt que le dupliquer.
`thumbnail` est un chemin relatif `./images/...`, `thumbnailAlt` décrit la capture,
`title` nomme la vidéo et `caption` fournit la légende facultative (sinon le titre
est affiché). `type`, `platform`, `url` et `title` sont obligatoires. Si la miniature
manque, omettez `thumbnail` et `thumbnailAlt`, signalez le manque dans la revue et
ne fournissez aucune image fictive. Un repli « Aperçu indisponible » conserve
l'action de lecture; il apparaît aussi si le fichier ne se charge pas.

La validation accepte uniquement HTTPS sur les hôtes officiels YouTube ou TikTok
(y compris `youtu.be`, `m.youtube.com`, `m.tiktok.com`, `vm.tiktok.com` et
`vt.tiktok.com`), sans identifiants ni port personnalisé. Fournissez le lien réel
de la vidéo, jamais un lien de profil ou une URL de suivi intermédiaire.

Les miniatures sélectionnent un aperçu; seule l'action « Voir la vidéo sur
TikTok/YouTube » ouvre la plateforme dans un nouvel onglet sécurisé. Aucun iframe
ou script tiers n'est chargé. Les flèches gauche/droite, Début/Fin et Tabulation
permettent de parcourir les miniatures. La lightbox reste photographique et saute
les vidéos, avec ses flèches et Échap habituels. Les deux aperçus ont la même
hauteur pour éviter les sauts.

L'état actuel des vidéos et aperçus est décrit dans
[les ressources vidéo](medias-video.md). Le manifeste contient trois vidéos
TikTok : Winnie (`REA-0002`), Marvensley (`REA-0004`) et le bouquet bleu et or
(`REA-0005`). Leurs aperçus actuels réutilisent des photographies de la même
réalisation; ce ne sont pas des captures vidéo vérifiées. Conserver cette
provenance explicite et ne pas les présenter comme des captures officielles.
Pour une nouvelle vidéo, privilégier une véritable capture ou couverture
confirmée comme indiqué ci-dessus.

## 3. Choisir la catégorie

Les catégories reconnues sont définies dans `src/domain/realisation.ts` :

- `decoration` : décors et mises en scène;
- `cartering` : tables gourmandes et service traiteur (code historique);
- `decoAndCatering` : décoration et service traiteur.

N'ajoutez une catégorie que si elle correspond à plusieurs réalisations ou à un besoin de filtrage réel.

## 4. Publier ou masquer

- `published: true` rend la réalisation visible dans la grille et accessible par son URL.
- `published: false` la masque de la grille et rend sa fiche inaccessible publiquement.
- `displayOrder` détermine l'ordre; les valeurs identiques sont départagées par titre.

Le `slug` doit être unique, en minuscules, sans accent ni espace. L'`id` doit aussi être unique et rester stable.
La validation s'applique aussi aux entrées non publiées : leur contenu doit être
valide. Les fichiers d'exemple ci-dessus n'existent pas; ne pas copier cet exemple
au manifeste sans créer les médias correspondants. Une entrée non publiée
n'est pas accessible par sa route publique, même en développement.

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
Ne publiez pas de témoignages fictifs comme avis clients authentiques.

Omettez `testimonials` ou utilisez une liste vide en l'absence de contenu autorisé.
La section « Le témoignage de notre client » est alors entièrement absente.
Les témoignages apparaissent dans un encadré de la colonne de droite, après la
description et le bloc de référence. Ils restent empilés, sans carrousel. Sur mobile
et tablette, la galerie puis le contenu de la fiche suivent un ordre vertical
naturel. Le titre passe à « Les témoignages de nos clients » pour plusieurs avis.

## Sélection des témoignages pour l'accueil

L'accueil utilise les mêmes témoignages que les fiches. Il n'existe plus de liste
indépendante dans `homeContent.ts`. `getHomeRealisationTestimonials()` retient
uniquement les témoignages avec `featuredOnHome: true` de réalisations publiées.
Une propriété absente ou `false` conserve le témoignage uniquement sur la fiche.
Ce choix éditorial ne remplace pas la vérification du consentement du client.

Le sélecteur trie les réalisations par `displayOrder`, titre français puis `id`
en cas d'égalité; il garde l'ordre des témoignages dans chaque liste. Il réutilise
les objets de témoignage et les métadonnées des médias existants sans les copier.
Par défaut, la photo est celle de `coverImage`. Pour choisir une autre photo de
la même réalisation, renseignez `homeImageSrc` sur le témoignage avec la valeur
exacte d'un `images[].src`. La validation refuse toute image étrangère à la galerie
et toute valeur non booléenne de `featuredOnHome`.

Les cinq témoignages associés à `REA-0001` à `REA-0005` sont sélectionnés pour
l'accueil. La documentation antérieure
consigne une confirmation d'authenticité et d'autorisation par le responsable du
site le 27 octobre 2026; cette information ne découle pas d'une validation du
code. Conserver les autorisations éditoriales et les textes approuvés.

Les quatre engagements occupent une section pleine largeur, avec quatre colonnes
sur desktop, deux sur tablette et une sur mobile. Les témoignages ont leur propre
section immédiatement après les engagements et avant le CTA final, dans le même
conteneur que les autres sections. Sans sélection, cette section est entièrement
absente. Le carrousel présente une carte horizontale à partir de la tablette,
avec la citation dominante et une miniature carrée secondaire à droite; sur mobile,
la miniature suit le texte. Les photos des témoignages de Soul Store, Winnie et
Marvensley sont sélectionnées explicitement avec `homeImageSrc` pour utiliser une
autre vue de leur réalisation que la couverture de la galerie d'accueil. Les deux
réalisations à photo unique conservent leur couverture.
Avec une sélection, le carrousel manuel affiche la photo locale, la citation,
l'auteur, les métadonnées disponibles, la référence et un lien vers la fiche.
Une seule sélection masque flèches et indicateurs. Les diapositives partagent la
hauteur du contenu le plus long pour éviter les sauts, sans tronquer les textes.
Seule la miniature active est chargée, jamais les galeries complètes.

Pour la vérification visuelle, utiliser uniquement des fixtures de test ou des
avis dont l'autorisation est confirmée. Contrôler sur desktop et mobile : zéro,
un et plusieurs avis; navigation par flèches et indicateurs; focus clavier;
textes longs; références, photos et liens vers les bonnes fiches.

## 6. Vérifier localement

```bash
npm run typecheck
npm test -- --run
npm run build
git diff --check
npm run dev
```

Contrôlez ensuite :

1. `#/realisations` sur mobile et ordinateur;
2. les filtres visibles;
3. l'ouverture de la fiche;
4. la galerie et sa navigation au clavier;
5. la référence sur les cartes et la fiche, sa copie et les légendes actives;
6. l'état introuvable avec un slug inexistant;
7. les témoignages autorisés, leurs champs facultatifs et leur lisibilité sur mobile;
8. dans un aperçu de développement isolé utilisant une fixture non publiée fournie directement au composant (une route publique
   ne peut pas afficher une entrée masquée), les aperçus photo/vidéo, leurs légendes,
   les liens externes exacts, le repli sans miniature et la lightbox qui saute les vidéos;
9. les vues desktop, tablette et mobile : hauteurs stables, absence de débordement
   horizontal, contrôles au clavier, focus visible et absence d'iframe/scripts tiers;
10. l'accueil sans « Dans les coulisses », ses sections commerciales, le carrousel
    des témoignages et les liens sociaux conservés dans le footer.

Les tests du manifeste vérifient aussi que chaque photographie et chaque miniature
vidéo configurée correspondent à un fichier local dans `public`. La validation
du domaine vérifie les formes et chemins locaux, pas l'existence physique ou la
provenance des fichiers. Voir aussi [la procédure de développement](developpement.md).

## 7. Déployer

Un push sur `main` déclenche GitHub Pages. Ne lancez pas de publication sans demande explicite. L'ajout d'une réalisation n'est visible en production qu'après un nouveau build et un nouveau déploiement.
