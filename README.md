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
| `envoyer.php` | Envoie les formulaires Contact et Pack par email (réglages en haut du fichier) |
| `config.js` | Informations légales et adresse du script d'envoi |
| `mentions-legales.html`, `confidentialite.html` | Pages légales obligatoires (liées dans le pied de page de chaque page) |
| `assets/og.png` | Image affichée quand on partage le lien du site (WhatsApp, Instagram, LinkedIn...) |
| `404.html` | Page affichée quand une adresse n'existe pas |
| `_config.yml`, `.nojekyll` | Réglages GitHub Pages (voir « Problèmes fréquents ») |
| `source/` | Fichiers source pour modifier le site (voir plus bas) |

## Mettre le site en ligne avec GitHub Pages (gratuit, sans envoi d'emails)

> GitHub Pages affiche très bien le site, mais **les formulaires n'y peuvent pas envoyer d'emails** (voir « Réception des messages »). Pour des formulaires qui fonctionnent, utilisez un hébergement PHP.

1. Sur github.com, clique sur **New repository**, donne un nom (par exemple `nr-evo-site`), choisis **Public** (obligatoire pour Pages en gratuit), puis **Create repository**.
2. Décompresse `nr-evo-site.zip` sur ton ordinateur.
3. Sur la page du dépôt vide, clique sur **uploading an existing file**.
4. Ouvre le dossier décompressé, sélectionne **tout son contenu** (pas le dossier lui-même) et glisse-le dans la page. Glisse bien les **dossiers** `assets`, `demos` et `source` eux-mêmes, avec les fichiers. Utilise Chrome ou Edge.
5. En bas, clique sur **Commit changes**. Attends que tous les fichiers soient envoyés.
6. Va dans **Settings → Pages**. Dans **Source**, choisis **Deploy from a branch**, puis la branche **main** et le dossier **/ (root)**, et clique sur **Save**.
7. Après une à deux minutes, le site est en ligne à l'adresse `https://NOM-DU-COMPTE.github.io/nr-evo-site/`. La première mise en ligne peut prendre jusqu'à 10 minutes.

Pour utiliser un nom de domaine (par exemple `nrevo.fr`) : achète-le, puis renseigne-le dans **Settings → Pages → Custom domain** et suis les instructions DNS de GitHub.

## Réception des messages : `envoyer.php` (aucun service externe)

Les formulaires **Contact** et **Composer mon pack** envoient leurs messages au fichier `envoyer.php`, qui fait partie du site. Il envoie :

- **Contact** : le message arrive dans votre boîte (`nr.evo.contact@gmail.com`), avec l'email du visiteur en « Répondre à ».
- **Composer mon pack** : le récapitulatif arrive dans votre boîte **et** le client reçoit une copie sur son adresse.

**Important : GitHub Pages ne peut pas envoyer d'emails** (il ne sert que des fichiers, il n'exécute aucun programme). Pour que les formulaires fonctionnent sans passer par un service externe, le site doit être sur un hébergement qui exécute PHP : OVH, o2switch, Hostinger, IONOS, etc. (environ 2 à 5 € par mois, souvent avec le nom de domaine). Envoyez-y **tout le contenu du dossier** (FTP ou gestionnaire de fichiers de l'hébergeur), `envoyer.php` compris.

Réglages dans la partie « RÉGLAGES » en haut de `envoyer.php` :

1. **Méthode simple (par défaut)** : rien à régler, le serveur envoie avec `noreply@votre-domaine`. Si les messages arrivent dans les indésirables, passez à la méthode SMTP.
2. **Méthode SMTP (la plus fiable)** : renseignez `smtp_host`, `smtp_user`, `smtp_pass`.
   - Avec votre Gmail : `smtp.gmail.com`, port 465, `ssl`, adresse `nr.evo.contact@gmail.com` et un « mot de passe d'application » Google (Compte Google > Sécurité > Validation en deux étapes > Mots de passe des applications).
   - Avec une boîte de votre hébergeur (`contact@nrevo.fr`) : les paramètres SMTP sont dans l'espace client de l'hébergeur.

Test : sur le site en ligne, envoyez un message depuis **Contact**, puis un récapitulatif depuis **Composer mon pack** avec une autre adresse : le message doit arriver chez vous et la copie chez le client. Si l'envoi échoue, le site affiche la raison, et le visiteur peut copier son message ou l'ouvrir dans sa messagerie : rien n'est perdu.

Protections intégrées : champ piège anti-robots, limite de 5 envois par visiteur et par 10 minutes, refus des envois venant d'un autre site, nettoyage des champs.

## Problèmes fréquents sur GitHub Pages

| Problème | Solution |
|---|---|
| Les images ou les logos n'apparaissent pas | Le dossier `assets` n'a pas été envoyé. Vérifie que `https://NOM-DU-COMPTE.github.io/nr-evo-site/assets/logo.png` s'ouvre. Sinon, renvoie le dossier `assets` (glisse le dossier lui-même). Pareil pour `demos`. |
| Les démos ne s'ouvrent pas | Même cause : le dossier `demos` doit être en ligne. |
| Erreur 404 sur tout le site | Vérifie **Settings → Pages** : branche `main`, dossier `/ (root)`. Le fichier `index.html` doit être à la racine du dépôt, pas dans un sous-dossier. Attends quelques minutes. |
| La version en ligne ne change pas après une mise à jour | Attends 2 minutes, puis recharge avec Ctrl + F5 (Cmd + Maj + R sur Mac). |
| Le dépôt est privé et Pages ne démarre pas | Pages gratuit demande un dépôt public. |
| Fichiers cachés (`.nojekyll`, `.gitignore`) non envoyés | Sans gravité : le site marche sans. `_config.yml` règle le cas. |
| Les messages n'arrivent pas | Le site doit être sur un hébergement PHP (pas GitHub Pages). Voir « Réception des messages ». Regarde aussi les indésirables. |

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
