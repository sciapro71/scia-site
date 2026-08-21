# SCIA — Automatisation & agents IA sur mesure

Site officiel de l'agence SCIA : audit de processus, agents IA et automatisations
sur mesure pour PME, TPE et indépendants.

**En ligne :** https://sciapro71.github.io/scia-site/

## Stack

HTML / CSS / JavaScript purs — **aucune dépendance, aucun build**.
Déployé par GitHub Pages depuis la branche `main` (dossier racine).

| Fichier | Rôle |
|---|---|
| `index.html` | Structure, logo SVG SCIA, SEO (Open Graph, JSON-LD ProfessionalService) |
| `styles.css` | Direction artistique (noir profond · graphite · blanc cassé · or SCIA) |
| `script.js` | Moteur 3D signature, interactions, onglets cas d'usage, formulaire |
| `og-image.png` | Image de partage (réseaux sociaux) |
| `robots.txt` / `sitemap.xml` | Référencement |
| `demos/` | Maquettes commerciales pour les prospects (non indexées) |

## Publier une modification

```bash
git add -A && git commit -m "Description du changement" && git push
```

Une fois fusionné dans `main`, GitHub Pages redéploie automatiquement (~1 minute).

## Formulaire d'audit

Par défaut, le bouton « Demander un audit » ouvre la messagerie du visiteur avec
la demande pré-remplie vers `sc.iapro71@gmail.com` (aucun faux envoi).

Pour un envoi serveur réel : dans `script.js`, renseignez `CONFIG.formEndpoint`
avec l'URL d'un endpoint acceptant un POST `multipart/form-data` :

- **Formspree** : créez un formulaire sur formspree.io et collez l'URL fournie.
- **Make.com** : créez un scénario « Custom webhook » et collez l'URL du webhook.

Champs envoyés : `nom`, `entreprise`, `email`, `telephone`, `secteur`, `processus`.

## Scène 3D « moteur opérationnel SCIA »

Rendue en canvas 2D avec projection 3D maison (zéro librairie) : particules
« données » bleu froid dispersées → captées par les nœuds-outils → traversent le
noyau en devenant dorées → s'échappent le long de la flèche ascendante du logo.
Le scroll augmente la part de flux organisés.

- Version allégée sur mobile (moins de particules, DPR plafonné)
- Rendu suspendu quand le hero sort de l'écran
- `prefers-reduced-motion` : rendu statique organisé, sans animation
- Sans canvas : le hero conserve son fond dégradé/grille

## Coordonnées

- E-mail : sc.iapro71@gmail.com
- Instagram : [@scia.pro](https://instagram.com/scia.pro)
