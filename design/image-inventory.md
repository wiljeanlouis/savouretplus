# Inventaire des médias — ambiance, catalogue et réalisations

Provenances initialement consignées le 22 octobre 2026; usages et fichiers locaux
revus le 27 octobre 2026. Les liens de source et indications de licence ci-dessous
reprennent l'inventaire antérieur; ils n'ont pas été revérifiés en ligne lors de
cette revue. Les visuels d'ambiance ne doivent pas être présentés comme des
réalisations authentiques de SavouretPlus.

## Ambiances de l'accueil et des pages commerciales

| Fichier local | Usage | Source et auteur | Licence | Traitement local |
|---|---|---|---|---|
| `public/images/home/ambient-hero-floral-reception.jpg` | Hero statique de l'accueil — réception florale | [Pexels, photo 35985205](https://www.pexels.com/photo/elegant-wedding-reception-decor-with-floral-arrangements-35985205/), Jonathan Borba | [Licence Pexels](https://www.pexels.com/license/) — utilisation commerciale autorisée, attribution non obligatoire | Copie locale JPEG, largeur 1800 px, compression Pexels, 253 Ko |
| `public/images/home/ambient-floral-decoration.jpg` | Carte Décoration de l'accueil et Hero Décoration — composition florale d'ambiance | [Unsplash, photo QvprbCoOkLY](https://unsplash.com/photos/elegant-wedding-reception-table-with-floral-centerpiece-and-chairs-QvprbCoOkLY), Jonathan Borba | [Licence Unsplash](https://unsplash.com/license) — utilisation commerciale autorisée, attribution non obligatoire | Recadrage 16:9 fourni par le service d'images Unsplash, 1600 × 900 px, 281 Ko |
| `public/images/home/ambient-gastronomy-table.jpg` | Carte Dégustation — table gastronomique événementielle | [Pexels, photo 28976228](https://www.pexels.com/photo/elegant-event-table-with-appetizers-and-decor-28976228/), Angel Ayala | [Licence Pexels](https://www.pexels.com/license/) — utilisation commerciale autorisée, attribution non obligatoire | Recadrage 16:9 fourni par le service d'images Pexels, 1600 × 900 px, 167 Ko |
| `public/images/home/ambient-handcrafted-canapes.jpg` | Signature gastronomique — table de bouchées artisanales | Visuel généré avec OpenAI à partir d'une référence de composition fournie par le client | Illustration générée pour le projet; ne représente pas un produit ou une réalisation authentique de SavouretPlus | JPEG local, 1536 × 1024 px, 420 Ko; badge « Image d'ambiance » affiché sur le site |
| `public/images/home/ambient-elegant-reception.jpg` | Carte Nos services et hero Services — salle de réception | [Unsplash, photo wYWeVmlGWHM](https://unsplash.com/photos/wedding-reception-tables-with-floral-centerpieces-wYWeVmlGWHM), Mathis Payet Descombes | [Licence Unsplash](https://unsplash.com/license) — utilisation commerciale autorisée, attribution non obligatoire | Recadrage 16:9 fourni par le service d'images Unsplash, 1600 × 900 px, 276 Ko |

## Autres médias locaux

| Groupe ou fichier | Usage actuel et provenance documentée |
| --- | --- |
| `public/images/brand/savour_et_plus_logo.png`, `public/images/brand/favicon.ico` | Identité visuelle du site |
| `public/images/catalog/tasting/` | Photographies Dégustation et illustrations de catalogue déjà présentes dans le projet; les produits distants peuvent fournir d'autres URL |
| `public/images/catalog/decoration/` | Médias du catalogue local de développement; données distantes normalisées par l'adaptateur Supabase |
| `public/images/realisations/` | Treize photographies réparties entre cinq réalisations, gérées par `src/content/realisations.ts`; préserver identifiants et références |
| `public/images/services-decoration-ambiance.jpg` | Installation florale présentée comme photographie d'ambiance dans Services; source/licence non consignées dans l'inventaire initial, à documenter |
| `public/images/services-traiteur-plateaux.jpg` | Présentation traiteur dans Services; source/licence non consignées dans l'inventaire initial, à documenter |

L'illustration générée `ambient-handcrafted-canapes.jpg` conserve son badge
« Image d'ambiance » dans `GastronomySection`; ce visuel n'est ni une photo produit
ni une réalisation réelle. Les visuels d'ambiance des pages commerciales restent
séparés du manifeste du portfolio.

## Aperçus vidéo et icônes

Les trois vidéos TikTok du manifeste utilisent actuellement des photos existantes
de leur réalisation comme aperçus : `boisson-personnalisee.jpg` pour Winnie et
Marvensley, `couverture.jpg` pour le bouquet bleu et or. Ces photos ne sont pas des
captures vérifiées des vidéos. Les fichiers historiques du dossier
`public/images/videos/` et la couverture TikTok sombre propre à Marvensley ne sont
plus présents. L'état courant et l'historique sont détaillés dans
[les ressources vidéo](../docs/medias-video.md).

Les icônes des réseaux sont des SVG natifs dans
`src/components/ui/YouTubeIcon.tsx` et `src/components/ui/TikTokIcon.tsx`, utilisés
dans Contact et le footer. Elles héritent de la couleur courante et ne demandent
ni image raster ni chargement externe. Les autres icônes utilisent `lucide-react`.

## Maintenir l'inventaire

Pour ajouter un média, consigner son fichier, son usage, sa source et les droits
confirmés. Distinguer photographie réelle, photo d'ambiance, illustration générée
et capture vidéo. Ne pas inventer une provenance manquante. Le contrôle des chemins
et les tests ne prouvent pas une autorisation d'utilisation.

Réutiliser les ressources locales adaptées plutôt que dupliquer des fichiers.
Les URL dans le frontend restent relatives `./images/...`; les fichiers sont
stockés dans `public/images/`. Ne pas recopier `public/` dans l'URL servie.
Pour le portfolio, suivre [le guide éditorial](../docs/ajouter-une-realisation.md).

Les sources TypeScript actuelles ne contiennent plus d'URL Unsplash/Pexels pour
charger ces ambiances à l'exécution : elles sont servies localement. Cela ne
supprime pas la nécessité de conserver leur provenance ni celle de vérifier
les médias fournis par un catalogue distant.
