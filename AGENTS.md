# Instructions pour les agents

Ces instructions s'appliquent à l'ensemble du dépôt Savour Et Plus.

## Contexte et sources

Ce dépôt contient le site client public de Savour Et Plus : catalogue,
configuration de produits, sélection persistante, commandes, demandes de
soumission et portfolio de réalisations. SAVIS et Supabase portent les données
et les traitements opérationnels.

- Lire `README.md` pour le démarrage et `ARCHITECTURE.md` pour les frontières métier.
- Consulter `design/` pour les références visuelles et `docs/` pour les procédures.
- Vérifier les chemins, contrats et commandes dans le code actuel : certaines
  sections de la documentation décrivent une structure antérieure.
- Limiter les modifications au besoin demandé et préserver les changements
  existants de l'utilisateur.

## Environnement et commandes

Utiliser Node.js 24 ou supérieur, conformément à `package.json`, et npm avec
`package-lock.json`. Ne pas introduire un autre gestionnaire de paquets.

```bash
npm ci                 # installation reproductible
npm run dev            # serveur Vite
npm test               # suite Vitest, sans mode veille
npm run typecheck      # tsc --noEmit
npm run build          # production dans dist/
npm run preview        # prévisualisation du build
```

Aucun script de lint ou de formatage n'est actuellement configuré. Ne pas
inventer de commande de vérification.

## Organisation et dépendances

- `src/domain/` : modèles et règles métier; garder cette couche indépendante
  de React et de Supabase.
- `src/application/` : cas d'utilisation, validation des demandes, état du
  panier et navigation; `commerce.ts` expose la façade commerciale.
- `src/application/ports/CommerceGateway.ts` : contrat du backend commercial.
- `src/infrastructure/` : composition des adaptateurs, catalogue local et
  intégration Supabase. La normalisation des données distantes reste ici.
- `src/components/` : pages et composants regroupés par fonctionnalité;
  `src/components/ui/` contient les primitives réutilisables.
- `src/shared/` : utilitaires communs et formatage.
- `src/content/realisations.ts` : manifeste du portfolio statique.
- `src/main.tsx` : composition de l'application; garder ce point d'entrée léger.
- `src/styles.css` : thème Tailwind et styles globaux.
- `test/` : tests Vitest organisés selon les couches et fonctionnalités.
- `public/images/` : médias locaux servis dans le site.

Les composants passent par la façade commerciale et les hooks applicatifs;
ils ne doivent pas appeler Supabase directement. Tout nouveau backend doit
implémenter le port commercial dans un adaptateur d'infrastructure.

## Invariants métier

- Distinguer commande directe et demande de soumission. Ne pas ajouter un
  service non demandé pour contourner une limitation du contrat backend.
- Les prix affichés côté client sont estimatifs; Supabase/SAVIS valident les
  prix, les disponibilités et les payloads.
- Conserver les montants en cents pour les calculs et utiliser le formatage
  partagé en français canadien et dollars canadiens.
- Préserver les configurations de produits : format, choix, répartition des
  unités et quantités d'ingrédients. Les suppléments d'ingrédients concernent
  uniquement les quantités au-dessus de `default_quantity`.
- Les décorations restent « sur soumission » avec un prix `null`; ne pas leur
  attribuer un prix artificiel.
- `src/application/cart/useCart.ts` gère la sélection persistée sous
  `savouretplus-cart`. Préserver la lecture et la migration des données déjà
  enregistrées lors d'une évolution du format.
- Préserver l'idempotence des demandes et leurs identifiants lors des reprises.
  Effacer la sélection uniquement après confirmation de réception, jamais
  après une erreur ou un délai dépassé.
- Sans configuration Supabase, garder le catalogue local utilisable et faire
  échouer explicitement les envois, sans afficher un succès simulé.
- Les migrations et seeds Supabase appartiennent au dépôt SAVIS. Le démarrage
  local `make run-local` s'effectue depuis SAVIS, pas depuis ce dépôt.

## Interface, navigation et médias

- Conserver une application statique compatible avec GitHub Pages : routage
  par hash, `base: "./"` dans Vite et chemins relatifs des ressources publiques.
- Respecter les routes et paramètres définis dans le code de navigation.
- Garder les textes destinés aux clients en français et reprendre les termes
  existants, notamment « Ma sélection » et « soumission ».
- Réutiliser les primitives UI, les utilitaires et les couleurs du thème.
  Suivre les conventions TypeScript/TSX des fichiers voisins; typer les
  nouvelles props et les contrats sans modifier globalement le mode strict.
- Préserver l'usage au clavier, les libellés accessibles, le focus visible,
  les états de chargement/erreur et `prefers-reduced-motion`.
- Pour le portfolio, suivre `docs/ajouter-une-realisation.md`. Utiliser des
  photos dont la provenance est confirmée; ne pas présenter une image générée
  ou de catalogue comme une réalisation réelle. Maintenir les identifiants et
  slugs uniques ainsi que la cohérence du manifeste et des images locales.

## Configuration et livraison

- Ne pas versionner `.env.local` ni exposer ses valeurs. Les variables `VITE_*`
  sont publiques dans le bundle : seuls l'URL et la clé publique Supabase
  attendues doivent y figurer, jamais une clé serveur ou `service_role`.
- Modifier les sources plutôt que `dist/` ou `node_modules/`.
- Pour une modification de code, exécuter `npm test`, `npm run typecheck` et
  `npm run build`. Ajouter ou adapter des tests ciblés lorsqu'un comportement
  métier change. Pour une modification purement documentaire, vérifier les
  chemins et les commandes sans imposer un build inutile.
- Pour une modification visuelle, vérifier les parcours concernés sur mobile
  et ordinateur lorsque la prévisualisation est disponible.
- Mettre à jour la documentation lorsqu'une modification change les routes,
  contrats backend, modèles métier ou procédures de développement.
- Résumer les modifications, les vérifications effectuées et toute limite
  rencontrée. Ne pas annoncer une vérification qui n'a pas été exécutée.
- Un push sur `main` déclenche le déploiement GitHub Pages. Ne pas lancer
  `npm run deploy` ni publier sans demande explicite de l'utilisateur.
