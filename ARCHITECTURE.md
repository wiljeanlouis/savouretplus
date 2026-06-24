# Architecture de Savour Et Plus

## Vision du projet

Savour Et Plus est le site client public de l'entreprise. Il permet aux clients de :

- découvrir les spécialités, le service traiteur et les services événementiels;
- commander directement des produits configurables;
- demander une soumission pour le traiteur, la décoration, l'organisation d'événement ou une combinaison de services;
- transmettre les commandes et demandes à SAVIS par l'intermédiaire de Supabase.

Le site est volontairement une application frontend légère. Il ne possède pas la logique opérationnelle de SAVIS et ne constitue pas le système de référence pour les produits, les commandes ou les soumissions.

## Vue d'ensemble

Le système comporte trois frontières principales :

```text
Navigateur du client
  -> application React statique
  -> Supabase
       -> vue publique du catalogue
       -> table de commandes
       -> RPC de soumission
  -> SAVIS et ses processus opérationnels
```

Le dépôt contient une seule application déployable :

- React et TypeScript pour l'interface;
- Vite pour le développement et la production;
- Tailwind CSS pour les styles;
- Supabase JS comme adaptateur de données;
- GitHub Pages pour l'hébergement statique.

## Structure du code

```text
src/
  components/
    ui/                  Composants d'interface génériques
    HomePage.tsx         Accueil et carrousel des offres
    CatalogPage.tsx      Catalogue et configuration des produits
    QuotePage.tsx        Demande de soumission centralisée
    CartDrawer.tsx       Panier et envoi de commande
    Header.tsx           Navigation principale
    Footer.tsx           Pied de page
  application/
    commerce.ts          Façade des cas d'utilisation
    ports/
      CommerceGateway.ts Port indépendant du fournisseur de backend
  domain/
    catalog.ts           Modèle métier du catalogue
    cart.ts              Modèle métier du panier
  infrastructure/
    createCommerceGateway.ts       Composition des dépendances
    local/LocalCommerceGateway.ts  Mode de développement simulé
    local/fallbackCatalog.ts       Catalogue local de secours
    supabase/SupabaseCommerceGateway.ts
                                  Adaptateur Supabase et normalisation
  lib/
    useCart.ts           État et persistance locale du panier
    format.ts            Formatage des valeurs
    utils.ts             Utilitaires d'interface
  main.tsx               Composition de l'application et routage
  styles.css             Thème Tailwind et styles globaux
```

## Principes architecturaux

### Frontière du backend commercial

Les composants appellent la façade `application/commerce.ts`. Celle-ci
délègue au port `CommerceGateway` et ne connaît ni Supabase, ni HTTP, ni la
forme future de l'API SAVIS.

La composition dans `main.tsx` choisit actuellement :

- `SupabaseCommerceGateway` lorsque les variables Supabase sont présentes;
- `LocalCommerceGateway` pour le catalogue de secours et les écritures simulées.

Une migration vers l'API SAVIS consiste à implémenter un
`SavisApiCommerceGateway` puis à le sélectionner dans
`createCommerceGateway.ts`. Les pages et les cas d'utilisation restent
inchangés.

### Application frontend statique

Le site doit pouvoir être produit en fichiers statiques et servi par GitHub Pages. Il ne dépend donc pas d'un serveur Node en production.

Conséquences :

- la configuration Vite utilise `base: "./"`;
- les ressources publiques utilisent des chemins relatifs;
- les secrets serveur ne doivent jamais être placés dans le frontend;
- seules des clés publiques, comme la clé anonyme Supabase, peuvent être exposées via `VITE_*`.

### Routage par hash

Le routage est implémenté dans `main.tsx` avec `window.location.hash`.

Routes publiques :

```text
#/accueil
#/degustation
#/soumission
#/contact
```

Cette décision évite les erreurs de rafraîchissement et les règles de réécriture propres aux SPA sur GitHub Pages. Les routes inconnues reviennent à l'accueil. Aucun alias historique n'est maintenu pendant la phase de développement.

Le paramètre suivant permet de présélectionner un service :

```text
#/soumission?service=traiteur
#/soumission?service=decoration
#/soumission?service=organisation
#/soumission?service=decoration-organisation
#/soumission?service=traiteur-decoration-organisation
```

### Deux parcours commerciaux distincts

Les commandes directes et les demandes de soumission sont deux parcours différents.

```text
Commande directe
  -> catalogue
  -> configuration d'un produit
  -> panier
  -> coordonnées du client
  -> customer_orders

Demande de soumission
  -> choix des services
  -> renseignements sur l'événement
  -> items traiteur si nécessaire
  -> RPC submit_quote_request
```

Une soumission n'a pas de prix final côté client. Le budget est indicatif et l'équipe confirme ensuite les détails, quantités, ajustements et conditions.

## Catalogue et produits

### Source du catalogue

`fetchCatalogProducts()` passe par le port commercial. L'adaptateur Supabase
lit la vue `public_catalog_products` :

```text
public_catalog_products
  -> is_available = true
  -> tri par display_order
  -> normalisation en CatalogProduct
```

Si Supabase n'est pas configuré, si la requête échoue ou si elle ne retourne aucun produit, l'application utilise `fallbackCatalog.ts`.

Cette stratégie permet :

- de développer l'interface sans dépendre du backend;
- de conserver un site fonctionnel en cas d'indisponibilité temporaire;
- d'offrir une structure métier identique aux données distantes et locales.

### Modèle de produit

Les produits utilisent un modèle explicite défini dans `domain/catalog.ts` :

- `standard` : produit sans personnalisation;
- `single_choice` : un choix exclusif dans `choice_group`;
- `single_choice_bundle` : un format dans `purchase_modes`, avec choix simple ou répartition;
- `ingredient_customization` : quantités ajustables dans `ingredient_options`.

`single_choice_bundle` prend en charge deux modes d'allocation :

- `single_choice` : une seule option pour tout le format;
- `choice_allocation` : répartition exacte de la quantité du format, par exemple une douzaine.

Pour une personnalisation d'ingrédients :

- retirer un ingrédient ne réduit pas le prix;
- seules les quantités au-dessus de `default_quantity` ajoutent un supplément;
- la configuration complète est conservée dans l'item du panier.

### Normalisation

Supabase peut exposer des champs partiels ou historiques. `normalizeCatalogProduct()` garantit que l'interface reçoit toujours un `CatalogProduct` cohérent :

- tableaux vides pour les options absentes;
- catégorie et libellés par défaut;
- prix convertis en nombres;
- galerie et image de secours;
- inférence du `product_type` si nécessaire.

La normalisation doit rester dans l'adaptateur Supabase, pas dans les composants visuels.

## Panier et commandes

### Supabase local

La stack locale est détenue et démarrée par SAVIS avec `make run-local`. Elle
est gérée par la CLI Supabase et Docker, et utilise les ports `54321` à
`54324`, dont PostgreSQL sur `54322`.

Les migrations et seeds vivent dans le dépôt SAVIS. Savouretplus reçoit
seulement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans son
`.env.local`, généré par le démarrage local de SAVIS.

### État local

`useCart()` est l'unique propriétaire de l'état du panier. Il expose :

```text
items
count
totalCents
add(...)
updateQuantity(...)
remove(...)
clear()
```

Le panier est conservé dans `localStorage` sous la clé :

```text
savouretplus-cart
```

Il survit donc à un rafraîchissement du navigateur, mais il n'est pas synchronisé entre appareils et n'est pas un panier authentifié.

### Identité d'un item

La clé d'un item combine :

- l'identifiant du produit;
- le format d'achat;
- le choix exclusif;
- la répartition du bundle;
- les quantités d'ingrédients.

Deux configurations identiques fusionnent leurs quantités. Deux configurations différentes restent des lignes distinctes.

### Envoi d'une commande

`CartDrawer` collecte les coordonnées du client puis appelle `createCustomerOrder()`.

Écriture Supabase :

```text
table: customer_orders

customer_name
customer_phone
customer_email
note
status = "new"
source = "savouretplus"
total_cents
items
```

Le total affiché est calculé côté client. SAVIS doit traiter les données reçues comme une demande client et appliquer les validations métier nécessaires avant exécution.

## Soumission centralisée

`QuotePage` est le seul formulaire public de soumission.

Types de demande :

- traiteur;
- décoration;
- organisation d'événement;
- décoration et organisation;
- traiteur, décoration et organisation.

Les champs communs décrivent le client, l'événement, le lieu, le budget et les besoins particuliers.

Lorsque la demande inclut le traiteur :

- les produits du catalogue sont affichés;
- au moins un item doit être sélectionné;
- les allergies ou restrictions alimentaires sont proposées;
- les quantités et notes par item sont transmises.

Payload actuel :

```ts
{
  type: "QUOTE_REQUEST",
  customer: {
    name,
    phone,
    email
  },
  requested_services: ["traiteur", "decoration", "organisation"],
  event_details: {
    request_type,
    event_type,
    event_date,
    event_time,
    event_address,
    guest_count,
    budget,
    allergies,
    note
  },
  items: [
    {
      offering_id,
      name,
      requested_quantity,
      configuration,
      note
    }
  ]
}
```

L'adaptateur appelle la RPC générique :

```text
submit_quote_request(payload jsonb)
```

Le frontend conserve un seul point d'entrée `submitQuoteRequest()` pour toutes les demandes, peu importe la combinaison de services sélectionnée.

## Intégration Supabase et SAVIS

Le frontend ne communique pas directement avec les services internes de SAVIS. Supabase constitue sa frontière publique.

Responsabilités du frontend :

- présenter et normaliser le catalogue public;
- collecter les commandes et soumissions;
- effectuer les validations d'expérience utilisateur;
- afficher les états de chargement, succès et erreur.

Responsabilités de Supabase/SAVIS :

- sécuriser les accès avec les politiques appropriées;
- valider les payloads côté serveur;
- vérifier l'existence et la disponibilité des produits;
- recalculer ou confirmer les prix;
- traiter les commandes et soumissions;
- gérer les statuts et workflows opérationnels.

Variables d'environnement :

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Sans ces deux variables, les lectures utilisent le catalogue de secours et les écritures sont simulées dans la console.

## Interface et expérience utilisateur

### Navigation

La navigation principale est volontairement réduite :

- Accueil;
- Dégustation;
- Soumission;
- Contact.

La page Dégustation garde un appel clair vers une soumission traiteur avec présélection du service. La page Soumission centralise toutes les variantes de demandes.

### Médias

Les images locales sont servies depuis `public/images`. Certaines images temporaires proviennent actuellement d'Unsplash. Les photos réelles de Savour Et Plus doivent être privilégiées dès qu'elles sont disponibles afin de mieux représenter le service et de supprimer cette dépendance externe.

### Accessibilité et mouvement

Le carrousel de l'accueil :

- conserve des dimensions stables;
- peut être contrôlé par des boutons;
- se met en pause au survol et au focus;
- respecte `prefers-reduced-motion`;
- expose des libellés accessibles.

Les composants interactifs doivent conserver les mêmes principes : contrôle clavier, noms accessibles, focus visible et absence de déplacement de mise en page.

## TypeScript

Tout le code applicatif sous `src/` est en TypeScript.

Décisions actuelles :

- les modèles métier partagés vivent dans `domain/`;
- les composants utilisent `.tsx`;
- les adaptateurs et utilitaires utilisent `.ts`;
- `tsc --noEmit` est la vérification de type officielle;
- `moduleResolution: "Bundler"` est utilisé avec Vite;
- le projet est actuellement en `strict: false`.

`strict: false` facilite la migration progressive depuis JavaScript. La direction souhaitée est de typer les props de composants, formulaires et payloads, puis d'activer le mode strict lorsque les erreurs restantes auront été éliminées.

## Déploiement

Le workflow `.github/workflows/deploy.yml` déploie sur GitHub Pages :

```text
push sur main
  -> Node 24
  -> npm ci
  -> npm run build
  -> publication de dist/
```

Les variables Supabase sont injectées depuis les secrets GitHub Actions :

- `VITE_SUPABASE_URL`;
- `VITE_SUPABASE_ANON_KEY`.

Le domaine personnalisé est `savouretplus.com`, déclaré dans `public/CNAME`.

## Qualité et vérification

Commandes obligatoires avant intégration :

```bash
nvm use v24
npm run typecheck
npm run build
```

Le projet ne possède pas encore de suite de tests automatisés ni de linter configuré. Les prochaines améliorations recommandées sont :

- tests unitaires pour la tarification et les clés du panier;
- tests de composants pour les configurateurs produits;
- tests des variantes de soumission;
- tests d'intégration de l'adaptateur Supabase;
- ESLint et formatage automatisé;
- activation progressive de `strict: true`.

## Règles d'évolution

- Garder `main.tsx` comme composition root légère.
- Garder les contrats backend dans `application/ports`.
- Ne pas appeler Supabase directement depuis les composants.
- Ajouter un adaptateur d'infrastructure pour chaque nouveau backend.
- Définir les modèles métier partagés dans `domain/`.
- Ne pas mélanger commande directe et soumission.
- Ne jamais considérer le prix calculé dans le navigateur comme une validation serveur.
- Maintenir le catalogue local compatible avec `CatalogProduct`.
- Préserver le fonctionnement sans Supabase pour le développement.
- Préférer des composants ciblés avant d'introduire une gestion d'état globale.
- Documenter ici toute nouvelle décision qui modifie les routes, les contrats Supabase, le modèle produit ou les frontières avec SAVIS.
