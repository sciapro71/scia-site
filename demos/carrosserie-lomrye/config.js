/* ============================================================
   CARROSSERIE LOMRYE — FICHIER DE CONFIGURATION
   ------------------------------------------------------------
   TOUTES les informations modifiables du site sont ici.
   Modifiez ce fichier, rechargez la page : le site se met à jour.
   Les valeurs marquées « À COMPLÉTER » sont provisoires.
   ============================================================ */

window.LOMRYE_CONFIG = {

  /* ---------- Identité ---------- */
  nom: "Carrosserie Lomrye",
  ville: "Champforgeuil",
  departement: "Saône-et-Loire (71)",
  baseline: "Atelier de carrosserie & peinture automobile",

  /* ---------- Coordonnées ---------- */
  telephoneAffiche: "06 29 12 43 35",
  telephoneLien: "+33629124335",          // format international pour tel: et WhatsApp
  email: "carrosserielomrye@gmail.com",   // À VÉRIFIER (le flyer comporte peut-être une coquille)
  adresse: {
    rue: "28 route de Demigny",
    codePostal: "71530",
    ville: "Champforgeuil",
  },
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Carrosserie+Lomrye+28+route+de+Demigny+71530+Champforgeuil",

  /* ---------- Horaires ---------- */
  horaires: [
    { jours: "Lundi — Vendredi", heures: "8h30 – 12h00 · 14h00 – 18h00" },
    { jours: "Samedi", heures: "Sur rendez-vous" },
    { jours: "Dimanche", heures: "Fermé" },
  ],
  depannage: "Dépannage 24h/24 — 7j/7",

  /* ---------- Réseaux sociaux (mettre les vraies URLs) ---------- */
  reseaux: [
    { nom: "Facebook",  url: "" },   // À COMPLÉTER — ex. https://facebook.com/…
    { nom: "Instagram", url: "" },   // À COMPLÉTER — ex. https://instagram.com/…
    { nom: "Snapchat",  url: "", pseudo: "carosserie_71" }, // orthographe reprise du flyer — À VÉRIFIER
  ],

  /* ---------- Formulaire de devis ----------
     Laissez vide ("") : le bouton ouvre la messagerie e-mail du
     visiteur avec la demande pré-remplie (aucun faux envoi).
     Pour un vrai envoi serveur, collez ici l'URL d'un endpoint
     qui accepte un POST multipart/form-data :
       - Formspree : https://formspree.io/f/XXXXXXX
       - Make.com  : URL d'un webhook « Custom webhook »
     Voir README.md pour le pas-à-pas.                          */
  formEndpoint: "",

  /* ---------- Bandeau de confiance (défilant) ---------- */
  bandeauConfiance: [
    "Réparation toutes marques",
    "Devis rapide",
    "Prise en charge assurance",
    "Peinture haute précision",
    "Véhicule de remplacement",
    "Débosselage sans peinture",
  ],

  /* ---------- Réalisations avant / après ----------
     Pour utiliser de vraies photos : renseignez photoAvant /
     photoApres avec le chemin d'une image (ex. "photos/golf-avant.jpg").
     Sans photo, une illustration de démonstration est affichée.  */
  realisations: [
    {
      vehicule: "Berline compacte allemande",
      dommages: "Aile avant droite enfoncée, rayures profondes",
      intervention: "Redressage, mastic, peinture raccord au spectrophotomètre",
      duree: "3 jours",
      photoAvant: "",
      photoApres: "",
      variante: "berline",
    },
    {
      vehicule: "SUV familial",
      dommages: "Pare-chocs arrière fissuré après un accrochage",
      intervention: "Remplacement du pare-chocs, mise en teinte, montage",
      duree: "2 jours",
      photoAvant: "",
      photoApres: "",
      variante: "suv",
    },
    {
      vehicule: "Citadine récente",
      dommages: "Impacts de grêle sur le capot et le pavillon",
      intervention: "Débosselage sans peinture (DSP), lustrage complet",
      duree: "1 jour",
      photoAvant: "",
      photoApres: "",
      variante: "citadine",
    },
  ],

  /* ---------- Avis clients ----------
     ⚠ AVIS DE DÉMONSTRATION : remplacez-les par de véritables
     avis clients (Google, Facebook…) avant la mise en ligne.
     Le site les signale comme exemples tant que demo = true.   */
  avisDemo: true,
  avis: [
    {
      nom: "Client — exemple",
      note: 5,
      texte:
        "Aile enfoncée suite à un accrochage sur parking. Voiture rendue impeccable, la teinte est parfaitement raccordée : impossible de voir la réparation.",
    },
    {
      nom: "Cliente — exemple",
      note: 5,
      texte:
        "Prise en charge directe avec mon assurance, zéro paperasse de mon côté et un véhicule de remplacement pendant les travaux. Très professionnel.",
    },
    {
      nom: "Client — exemple",
      note: 5,
      texte:
        "Devis clair envoyé après un simple échange de photos par WhatsApp. Délai annoncé respecté au jour près. Je recommande.",
    },
  ],

  /* ---------- Mentions légales (provisoires) ---------- */
  legal: {
    formeJuridique: "À COMPLÉTER (ex. SARL Carrosserie Lomrye)",
    siret: "À COMPLÉTER",
    responsable: "À COMPLÉTER",
    hebergeur: "GitHub Pages — GitHub, Inc., 88 Colin P. Kelly Jr St, San Francisco, CA 94107, USA",
  },
};
