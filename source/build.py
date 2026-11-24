#!/usr/bin/env python3
"""Assemble les pages NR.EVO : src/pages/*.html (contenu) + en-tête, menu, pied de page, CSS et JS communs -> dist/."""
import html as H, json, re, pathlib
from illu import ILLUS

ROOT = pathlib.Path(__file__).parent
import sys
# Par défaut : génère les pages dans le dossier parent (la racine du site).
# Option --artifact : génère dans dist/ avec une page d'accueil sans en-tête HTML (aperçu Claude).
ARTIFACT = '--artifact' in sys.argv
# Adresse publique du site, avec le / final (exemple : 'https://moncompte.github.io/nr.evo/').
# Si elle est renseignée : aperçu de partage (image), adresse canonique, sitemap.xml et robots.txt sont générés.
SITE_URL = ''

SRC = ROOT / 'src'
DIST = ROOT / 'dist' if ARTIFACT else ROOT.parent
CSS = (SRC / 'nr.css').read_text(encoding='utf-8')
JS = (SRC / 'nr.js').read_text(encoding='utf-8')

ARROW = '<svg class="ar" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" aria-hidden="true"><path d="M3 10h13M11 4.5 16.5 10 11 15.5"/></svg>'
STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c.7 6.3 5.7 11.3 12 12-6.3.7-11.3 5.7-12 12-.7-6.3-5.7-11.3-12-12 6.3-.7 11.3-5.7 12-12z" fill="#0d0c11"/></svg>'
CHEVRON = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m2 4 4 4 4-4"/></svg>'
CHECK = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m4 10.5 4 4 8-9"/></svg>'

# ---------- lignes de code décoratives ----------
CODE = {
    'hero': '''<section class="hero">
  <h1>Un nouveau souffle</h1>
  <a class="btn" href="/offres">Voir nos offres</a>
</section>

.btn:hover {
  background: #c58af9;
  transform: translateY(-2px);
}

const projet = {
  site: "premium",
  modules: ["prospection", "rdv"],
};
lancer(projet);''',
    'offres': '''const offres = [
  { nom: "Essentiel", tarif: "sur devis" },
  { nom: "Premium", tarif: "sur devis" },
  { nom: "Site + Grow", modules: [] },
];
offres.forEach((o) => afficher(o));''',
    'composer': '''pack.base = "grow";
pack.ajouter("automatisations");
pack.ajouter("crm");

if (pack.modules.length) {
  envoyer(pack, "contact");
}''',
    'contact': '''form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = preparer(form);
  envoyer("nr.evo.contact@gmail.com", message);
});''',
    'about': '''$ npm run build    ✓ construit
$ npm run test     ✓ testé
$ npm run verify   ✓ conforme au devis
$ npm run docs     ✓ documenté
$ npm run sell     → prêt à être proposé''',
    'auto': '''quand("formulaire.recu", async (demande) => {
  await email.envoyer(demande.client, "confirmation");
  await notifier("equipe", demande);
  await agenda.proposer(demande);
  suivi.ajouter(demande, "a rappeler");
});''',
}

def code(key, cls='tr'):
    return f'<pre class="codebg {cls}" aria-hidden="true">{H.escape(CODE[key])}</pre>'

# ---------- démos ----------
DEMOS = {
    'volta': ('Volta Électricité', 'volta-electricite.fr', 'Site Essentiel', 1, ['Site vitrine clair', 'Appel en un clic', 'Formulaire de contact', 'Zone et horaires']),
    'braise': ('Braise', 'braise-restaurant.fr', 'Site Premium', 2, ['Braises animées', 'Carte filtrable', 'Réservation en ligne', 'Horaires en direct']),
    'apex': ('Garage Apex', 'garage-apex.fr', 'Site + Grow', 3, ['RDV en 4 étapes', 'Automatisations', 'Assistant FAQ', 'Suivi de réparation']),
}

def mock(n):
    name, dom = DEMOS[n][:2]
    return (f'<div class="mock rv"><div class="laptop"><div class="tb"><i></i><i></i><i></i><span>{dom}</span></div>'
            f'<img src="assets/demo-{n}.webp" alt="Aperçu du site {name}" width="1200" height="683"></div>'
            f'<div class="phone"><img src="assets/demo-{n}-m.webp" alt="" width="420" height="862"></div></div>')

def demo_section(n):
    name, dom, formula, num, feats = DEMOS[n]
    steps = ''.join(f'<div><b>{f}</b></div>' for f in feats)
    return f'''<section class="sec alt">
  <div class="wrap">
    <div class="head"><h2 class="h2 rv">La démo<br>{name}.</h2><div class="stack rv" style="justify-items:start"><p class="lead">Un site complet créé pour une entreprise fictive, au niveau de la formule {formula}.</p><a class="btn" href="demos/{n}.html">Ouvrir la démo {ARROW}</a></div></div>
    {mock(n)}
    <div class="hsteps rv" style="--n:4;margin-top:clamp(40px,5vw,72px)">{steps}</div>
  </div>
</section>'''

def nxt(href, label):
    return (f'<a class="next" href="{href}" data-t="{label}"><div class="wrap"><small>Page suivante</small>'
            f'<span class="h2">{label}<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 10h13M11 4.5 16.5 10 11 15.5"/></svg></span></div></a>')

def pic(k):
    return ILLUS[k]()

def illu(k):
    return f'<div class="illu">{ILLUS[k]()}</div>'

FCARDS = f'''<div class="fcards">
  <a class="fcard rv" href="site-essentiel.html"><div class="pic">{pic('ess')}</div><div class="body"><div class="kicker"><span>Formule 1</span><span>Simple et efficace</span></div><h3>Site Essentiel</h3><ul><li>Site vitrine sur mobile et ordinateur</li><li>Formulaire de contact, carte, réseaux sociaux</li><li>Appels à l’action et mise en ligne</li></ul><span class="ulink">Découvrir {ARROW}</span></div></a>
  <a class="fcard feat rv" href="site-premium.html"><div class="pic">{pic('prm')}</div><div class="body"><div class="kicker"><span>Formule 2</span><span>Le plus visuel</span></div><h3>Site Premium</h3><ul><li>Tout l’Essentiel</li><li>Design sur mesure, animations, interactions</li><li>Galerie et fonctionnalités en plus</li></ul><span class="ulink">Découvrir {ARROW}</span></div></a>
  <a class="fcard rv" href="site-grow.html"><div class="pic">{pic('grow')}</div><div class="body"><div class="kicker"><span>Formule 3</span><span>Pour accélérer</span></div><h3>Site + Grow</h3><ul><li>Un site Essentiel ou Premium</li><li>Outils de conversion et prise de rendez-vous</li><li>Premières automatisations</li></ul><span class="ulink">Découvrir {ARROW}</span></div></a>
</div>'''

RULE = '''<section class="sec alt">
  <div class="wrap rule">
    <div class="words" aria-label="Build, Test, Verify, Document, Sell">
      <button type="button" class="on" data-txt="On construit nous-mêmes chaque solution avant de la proposer.">Build</button>
      <button type="button" data-txt="On la teste en conditions réelles : sur mobile, sur ordinateur, avec de vrais envois.">Test</button>
      <button type="button" data-txt="On vérifie que le résultat correspond exactement à ce qui est promis.">Verify</button>
      <button type="button" data-txt="On documente : vous savez ce qui est livré et comment ça fonctionne.">Document</button>
      <button type="button" data-txt="Seulement ensuite, on vous la propose.">Sell</button>
    </div>
    <div class="rule-side">
      <p class="tag">La règle NR.EVO</p>
      <p class="quote">On ne vend jamais une solution qu’on n’a pas construite, testée et vérifiée nous-mêmes.</p>
      <p class="lead" id="wordTxt">On construit nous-mêmes chaque solution avant de la proposer.</p>
    </div>
  </div>
</section>'''

CTA_PACK = f'''<section class="cta"><div class="wrap"><h2 class="h2 rv">Composez<br>votre pack.</h2><div class="stack" style="justify-items:center"><p class="lead" style="color:var(--ink)">Une base, puis seulement les modules utiles. Une minute suffit.</p><a class="btn" href="composer.html">Composer mon pack {ARROW}</a></div></div></section>'''

def nav(active):
    def cur(k): return ' aria-current="page"' if active == k else ''
    offres_on = ' on' if active in ('offres', 'ess', 'prm', 'grow', 'pro', 'aut', 'car') else ''
    def item(href, name, desc):
        return f'<a class="it" href="{href}"><span><b>{name}</b><small>{desc}</small></span>{ARROW}</a>'
    return f'''<header class="nav" id="nav">
  <div class="wrap">
    <a class="logo" href="index.html" data-t="Accueil"><img src="assets/mark.png" alt="" width="40" height="30">NR.EVO</a>
    <ul class="menu">
      <li><button type="button" class="mega-btn{offres_on}" id="megaBtn" aria-expanded="false" aria-controls="mega">Offres {CHEVRON}</button></li>
      <li><a href="realisations.html"{cur('real')}>Réalisations</a></li>
      <li><a href="composer.html"{cur('comp')}>Composer mon pack</a></li>
      <li><a href="a-propos.html"{cur('about')}>À propos</a></li>
    </ul>
    <a class="btn sm" href="contact.html">Contact {ARROW}</a>
    <button type="button" class="burger" id="burger" aria-label="Menu" aria-expanded="false" aria-controls="mnav"><span></span><span></span></button>
  </div>
  <div class="mega" id="mega">
    <div class="wrap mega-grid">
      <div><h5>Sites web</h5>{item('site-essentiel.html', 'Site Essentiel', 'Simple et efficace')}{item('site-premium.html', 'Site Premium', 'Design, animations, interactions')}{item('site-grow.html', 'Site + Grow', 'Site, conversion, premières automatisations')}</div>
      <div><h5>Services</h5>{item('prospection.html', 'Prospection', 'Trouver de nouveaux clients')}{item('automatisation.html', 'Automatisation', 'Gagner du temps, sans refaire votre site')}{item('a-la-carte.html', 'À la demande', 'Une prestation précise, sans pack')}</div>
      <a class="promo" href="offres.html#quiz" data-t="Nos offres"><b>Vous hésitez ?</b><span>Deux questions et on vous dit quelle offre vous correspond.</span><span class="ulink">Faire le test {ARROW}</span></a>
    </div>
  </div>
</header>
<nav class="mnav" id="mnav" aria-label="Menu mobile">
  <h5>Sites web</h5><a href="site-essentiel.html">Site Essentiel</a><a href="site-premium.html">Site Premium</a><a href="site-grow.html">Site + Grow</a>
  <h5>Services</h5><a href="prospection.html">Prospection</a><a href="automatisation.html">Automatisation</a><a href="a-la-carte.html">À la demande</a>
  <h5>Agence</h5><a href="offres.html">Toutes les offres</a><a href="realisations.html">Réalisations</a><a href="composer.html">Composer mon pack</a><a href="a-propos.html">À propos</a>
  <a class="btn" href="contact.html">Parlons de votre projet {ARROW}</a>
</nav>'''

def footer(show_cta=True):
    cta = f'''<div class="foot-cta"><h2 class="h2">Un projet ?<br>Parlons-en.</h2><a class="btn lilac" href="contact.html">Nous contacter {ARROW}</a></div>''' if show_cta else ''
    return f'''<footer class="foot">
  <div class="wrap">
    {cta}
    <div class="foot-cols">
      <div><h5>Contact</h5><span class="mail">nr.evo.contact@gmail.com</span><button type="button" class="ulink" data-copy="nr.evo.contact@gmail.com" style="background:none;border:0;color:var(--lilac);cursor:pointer;margin-top:10px;padding-left:0">Copier l’adresse</button></div>
    </div>
    <div class="foot-word" aria-hidden="true">NR<span>.</span>EVO</div>
    <div class="foot-bot"><span>© 2026 NR.EVO · <a href="mentions-legales.html">Mentions légales</a> · <a href="confidentialite.html">Confidentialité</a></span><span>Energize. Refresh. Grow. Go Change The Game.</span></div>
  </div>
</footer>'''

EARLY = "<script>(function(){var d=document.documentElement;d.classList.add('js');try{if('scrollRestoration' in history)history.scrollRestoration='manual'}catch(e){}if(!location.hash)window.scrollTo(0,0);try{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('pre');if(sessionStorage.getItem('nr_intro'))d.classList.add('covered');else d.classList.add('intro')}catch(e){d.classList.add('pre','covered')}})();</script>"
LOADER = '''<div class="loader"><div class="cols"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="in"><img class="lg" src="assets/logo.png" alt="" width="720" height="622"><div class="count">000</div><div class="words"><span>Energize.</span><span>Refresh.</span><span>Grow.</span><span>Go Change The Game.</span></div><button class="skip" type="button">Passer</button></div><div class="bar"></div></div>
<div class="curtain" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><div class="ct"><img src="assets/mark.png" alt="" width="480" height="360"><b class="ctt"></b></div></div>'''
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@100..150,500..900&family=Schibsted+Grotesk:ital,wght@0,400..700;1,400&display=swap">'
LENIS = '<script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"></script>'

def expand(html):
    html = html.replace('{{FCARDS}}', FCARDS).replace('{{RULE}}', RULE).replace('{{CTA_PACK}}', CTA_PACK)
    html = re.sub(r'\{\{MOCK:(\w+)\}\}', lambda m: mock(m.group(1)), html)
    html = re.sub(r'\{\{DEMO:(\w+)\}\}', lambda m: demo_section(m.group(1)), html)
    html = re.sub(r'\{\{PIC:(\w+)\}\}', lambda m: pic(m.group(1)), html)
    html = re.sub(r'\{\{ILLU:(\w+)\}\}', lambda m: illu(m.group(1)), html)
    html = re.sub(r'\{\{CODE:(\w+)(?::(\w+))?\}\}', lambda m: code(m.group(1), m.group(2) or 'tr'), html)
    html = re.sub(r'\{\{NEXT:([^|}]+)\|([^}]+)\}\}', lambda m: nxt(m.group(1), m.group(2)), html)
    return html.replace('{{ARROW}}', ARROW).replace('{{STAR}}', STAR).replace('{{CHECK}}', CHECK)

def build():
    for f in sorted((SRC / 'pages').glob('*.html')):
        raw = f.read_text(encoding='utf-8')
        m = re.match(r'<!--META (\{.*?\}) -->\n', raw)
        meta = json.loads(m.group(1)); body = expand(raw[m.end():])
        title = meta['title']
        inner = (f'{EARLY}\n{LOADER}\n{nav(meta.get("active", ""))}\n<main>\n{body}\n</main>\n'
                 f'{footer(meta.get("cta", True))}\n<div class="toast" id="toast" role="status"></div>\n{LENIS}\n<script src="config.js"></script>\n<script>\n{JS}\n</script>')
        d_ = H.escape(meta.get("desc", ""), quote=True); t_ = H.escape(title, quote=True)
        share = (f'<meta property="og:type" content="website">\n<meta property="og:site_name" content="NR.EVO">\n<meta property="og:locale" content="fr_FR">\n'
                 f'<meta property="og:title" content="{t_}">\n<meta property="og:description" content="{d_}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="theme-color" content="#c58af9">')
        if SITE_URL:
            u_ = SITE_URL + ('' if f.name == 'index.html' else f.name)
            share += (f'\n<link rel="canonical" href="{u_}">\n<meta property="og:url" content="{u_}">\n<meta property="og:image" content="{SITE_URL}assets/og.png">'
                      '\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta name="twitter:image" content="' + SITE_URL + 'assets/og.png">')
        head_bits = f'<title>{title}</title>\n{share}\n<meta name="description" content="{meta.get("desc", "")}">\n<link rel="icon" type="image/png" href="assets/mark.png">\n{FONTS}\n<style>\n{CSS}\n</style>'
        if ARTIFACT and f.name == 'index.html':
            out = f'{head_bits}\n{inner}\n'   # la page principale est enveloppée par l'artifact
        else:
            out = ('<!doctype html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n'
                   '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
                   f'{head_bits}\n</head>\n<body>\n{inner}\n</body>\n</html>\n')
        (DIST / f.name).write_text(out, encoding='utf-8')
        print(f'{f.name:24s} {len(out)//1024:4d} Ko')

def extras():
    if not SITE_URL:
        return
    names = [f.name for f in sorted((SRC / 'pages').glob('*.html'))]
    urls = ''.join(f'  <url><loc>{SITE_URL}{"" if n == "index.html" else n}</loc></url>\n' for n in names)
    (DIST / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '</urlset>\n', encoding='utf-8')
    (DIST / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {SITE_URL}sitemap.xml\n', encoding='utf-8')
    print('sitemap.xml et robots.txt générés')

if __name__ == '__main__':
    build()
    extras()
