# Développer et vérifier le site

Ce guide décrit le frontend présent dans ce dépôt. Pour les choix métier et les
contrats et routes, consulter [l'architecture C4](ARCHITECTURE.md); le
[README](../README.md) sert de point d'entrée à la documentation.

## Installation et configuration

Utiliser Node.js 24 ou supérieur et npm. `package-lock.json` est la référence;
`npm ci` réinstalle les dépendances de façon reproductible. Les scripts disponibles
sont ceux de `package.json`; il n'existe pas de commande de lint ou de formatage.

```bash
node --version
npm ci
npm run dev
```

Sans configuration Supabase, le serveur de développement expose le catalogue de
`src/infrastructure/local/fallbackCatalog.ts`. Il ne simule aucun envoi réussi.
### Connecter un projet Supabase

```bash
cp .env.example .env.local
```

Renseigner uniquement les deux variables publiques prévues :

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Redémarrer Vite après modification. Ces variables sont intégrées au bundle et ne
sont pas des secrets serveur; ne jamais y placer une clé `service_role`. Ne pas
versionner `.env.local` ni exposer ses valeurs dans les logs ou captures.

### Utiliser la stack locale SAVIS

La stack, ses migrations et ses seeds appartiennent à
[SAVIS](https://github.com/wiljeanlouis/savis). Depuis le dépôt SAVIS, `make run-local`
prépare la stack et peut configurer le checkout voisin `../savouretplus`.
Pour un autre emplacement, SAVIS documente
`make run-local SAVOURETPLUS_DIR=/chemin/vers/savouretplus`. Lancer ensuite
`npm run dev` dans ce dépôt. Ne pas exécuter `make run-local` depuis Savour Et Plus.
Les autres commandes et ports doivent être vérifiés dans le
[README de SAVIS](https://github.com/wiljeanlouis/savis/blob/main/README.md).

### Prévisualiser la production

Pour voir le comportement de production :

```bash
npm run build
npm run preview
```

Le build utilise la configuration présente au moment de sa génération.
Sans configuration complète, le catalogue de production est vide. Une configuration
Supabase distante en erreur n'est jamais remplacée par le catalogue de démonstration.
Vite affiche l'adresse et le port effectivement disponibles pour `dev` et `preview`.

## Vérifications automatisées

Pour une modification de code ou de contenu TypeScript :

```bash
npm run typecheck
npm test -- --run
npm run build
git diff --check
```

`npm test` utilise déjà `vitest run`; `-- --run` est accepté et n'active pas de
veille. Les tests sont organisés dans `test/domain/`, `test/application/`,
`test/infrastructure/` et `test/components/`, avec les utilitaires dans
`test/shared/`. Les tests d'adaptateur utilisent des doubles Supabase, pas une
instance réelle. Les tests de composants utilisent principalement le rendu
statique et des appels de gestionnaires; ils ne remplacent pas un navigateur.

`typecheck` vérifie `src` et `vite.config.ts`. Le workflow GitHub Pages lance
`npm test` et le build, mais pas `typecheck`. Exécuter ce dernier localement.
Aucun script de test de bout en bout n'est configuré.

Pour une modification purement documentaire, contrôler les liens relatifs,
chemins, noms de scripts et contrats cités, puis lancer `git diff --check`.
Un build n'est pas nécessaire. Ne pas présenter une vérification ancienne comme
un résultat exécuté sur les modifications courantes.

## Vérifications manuelles

Utiliser des données de test pour les formulaires, sans soumettre de demande
réelle à une instance de production. Examiner mobile, tablette et desktop,
notamment les largeurs de 375, 768 et 1440 px, sans débordement horizontal.

| Parcours | Points à contrôler |
| --- | --- |
| Navigation | Menu mobile et Décoration au clavier, focus visible, Échap, lien actif, Précédent/Suivant et retour à la position connue |
| Accueil | Hero statique, expertises, réalisations, signature gourmande, engagements, témoignages et CTA final; absence de « Dans les coulisses » |
| Dégustation | Chargement/erreur/liste vide, nouvelle tentative, format, choix, répartition exacte, ingrédients et prix estimatif |
| Décoration | Catégories et liens profonds, autres décorations, états de fiche, galerie, quantité et préférences; aucun prix inventé |
| Ma sélection | Persistance après rafraîchissement, lignes distinctes/fusionnées, modifications et total des seuls produits tarifés |
| Commande | Éligibilité Dégustation seule, erreurs accessibles, double clic, reprise et conservation après échec |
| Soumission | Les six types, article présélectionné et reprise mono/mixte de la sélection sans ajout d'Organisation |
| Réalisations | Filtres, slugs, références/copie, légendes, photos et vidéos, aperçu manquant et lien de lecture exact |
| Lightbox | Photos uniquement, flèches gauche/droite, Échap, Tabulation contenue et retour du focus |
| Témoignages | Zéro/un/plusieurs avis, flèches et indicateurs, image locale, auteur, référence et bonne fiche |
| Contact/footer | Téléphones, courriel, URL YouTube/TikTok, icônes, noms accessibles et nouvel onglet lorsqu'annoncé |

Activer aussi `prefers-reduced-motion`. Vérifier que la galerie ne charge aucun
iframe ni script YouTube/TikTok et que sélectionner une vidéo n'ouvre pas sa
plateforme avant l'action de lecture.

Les réceptions de commande et de soumission doivent également être testées sur
une instance SAVIS/Supabase de test : succès avec identifiant, reprise identique,
refus métier et conflit d'idempotence. Ces résultats ne peuvent pas être déduits
des seuls tests frontend.

## Diagnostic

| Symptôme | Vérification |
| --- | --- |
| Catalogue vide en prévisualisation | Le build sans Supabase utilise volontairement une liste vide, même si `dev` affiche des produits locaux |
| Catalogue distant indisponible | Contrôler configuration, accès à `published_catalog_products`, filtre `is_available` et données publiées; le frontend ne bascule pas vers le local |
| Produit Dégustation absent | Vérifier identité, slug, nom et présence d'au moins un format d'achat normalisable |
| Envoi refusé en mode local | Comportement attendu : aucune RPC n'est configurée, aucun succès simulé |
| Demande en échec | Conserver sélection et identifiant en attente; corriger l'erreur sans purger le stockage pour forcer une reprise |
| Images absentes sur GitHub Pages | Vérifier fichier dans `public/`, chemin relatif `./images/...`, casse et build récent |
| Aperçu vidéo indisponible | Vérifier le fichier local et son chemin; utiliser le repli plutôt qu'une image fictive |
| Réalisation introuvable | Vérifier slug, unicité, `published` et validation du manifeste |

Les écritures réseau ont au plus trois tentatives automatiques, avec le même
payload. Le frontend ne définit pas de délai d'expiration explicite. En cas
d'échec, ne pas conclure que le backend n'a rien reçu : conserver l'idempotence.

## Limites connues

Les limites de routage, de provenance des médias, de stockage et de validation
sont centralisées dans [l'architecture](ARCHITECTURE.md#limites-connues).
Les scénarios ci-dessus permettent de les contrôler sans recopier ici les décisions
architecturales. Les inventaires et guides éditoriaux restent les références des
ressources et autorisations de contenu.

## Livrer

Examiner `git diff` sans supprimer les changements existants de l'utilisateur.
Ne modifier ni `dist/` ni `node_modules/` comme sources. Les secrets ne doivent
pas apparaître dans les fichiers, logs ou captures partagés.

Un push sur `main` déclenche la publication GitHub Pages; le workflow peut aussi
être déclenché manuellement. Le script `npm run deploy` publie via `gh-pages`.
Aucune de ces actions ne doit être lancée sans demande explicite. Un simple build
local ne déploie pas le site.
