# NR.EVO — site web

Energize. Refresh. Grow. Go Change The Game.

Site vitrine de l'agence NR.EVO : sites web, prospection et automatisation.
Le site est entièrement statique (HTML, CSS, JavaScript) : aucun serveur ni base de données n'est nécessaire. Il est prévu pour GitHub Pages.

## Contenu du dossier

| Élément | Rôle |
|---|---|
| `index.html` | Page d'accueil |
| `offres.html` | Toutes les offres, comparatif et test « Quelle offre pour vous ? » |
| `site-essentiel.html`, `site-premium.html`, `site-grow.html` | Une page par formule de site |
| `prospection.html`, `automatisation.html`, `a-la-carte.html` | Une page par service |
| `composer.html` | Configurateur de pack : le client choisit, saisit nom et email, et envoie son récapitulatif en un clic |
| `recapitulatif.html` | Récapitulatif de la sélection (sans prix), imprimable et envoyable |
| `realisations.html` | Présentation des trois démos |
| `a-propos.html`, `contact.html` | À propos et contact (formulaire simple) |
| `demos/` | Les trois sites de démonstration (Volta, Braise, Garage Apex) |
| `assets/` | Logo et captures d'écran : **ce dossier doit être en ligne**, sinon les images disparaissent |
| `envoyer.php` | Option : envoi automatique des formulaires, sur hébergement PHP uniquement (pas GitHub Pages) |
| `config.js` | Mode d'envoi des formulaires, adresse de réception et informations légales |
| `mentions-legales.html`, `confidentialite.html` | Pages légales obligatoires (liées dans le pied de page de chaque page) |
| `assets/og.png` | Image affichée quand on partage le lien du site (WhatsApp, Instagram, LinkedIn...) |
| `404.html` | Page affichée quand une adresse n'existe pas |
| `_config.yml`, `.nojekyll` | Réglages GitHub Pages (voir « Problèmes fréquents ») |
| `source/` | Fichiers source pour modifier le site (voir plus bas) |

## Mettre le site en ligne avec GitHub Pages (gratuit)

1. Sur github.com, clique sur **New repository**, donne un nom (par exemple `nr-evo-site`), choisis **Public** (obligatoire pour Pages en gratuit), puis **Create repository**.
2. Décompresse `nr-evo-site.zip` sur ton ordinateur.
3. Sur la page du dépôt vide, clique sur **uploading an existing file**.
4. Ouvre le dossier décompressé, sélectionne **tout son contenu** (pas le dossier lui-même) et glisse-le dans la page. Glisse bien les **dossiers** `assets`, `demos` et `source` eux-mêmes, avec les fichiers. Utilise Chrome ou Edge.
5. En bas, clique sur **Commit changes**. Attends que tous les fichiers soient envoyés.
6. Va dans **Settings → Pages**. Dans **Source**, choisis **Deploy from a branch**, puis la branche **main** et le dossier **/ (root)**, et clique sur **Save**.
7. Après une à deux minutes, le site est en ligne à l'adresse `https://NOM-DU-COMPTE.github.io/nr-evo-site/`. La première mise en ligne peut prendre jusqu'à 10 minutes.

Pour utiliser un nom de domaine (par exemple `nrevo.fr`) : achète-le, puis renseigne-le dans **Settings → Pages → Custom domain** et suis les instructions DNS de GitHub.

## Réception des messages (aucun service externe)

Les formulaires **Contact** et **Composer mon pack** fonctionnent de deux façons, au choix dans `config.js` :

**1. Mode messagerie (réglage actuel, convient à GitHub Pages).** Quand le visiteur clique sur « Envoyer », le site ouvre sa messagerie (Gmail, Outlook, Mail…) avec le message prêt : destinataire `nr.evo.contact@gmail.com`, objet et texte remplis. Pour le récapitulatif de pack, l'adresse du client est ajoutée **en copie** : il reçoit donc le même email que vous. Le visiteur n'a plus qu'à appuyer sur « Envoyer » dans sa messagerie. Aucun service tiers, rien à activer.
Limite : l'email ne part que si le visiteur appuie sur « Envoyer » ; s'il n'a pas d'application email configurée, il peut copier le message avec le bouton prévu.

**2. Envoi automatique par le serveur.** `envoyer.php` envoie les emails tout seul, sans action du visiteur. **GitHub Pages ne peut pas l'exécuter** : il faut un hébergement PHP (OVH, o2switch, Hostinger, IONOS…). Pour l'activer : envoyez tout le site sur cet hébergement, puis dans `config.js` mettez `mailEndpoint: "envoyer.php"`. Les réglages (adresse, SMTP) sont en haut de `envoyer.php`.

## Problèmes fréquents sur GitHub Pages

| Problème | Solution |
|---|---|
| Les images ou les logos n'apparaissent pas | Le dossier `assets` n'a pas été envoyé. Vérifie que `https://NOM-DU-COMPTE.github.io/nr-evo-site/assets/logo.png` s'ouvre. Sinon, renvoie le dossier `assets` (glisse le dossier lui-même). Pareil pour `demos`. |
| Les démos ne s'ouvrent pas | Même cause : le dossier `demos` doit être en ligne. |
| Erreur 404 sur tout le site | Vérifie **Settings → Pages** : branche `main`, dossier `/ (root)`. Le fichier `index.html` doit être à la racine du dépôt, pas dans un sous-dossier. Attends quelques minutes. |
| La version en ligne ne change pas après une mise à jour | Attends 2 minutes, puis recharge avec Ctrl + F5 (Cmd + Maj + R sur Mac). |
| Le dépôt est privé et Pages ne démarre pas | Pages gratuit demande un dépôt public. |
| Fichiers cachés (`.nojekyll`, `.gitignore`) non envoyés | Sans gravité : le site marche sans. `_config.yml` règle le cas. |
| Les messages n'arrivent pas | Le formulaire ouvre la messagerie du visiteur, qui doit appuyer sur « Envoyer » (voir « Réception des messages »). Regarde aussi les indésirables. |

## Aperçu de partage, plan du site (optionnel)

Pour que le lien du site s'affiche avec une image quand on le partage, et pour Google : ouvre `source/build.py`, renseigne `SITE_URL` avec l'adresse publique du site (par exemple `https://TON-PSEUDO.github.io/nr.evo/`, avec le `/` final), puis lance `python3 source/build.py` et renvoie les fichiers sur GitHub. `sitemap.xml` et `robots.txt` sont alors créés.

## Modifier le site

Les pages sont générées à partir du dossier `source/`, pour que le menu, le pied de page et le style restent identiques partout.

| Pour modifier… | Fichier |
|---|---|
| Le texte d'une page | `source/src/pages/nom-de-la-page.html` |
| Les couleurs, tailles, animations | `source/src/nr.css` |
| Les interactions (menu, composeur, formulaires…) | `source/src/nr.js` |
| Le menu, le pied de page, l'animation d'entrée | `source/build.py` |
| Les illustrations des offres | `source/illu.py` |
| Les démos | directement dans `demos/` |

Après une modification, régénère les pages depuis la racine du dossier :

```bash
python3 source/build.py
```

Python 3 suffit, aucune bibliothèque à installer. Les pages à la racine sont réécrites : ne modifie donc pas directement `index.html` & co, mais leurs fichiers dans `source/src/pages/`. Puis renvoie les fichiers modifiés sur GitHub.

Pour voir le site sur ton ordinateur avant de l'envoyer :

```bash
python3 -m http.server 8000
```

puis ouvre `http://localhost:8000` dans ton navigateur.

## À prévoir avant d'utiliser le site pour de vrais clients

- **Informations légales** : ouvre `config.js`, remplis le bloc `legal` (noms des deux éditeurs, directeur de la publication, adresse, téléphone), enregistre et renvoie le fichier sur GitHub. Tant qu'un champ est vide, les pages légales affichent « [à compléter dans config.js] » en jaune. Le champ `siret` reste vide tant que vous n'avez pas de statut.
- **Statut pour vendre** : un site qui propose des prestations payantes est une activité professionnelle. Avant votre première facture, il faut un statut (la micro-entreprise est gratuite et se déclare en ligne sur formalites.entreprises.gouv.fr). Mettez ensuite le SIRET dans `config.js`.
- **Adresse email professionnelle** sur votre nom de domaine (par exemple `contact@nrevo.fr`), à renseigner ensuite dans `config.js`.
- **Les prix** ne sont pas affichés : ils sont définis avec le client après réception du récapitulatif.

## Crédits

- Polices : Anybody et Schibsted Grotesk (Google Fonts).
- Défilement fluide : Lenis 1.1.13 (chargé depuis unpkg ; le site fonctionne aussi sans).
- Les entreprises des démos (Volta Électricité, Braise, Garage Apex) sont fictives.
