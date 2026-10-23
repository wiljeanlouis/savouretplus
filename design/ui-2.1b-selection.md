# UI-2.1B — Sélection unifiée et parcours commerciaux

## Architecture retenue

Le hook `useCart()` reste l'unique état applicatif et conserve la route historique
`#/panier`. Son modèle `CartItem` distingue maintenant :

- un prix connu (`pricing: "known"`) avec les données de configuration Dégustation;
- une prestation sur soumission (`pricing: "quote"`) avec des prix à `null`;
- la catégorie, la sous-catégorie, le slug public, la quantité et une note éventuelle.

Le stockage `savouretplus-cart` utilise une enveloppe `{ version: 2, items }`. La
restauration accepte l'ancien tableau brut, complète les nouveaux champs et ignore les
lignes mal formées. Les sous-catégories inconnues deviennent `null` sans supprimer le
produit.

Deux configurations Dégustation différentes restent deux lignes. Deux décorations avec
des préférences différentes restent également distinctes; si une préférence modifiée
devient identique à une autre ligne, leurs quantités fusionnent.

## Parcours autorisés

- Une sélection composée uniquement de produits Dégustation tarifés peut être transmise
  à `receive_customer_order` avec les protections d'idempotence existantes.
- Une sélection Dégustation peut être transmise à `submit_quote_request` comme demande
  `traiteur` multiligne.
- Une sélection Décoration peut être transmise à `submit_quote_request` comme demande
  `decoration` multiligne.
- Le parcours direct d'un modèle Décoration par son slug reste disponible.

Les soumissions issues de « Ma sélection » conservent chaque véritable `offering_id`, la
quantité, la configuration et la note. La sélection n'est vidée qu'après une réponse de
succès du gateway.

## Limite backend identifiée

Les types de demande connus sont `traiteur`, `decoration`, `organisation`,
`decoration-organisation` et `traiteur-decoration-organisation`. Il n'existe pas de type
`traiteur-decoration` sans Organisation dans le contrat frontend documenté, et ce dépôt
ne contient pas la migration propriétaire de `submit_quote_request` permettant de
confirmer son acceptation côté SAVIS.

En conséquence, une sélection mixte Dégustation + Décoration reste consultable et
modifiable, mais aucun envoi n'est simulé. L'interface explique le blocage et n'ajoute
jamais artificiellement Organisation. Pour activer ce parcours, SAVIS/Supabase devra
définir et accepter un type correspondant exactement aux services `traiteur` et
`decoration`, puis confirmer la prise en charge multiligne associée.
