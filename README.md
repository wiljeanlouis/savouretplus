# Savour Et Plus

Site client public de Savour Et Plus, construit avec React, TypeScript, Vite et Tailwind CSS.

L'application permet de :

- découvrir les spécialités et services;
- commander des produits configurables;
- conserver un panier local;
- demander une soumission centralisée pour le traiteur, la décoration et l'organisation d'événements;
- transmettre les commandes et soumissions à SAVIS par Supabase.

Pour les décisions techniques et les flux détaillés, consulter [ARCHITECTURE.md](ARCHITECTURE.md).

## Prérequis

- Node.js 24 recommandé;
- npm;
- un projet Supabase pour utiliser les données réelles.

Le dépôt déclare Node `>=20.19.0`, mais le développement et le déploiement utilisent Node 24.

## Installation

```bash
nvm use v24
npm install
cp .env.example .env.local
npm run dev
```

Le serveur Vite affiche l'URL locale au démarrage.

## Supabase local

SAVIS est propriétaire de la stack Supabase locale, de ses migrations et de
ses données de développement. Depuis le dépôt SAVIS :

```bash
make run-local
```

Cette commande démarre Supabase et SAVIS, puis génère automatiquement le
`.env.local` de Savouretplus. Il reste ensuite à démarrer le frontend :

```bash
npm run dev
```

Services locaux :

```text
API Supabase   http://127.0.0.1:54321
PostgreSQL     127.0.0.1:54322
Studio         http://127.0.0.1:54323
Inbucket       http://127.0.0.1:54324
```

Commandes utiles depuis SAVIS :

```bash
make supabase-status
make supabase-reset
make stop
```

Le schéma et les seeds sont versionnés dans le dossier `supabase/` de SAVIS.

## Variables d'environnement

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Sans configuration Supabase :

- le catalogue utilise `src/infrastructure/local/fallbackCatalog.ts`;
- les commandes et soumissions sont simulées dans la console;
- l'interface demeure utilisable pour le développement.

## Commandes

```bash
npm run dev        # serveur de développement
npm run typecheck  # vérification TypeScript
npm run build      # build de production dans dist/
npm run preview    # prévisualisation du build
npm run deploy     # déploiement manuel avec gh-pages
```

Avant de livrer une modification :

```bash
npm run typecheck
npm run build
```

## Routes

Le site utilise un routage par hash compatible avec GitHub Pages :

```text
#/accueil
#/degustation
#/soumission
#/contact
```

Une soumission peut être présélectionnée :

```text
#/soumission?service=traiteur
#/soumission?service=decoration
#/soumission?service=organisation
#/soumission?service=decoration-organisation
#/soumission?service=traiteur-decoration-organisation
```

## Structure

```text
src/
  components/       Pages et composants React
  components/ui/    Primitives d'interface
  application/      Cas d'utilisation et port du backend commercial
  domain/           Modèles métier du catalogue et du panier
  infrastructure/   Adaptateurs local et Supabase
  lib/              État du panier et utilitaires
  main.tsx           Routage et composition de l'application
  styles.css         Thème et styles globaux
```

## Parcours client

### Commande directe

```text
Dégustation
  -> configuration du produit
  -> panier
  -> coordonnées
  -> customer_orders
```

Les formats, choix, répartitions et ingrédients sont conservés dans les items de commande. Le panier est persisté dans `localStorage`.

### Demande de soumission

```text
Soumission
  -> choix du ou des services
  -> détails de l'événement
  -> items si le traiteur est inclus
  -> RPC submit_quote_request
```

La page prend en charge :

- traiteur;
- décoration;
- organisation d'événement;
- décoration et organisation;
- offre combinée incluant le traiteur.

Le frontend utilise le point d'entrée générique `submitQuoteRequest()`.

## Modèle produit

Les modèles métier principaux sont définis dans `src/domain/`.

Types de produits :

- `standard`;
- `single_choice`;
- `single_choice_bundle`;
- `ingredient_customization`.

Un bundle peut utiliser :

- `single_choice` pour appliquer une option à tout le format;
- `choice_allocation` pour répartir exactement les unités d'un format.

Pour les ingrédients personnalisables, seules les quantités ajoutées au-dessus de `default_quantity` augmentent le prix.

## Supabase

Le frontend utilise :

| Ressource | Usage |
| --- | --- |
| `published_catalog_products` | Lecture des produits publiés et disponibles |
| `customer_orders` | Création des commandes directes |
| `submit_quote_request(payload jsonb)` | Création des demandes de soumission |

Supabase et SAVIS doivent effectuer les validations métier et de sécurité. Le frontend ne doit jamais être considéré comme la source de vérité pour les prix ou la disponibilité.

## Déploiement

Les pushes sur `main` déclenchent `.github/workflows/deploy.yml` :

1. installation avec Node 24 et `npm ci`;
2. build Vite;
3. publication de `dist/` sur GitHub Pages.

Les secrets GitHub requis sont :

- `VITE_SUPABASE_URL`;
- `VITE_SUPABASE_ANON_KEY`.

Le domaine personnalisé est `savouretplus.com`.

## État du projet

Le site est en développement actif.

Points techniques à renforcer :

- tests automatisés;
- ESLint et formatage;
- types de props plus stricts;
- passage progressif de TypeScript à `strict: true`;
- remplacement des images temporaires externes par les photos réelles de Savour Et Plus.
