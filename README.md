# Savour Et Plus

Site public de Savour Et Plus : catalogue Dégustation et Décoration,
configuration de produits, « Ma sélection » persistante, commandes, demandes de
soumission et portfolio multimédia. Le frontend utilise React, TypeScript,
Vite et Tailwind CSS; Supabase constitue sa frontière avec SAVIS.

## Démarrage rapide

Prérequis : **Node.js 24 ou supérieur** et **npm**.

```bash
npm ci
npm run dev
```

Vite affiche l'adresse du serveur. Sans configuration Supabase, le mode de
développement permet de consulter le catalogue local; les envois échouent
explicitement. Pour connecter Supabase, utiliser la stack SAVIS ou prévisualiser
le build de production, suivre le [guide de développement](docs/developpement.md).

## Documentation

Chaque document a un périmètre précis pour éviter les doublons :

| Document | Contenu de référence |
| --- | --- |
| [Architecture C4](docs/ARCHITECTURE.md) | Contexte, conteneurs, composants, flux, routes, contrats, propriété des données et livraison |
| [Développement](docs/developpement.md) | Installation, configuration, commandes, vérifications, diagnostic et procédure de livraison |
| [Gestion des réalisations](docs/ajouter-une-realisation.md) | Ajouter photos, vidéos et témoignages; conserver les identités et publier le contenu |
| [Médias vidéo](docs/medias-video.md) | Liens configurés, aperçus utilisés et provenance à confirmer |
| [Inventaire des médias](design/image-inventory.md) | Sources, droits consignés et usages des visuels |
| [Référence visuelle C2](design/reference/homepage-c2.png) | Référence graphique du site |
| [Consignes des agents](AGENTS.md) | Règles de contribution et contraintes d'exécution |

L'architecture détaillée se trouve uniquement dans `docs/ARCHITECTURE.md`.
Les procédures et exemples éditoriaux restent dans leurs guides spécialisés.

## Organisation du dépôt

```text
src/          Application : domaine, cas d'utilisation, adaptateurs et interface
public/       Ressources statiques, images et domaine personnalisé
test/         Tests par couche et fonctionnalité
docs/         Architecture et guides de développement et de contenu
design/       Référence visuelle et inventaire des médias
```

SAVIS possède les modèles métier internes, les migrations Supabase et les
traitements opérationnels. Ce dépôt possède l'expérience client et le contenu
éditorial statique. Les responsabilités et échanges sont détaillés dans
[les vues C4](docs/ARCHITECTURE.md#contexte-système--c4-niveau-1).

## Contribution et publication

Exécuter les [vérifications adaptées au changement](docs/developpement.md#vérifications-automatisées)
avant livraison. Conserver npm et le lockfile, préserver les changements existants
et ne pas versionner `.env.local` ni de clé serveur.

Un push sur `main` déclenche la publication GitHub Pages. Ne pas pousser,
déployer ou lancer `npm run deploy` sans demande explicite. Les étapes techniques
de publication sont décrites dans [l'architecture de livraison](docs/ARCHITECTURE.md#architecture-de-livraison)
et la [procédure de livraison](docs/developpement.md#livrer).
