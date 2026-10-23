# UI-2.1A — Décisions catalogue Décoration

## Navigation et identité

- Les pages de détail utilisent `#/decoration/:slug`.
- Le slug publié sert uniquement à la navigation et à la résolution dans le catalogue publié.
- L'identifiant métier reste `CatalogProduct.id`. Le CTA de détail conserve le parcours existant `item=:slug`; le formulaire résout ensuite le produit publié et transmet `product.id` dans `offering_id`.
- Un slug invalide n'est pas accepté par le routeur. Un slug valide mais absent du catalogue publié affiche l'état « introuvable ou plus disponible ».

## Données affichées

Le frontend utilise uniquement les champs actuellement normalisés : nom, description, sous-catégorie, image, galerie et note de disponibilité. Les prix et les modalités de commercialisation ne sont pas présentés sur les pages Décoration.

Le catalogue actuel ne publie pas de données structurées permettant de distinguer de manière fiable :

- la location;
- l'achat;
- la prestation avec installation;
- les services complémentaires de livraison, installation ou démontage.

Ces informations devront être modélisées dans SAVIS et exposées par le catalogue publié avant leur ajout à l'interface. Aucun champ Supabase ni contrat RPC n'a été modifié dans cette phase.

## Préparation UI-2.1B

Les cartes restent indépendantes du formulaire et conservent `product.id` et `product.slug`. Une sélection multiple nécessitera un modèle de sélection séparé contenant au minimum les identifiants métier et les quantités. Le contrat actuel accepte déjà une liste `items`, mais il faudra confirmer côté SAVIS que plusieurs articles Décoration et leurs préférences sont autorisés avant d'ajouter une persistance ou une interface de sélection.

Le panier Dégustation ne doit pas être réutilisé pour cette sélection sans décision métier explicite.
