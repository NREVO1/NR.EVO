// Configuration du site NR.EVO.
// Les formulaires (contact, récapitulatif du pack) envoient les messages à l'adresse ci-dessous via FormSubmit.
// Au tout premier envoi, FormSubmit envoie un email d'activation à cette adresse : cliquer sur le lien, une seule fois.
// Option anti-spam : après activation, FormSubmit fournit un identifiant aléatoire dans son email.
// Tu peux le coller à la place de l'adresse ci-dessous pour ne plus afficher ton email dans le code du site.
// Option : une clé Web3Forms (https://web3forms.com) remplace FormSubmit si elle est renseignée
// (dans ce cas, le client ne reçoit plus de copie automatique).
window.NR_CONFIG = {
  formsubmitEmail: "nr.evo.contact@gmail.com",
  web3formsKey: "",

  // Informations légales affichées sur « Mentions légales » et « Politique de confidentialité ».
  // Remplis les champs entre guillemets, enregistre, puis renvoie ce fichier sur GitHub.
  legal: {
    emailjs: {
  publicKey: 'crRGO7CFJtnjg8C2A',
  serviceId: 'service_XXXXXXX',
  templateTeam: 'template_XXXXXXX',
  templateClient: 'template_YYYYYYY'
    },
    editeurs: "Nassim HADDOU BENDERBAL et Mohamed-Rahim BELLAHCENE",     // Prénom NOM et Prénom NOM (les deux personnes qui éditent le site)
    publication: "Nassim HADDOU BENDERBAL et Mohamed-Rahim BELLAHCENE",  // Directeur ou directrice de la publication : l'une des deux personnes ci-dessus
    adresse: "10 avenue de la Renaissance, 93270 Sevran\n37 rue Paul Cézanne, 93600 Aulnay-sous-Bois",      // Adresse postale complète (domicile, ou adresse de domiciliation)
    telephone: "07 67 03 40 67 / 06 76 66 49 06",    // Numéro de téléphone (obligatoire pour un site professionnel)
    siret: "",        // À renseigner dès que vous avez un statut (micro-entreprise...). Sinon, laisser vide.
    tva: ""           // Exemple : TVA non applicable, art. 293 B du CGI (si micro-entreprise). Sinon, laisser vide.
  }
};


