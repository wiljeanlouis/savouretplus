# Vidéos des réalisations et réseaux sociaux

Inventaire vérifié dans les sources et fichiers locaux le 27 octobre 2026.
Ce document décrit les médias des réalisations après suppression de « Dans les
coulisses » de l'accueil. Les plateformes s'ouvrent uniquement par un lien explicite, sans
iframe ni script tiers.

## Vidéos actuellement configurées

La source éditoriale est `src/content/realisations.ts`.

| Référence / réalisation | Vidéo TikTok | Aperçu local configuré |
| --- | --- | --- |
| `REA-0002` — anniversaire Winnie | [7694458492979105042](https://www.tiktok.com/@savouretplus/video/7694458492979105042) | `public/images/realisations/anniversaire-winnie/boisson-personnalisee.jpg` |
| `REA-0004` — anniversaire Marvensley | [7694479229433482514](https://www.tiktok.com/@savouretplus/video/7694479229433482514) | `public/images/realisations/anniversaire-marvensley/boisson-personnalisee.jpg` |
| `REA-0005` — bouquet-cadeau de billets bleu et or | [7694479528357416210](https://www.tiktok.com/@savouretplus/video/7694479528357416210) | `public/images/realisations/bouquet-cadeau-bleu-or/couverture.jpg` |

Ces trois aperçus sont des **photographies déjà présentes dans les réalisations**,
pas des captures ou couvertures officielles vérifiées de chaque vidéo. Les
fichiers sont réutilisés sans duplication. Toutes les ressources actuellement
référencées sont présentes dans le dépôt. Les vidéos sont placées après les
photographies par `displayOrder`; aucune ne remplace `coverImage` ou la photo
d'un témoignage.

L'association Marvensley a été explicitement fournie par le responsable du site
dans la demande d'ajout. Les associations Winnie et bouquet sont celles inscrites
dans le manifeste courant. Cette revue documentaire ne vérifie pas à nouveau
leur contenu sur TikTok et ne constitue pas une confirmation externe de provenance.

## Ressources historiques retirées

L'ancienne section d'accueil utilisait la vidéo TikTok
`7694458492979105042` et la vidéo YouTube
[Chips et boissons personnalisés](https://www.youtube.com/watch?v=u2pTPB8lK94).
La vidéo YouTube n'est associée à aucune réalisation dans le manifeste courant.
Ne pas la réintroduire dans une fiche sans confirmation explicite de l'événement.

La documentation antérieure recensait des miniatures officielles dans
`public/images/videos/` et une couverture sombre TikTok propre à Marvensley.
Ces fichiers ne sont plus présents dans l'arborescence actuelle et aucun
composant ne les référence. Les anciennes dimensions, poids et sources de
couverture ne décrivent donc plus les aperçus utilisés. Ne pas rétablir ces
fichiers sur la seule base de cet historique.

Lors de la recherche d'un meilleur aperçu Marvensley, les couvertures et l'aperçu
animé officiels se sont révélés sombres. L'accès direct au fichier vidéo a été
refusé (HTTP 403); aucune capture plus nette n'a été extraite. Pour remplacer
l'aperçu par une véritable image vidéo, obtenir une capture autorisée ou le
fichier source auprès du responsable du contenu. Ne pas contourner les
restrictions de la plateforme ni générer une fausse image de réalisation.

## Ajouter ou remplacer un aperçu

Suivre [le guide des réalisations](ajouter-une-realisation.md) :

1. Confirmer l'association vidéo/événement avant toute modification du manifeste.
2. Obtenir une capture autorisée ou une couverture de cette vidéo réelle.
3. Conserver la provenance dans cette documentation; vérifier le visuel et son poids.
4. Stocker la nouvelle image dans le dossier de la réalisation et renseigner
   `thumbnail` avec un chemin `./images/...` et `thumbnailAlt` factuel.
5. Garder le titre, la légende et l'ordre explicites, sans changer `id`, `slug`,
   `reference`, témoignages ou couverture photographique.
6. Si l'image manque, omettre `thumbnail` et `thumbnailAlt` : la galerie présente
   « Aperçu indisponible » avec son action de lecture. Ce repli couvre aussi un
   fichier qui échoue au chargement.

Un aperçu photographique existant doit rester identifié comme tel dans les
sources éditoriales; il ne prouve ni le contenu exact ni la provenance d'une vidéo.

## Profils et icônes

Les liens conservés sont :

- [TikTok — @savouretplus](https://www.tiktok.com/@savouretplus);
- [YouTube — @SavourEtplus](https://youtube.com/@SavourEtplus).

Les constantes partagées sont dans `src/components/home/homeContent.ts`.
Le footer les utilise pour les deux plateformes; Contact utilise la constante
TikTok et une URL YouTube littérale identique. Les icônes locales
`src/components/ui/TikTokIcon.tsx` et `src/components/ui/YouTubeIcon.tsx` utilisent
`currentColor`, sans dépendance ajoutée. Les liens du footer et le lien TikTok de
Contact s'ouvrent dans un nouvel onglet sécurisé. Le lien YouTube de Contact reste
une navigation dans l'onglet courant.

## Vérifier

Exécuter les commandes de [développement](developpement.md), puis contrôler les
trois fiches et leurs liens exacts sur mobile, tablette et desktop. La sélection
d'une miniature vidéo ne doit pas ouvrir de plateforme; seule l'action de lecture
le fait. Vérifier légendes, distinction des plateformes, focus, repli sans aperçu,
hauteur stable et lightbox limitée aux photos. Les profils Contact/footer et le
carrousel de témoignages doivent rester accessibles.
