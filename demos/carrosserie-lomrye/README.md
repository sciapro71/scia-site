# Carrosserie Lomrye — site vitrine

Site one-page premium : HTML / CSS / JavaScript purs, **aucune dépendance, aucun build**.
Ouvrez `index.html` dans un navigateur, ou servez le dossier avec n'importe quel serveur statique.

## Fichiers

| Fichier | Rôle |
|---|---|
| `config.js` | **Toutes les informations modifiables** : coordonnées, horaires, réseaux, avis, réalisations, mentions légales, endpoint du formulaire |
| `index.html` | Structure de la page + SEO (Open Graph, JSON-LD `AutoBodyShop`) |
| `styles.css` | Direction artistique (noir / graphite / chrome / accent orange) |
| `main.js` | Scène voxel 3D du hero, comparateurs avant/après, formulaire, animations |

## Personnaliser le contenu

Tout passe par `config.js` — aucun besoin de toucher au HTML :

- **Coordonnées, horaires, réseaux sociaux** : en tête du fichier. Les valeurs `À COMPLÉTER` sont provisoires et doivent être remplacées avant mise en production.
- **Réalisations avant/après** : tableau `realisations`. Renseignez `photoAvant` / `photoApres` avec les chemins de vraies photos (ex. `photos/clio-avant.jpg`) — sans photo, une illustration de démonstration s'affiche.
- **Avis clients** : tableau `avis`. Passez `avisDemo` à `false` une fois les vrais avis en place pour retirer l'étiquette « avis de démonstration ».

## Brancher le formulaire de devis (envoi réel)

Par défaut (`formEndpoint: ""`), le bouton d'envoi **ouvre la messagerie e-mail du visiteur** avec la demande pré-remplie — le site n'affiche jamais de faux « message envoyé ».

Pour un véritable envoi serveur (photos incluses), renseignez `formEndpoint` avec une URL qui accepte un `POST multipart/form-data` :

### Option A — Formspree (5 minutes)
1. Créez un compte sur [formspree.io](https://formspree.io) et un nouveau formulaire.
2. Copiez l'URL fournie (`https://formspree.io/f/XXXXXXX`) dans `formEndpoint`.

### Option B — Webhook Make.com (pour automatiser ensuite)
1. Dans Make, créez un scénario commençant par le module **Webhooks → Custom webhook**.
2. Copiez l'URL du webhook dans `formEndpoint`.
3. Enchaînez les modules voulus (e-mail de notification, Google Sheets, WhatsApp…).

Champs envoyés : `nom`, `telephone`, `email`, `vehicule`, `immatriculation`, `dommage`, `message`, `contactPref`, `consentement`, `photo_1` … `photo_6` (fichiers images).

## Carte du lieu

La section contact affiche un localisateur stylisé qui ouvre l'itinéraire Google Maps.
Pour une carte interactive intégrée, remplacez le bloc `#mapCard` de `index.html` par :

```html
<iframe title="Plan d'accès Carrosserie Lomrye" loading="lazy" style="width:100%;aspect-ratio:4/3;border:1px solid rgba(244,244,242,0.16)"
  src="https://maps.google.com/maps?q=28+route+de+Demigny+71530+Champforgeuil&output=embed"></iframe>
```

## SEO à ajuster lors du passage sur le domaine final

Dans `index.html` : `og:url`, `link rel="canonical"` et le champ `url` du JSON-LD pointent vers l'URL de démo — remplacez-les par le domaine définitif (ex. `https://carrosserie-lomrye.fr/`).

## Accessibilité & performances

- Navigation clavier complète (curseurs avant/après pilotables aux flèches, dialogs natifs, focus visibles)
- `prefers-reduced-motion` respecté : la scène 3D s'affiche assemblée, sans animation
- Scène voxel : DPR plafonné (1.5 mobile / 2 desktop), rendu suspendu hors écran, version allégée sur mobile
- Images des réalisations chargées en `loading="lazy"` quand de vraies photos sont utilisées
