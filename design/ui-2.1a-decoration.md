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

## Évolution UI-2.1B

La décision UI-2.1B est documentée dans [ui-2.1b-selection.md](ui-2.1b-selection.md).
Le même état local accueille désormais Dégustation et Décoration, tout en conservant
leurs règles commerciales distinctes et sans attribuer de prix aux décorations.
