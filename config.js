// Configuration du site NR.EVO.
// Les formulaires (contact, récapitulatif du pack) sont envoyés par le fichier envoyer.php, hébergé avec le site :
// aucun service externe. L'adresse qui reçoit les messages et le mode d'envoi se règlent en haut de envoyer.php.
window.NR_CONFIG = {
  mailEndpoint: "envoyer.php",

  // Informations légales affichées sur « Mentions légales » et « Politique de confidentialité ».
  // Remplis les champs entre guillemets, enregistre, puis renvoie ce fichier sur l'hébergement.
  legal: {
    editeurs: "Nassim HADDOU BENDERBAL et Mohamed-Rahim BELLAHCENE",     // Prénom NOM et Prénom NOM (les deux personnes qui éditent le site)
    publication: "Nassim HADDOU BENDERBAL et Mohamed-Rahim BELLAHCENE",  // Directeur ou directrice de la publication : l'une des deux personnes ci-dessus
    adresse: "10 avenue de la Renaissance, 93270 Sevran\n37 rue Paul Cézanne, 93600 Aulnay-sous-Bois",      // Adresse postale complète (domicile, ou adresse de domiciliation)
    telephone: "07 67 03 40 67 / 06 76 66 49 06",    // Numéro de téléphone (obligatoire pour un site professionnel)
    siret: "",        // À renseigner dès que vous avez un statut (micro-entreprise...). Sinon, laisser vide.
    tva: ""           // Exemple : TVA non applicable, art. 293 B du CGI (si micro-entreprise). Sinon, laisser vide.
  }
};
