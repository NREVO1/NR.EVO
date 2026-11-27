(() => {
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  // Les coordonnées saisies par le visiteur ne restent que le temps de sa visite (sessionStorage) ; le pack choisi est gardé (localStorage).
  const area = k => (k === 'nr_contact' || k === 'nr_sent' ? sessionStorage : localStorage);
  // Si le navigateur bloque le stockage, la sélection reste en mémoire de la page (et d'une page à l'autre via window.name, pour le pack seulement).
  const mem = (() => { try { const o = JSON.parse(window.name || '{}'); return o && o.nr_pack ? {nr_pack: o.nr_pack} : {}; } catch (e) { return {}; } })();
  const store = {
    get(k, d) {
      try { const v = area(k).getItem(k); if (v) return JSON.parse(v); } catch (e) {}
      return k in mem ? mem[k] : d;
    },
    set(k, v) {
      mem[k] = v;
      if (k === 'nr_pack') { try { window.name = JSON.stringify({nr_pack: v}); } catch (e) {} }
      try { area(k).setItem(k, JSON.stringify(v)); } catch (e) {}
    }
  };
  const FORM = window.NR_CONFIG || {};
  // Deux modes d'envoi, sans aucun service externe :
  //  - « messagerie » (par défaut, adapté à GitHub Pages) : le site ouvre la messagerie du visiteur avec le message prêt,
  //    adressé à NR.EVO (et au client en copie pour le récapitulatif). Le visiteur n'a qu'à appuyer sur « Envoyer ».
  //  - « serveur » : si mailEndpoint est renseigné (config.js), envoyer.php envoie les emails (hébergement PHP).
  const MAILTO = !FORM.mailEndpoint;
  const TEAM = FORM.teamEmail || 'nr.evo.contact@gmail.com';
  const mailtoHref = (subject, body, cc) => 'mailto:' + TEAM + '?' + (cc ? 'cc=' + encodeURIComponent(cc) + '&' : '') + 'subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body.slice(0, 1800));
  // Envoi par le script du site lui-même (envoyer.php) : aucun service externe.
  // Délai maximal de 20 s pour qu'un formulaire ne reste jamais bloqué.
  const postForm = data => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    return fetch(FORM.mailEndpoint || 'envoyer.php', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Accept: 'application/json'},
      body: JSON.stringify(data),
      signal: controller.signal
    }).then(async response => {
      let result;
      try { result = await response.json(); }
      catch (_) { throw new Error(response.status === 404 || response.status === 405 ? 'envoi indisponible : envoyer.php est introuvable sur cet hébergement' : 'réponse invalide du serveur'); }
      if (!response.ok || !result.ok) throw new Error(result.error || `serveur indisponible (HTTP ${response.status})`);
      return result;
    }).catch(error => {
      if (error && error.name === 'AbortError') throw new Error('délai dépassé après 20 secondes');
      throw error;
    }).finally(() => clearTimeout(timer));
  };
  const ARROW = '<svg class="ar" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="square" aria-hidden="true"><path d="M3 10h13M11 4.5 16.5 10 11 15.5"/></svg>';
  const PAGES = {'index.html':'Accueil','offres.html':'Nos offres','site-essentiel.html':'Site Essentiel','site-premium.html':'Site Premium','site-grow.html':'Site + Grow','prospection.html':'Prospection','automatisation.html':'Automatisation','a-la-carte.html':'À la demande','composer.html':'Composer mon pack','realisations.html':'Réalisations','a-propos.html':'À propos','contact.html':'Contact','demos/volta.html':'Volta Électricité','demos/braise.html':'Braise','demos/apex.html':'Garage Apex'};

  /* ---------- toast ---------- */
  const toastEl = $('#toast'); let toastT;
  const toast = msg => { if (!toastEl) return; toastEl.textContent = msg; toastEl.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('show'), 2400); };

  /* ---------- pack store ---------- */
  const BASES = [
    ['none', 'J’ai déjà un site', 'On travaille sur l’existant.'],
    ['ess', 'Site Essentiel', 'Simple et efficace.'],
    ['prm', 'Site Premium', 'Design, animations, interactions.'],
    ['grow', 'Site + Grow', 'Site, conversion, premières automatisations.'],
  ];
  const MODS = [
    ['Croissance', [['pro', 'Prospection'], ['seo', 'SEO']]],
    ['Automatisation', [['aut', 'Automatisations'], ['frm', 'Formulaires'], ['eml', 'Emails automatiques'], ['rdv', 'Prise de rendez-vous'], ['crm', 'CRM'], ['bot', 'Chatbot'], ['ia', 'IA']]],
    ['Site', [['ref', 'Refonte de site'], ['mnt', 'Maintenance']]],
  ];
  const MODNAME = Object.fromEntries(MODS.flatMap(g => g[1]));
  const BASENAME = Object.fromEntries(BASES.map(b => [b[0], b[1]]));
  const getPack = () => { const p = store.get('nr_pack', null); return p && p.base ? {base: p.base, mods: new Set((p.mods || []).filter(m => MODNAME[m]))} : {base: null, mods: new Set()}; };
  const savePack = p => store.set('nr_pack', {base: p.base, mods: [...p.mods]});
  const packLabel = p => { const parts = []; if (p.base && p.base !== 'none') parts.push(BASENAME[p.base]); parts.push(...[...p.mods].map(k => MODNAME[k])); return parts.join(' + '); };
  const DESC = {'base-none': 'Votre site actuel est conservé : on intervient dessus.', 'base-ess': 'Site vitrine mobile et ordinateur, formulaire de contact, carte, réseaux sociaux, appels à l’action, mise en ligne.', 'base-prm': 'Tout l’Essentiel, avec design sur mesure, animations, interactions, galerie et fonctionnalités en plus.', 'base-grow': 'Site Essentiel ou Premium, outils de conversion, prise de rendez-vous et premières automatisations.', pro: 'Cible, recherche, qualification, contact, relances, suivi et rapport de résultats.', seo: 'Structure des pages, contenus, vitesse et fiche d’établissement.', aut: 'Tâches répétitives reliées entre elles : formulaire, notification, agenda, suivi.', frm: 'Formulaires qui envoient chaque demande au bon endroit.', eml: 'Accusés de réception, confirmations, rappels et relances automatiques.', rdv: 'Réservation de créneaux en ligne, agenda et confirmation.', crm: 'Fichier client organisé : qui a demandé quoi, où en est chaque prospect.', bot: 'FAQ automatique avec vos propres réponses.', ia: 'Outils d’IA utiles : rédaction, tri des demandes, réponses types.', ref: 'Refonte du site existant, en gardant ce qui fonctionne.', mnt: 'Mises à jour, sauvegardes et petites modifications.'};
  const packLines = p => { const L = []; if (p.base) L.push({label: p.base === 'none' ? 'Site existant conservé' : BASENAME[p.base], kind: 'Base', d: DESC['base-' + p.base]}); [...p.mods].forEach(m => L.push({label: MODNAME[m], kind: 'Module', d: DESC[m]})); return L; };
  const newRef = () => { const n = new Date(), z = x => String(x).padStart(2, '0'); return 'NR-' + n.getFullYear() + z(n.getMonth() + 1) + z(n.getDate()) + '-' + (Math.floor(Math.random() * 900) + 100); };
  /* Envoi automatique du récapitulatif : envoyer.php l'adresse à NR.EVO et en envoie une copie au client. */
  const sendRecap = (p, c, ref, bot) => {
    const L = packLines(p), name = c.name || '', co = c.co || '', mail = c.mail, tel = c.tel || '', msg = c.msg || '', who = name || mail;
    const sel = L.map(l => l.label).join(' + '), detail = L.map(l => `- ${l.kind} : ${l.label}`).join('\n');
    const txt = `Récapitulatif ${ref}\n\nClient : ${who}${co ? ' (' + co + ')' : ''}\nEmail : ${mail}${tel ? '\nTéléphone : ' + tel : ''}\n\nSélection :\n${detail}${msg ? '\n\nPrécisions : ' + msg : ''}\n\nÀ recontacter pour parler des prix et des modalités.`;
    const subject = 'Récapitulatif · ' + (co || who);
    const mtxt = `Bonjour NR.EVO,\n\nVoici mon récapitulatif (référence ${ref}).\n\nNom : ${who}${co ? ' (' + co + ')' : ''}\nEmail : ${mail}${tel ? '\nTéléphone : ' + tel : ''}\n\nMa sélection :\n${detail}${msg ? '\n\nPrécisions : ' + msg : ''}\n\nMerci de me recontacter pour parler des prix et des modalités.`;
    const mailto = mailtoHref(subject, mtxt, mail);
    if (MAILTO) return {promise: Promise.reject(Object.assign(new Error('mailto'), {mailto})), txt: mtxt, subject, sel, mailto};
    const promise = postForm({type: 'pack', ref, name, co, email: mail, tel, msg, selection: L.map(l => ({kind: l.kind, label: l.label})), bot: !!bot}).then(() => true);
    return {promise, txt: mtxt, subject, sel, mailto};
  };

  /* ---------- page enter ---------- */
  const curtain = $('.curtain'), loader = $('.loader');
  const heroIn = () => root.classList.remove('pre');
  function reveal() {
    if (!root.classList.contains('covered')) { heroIn(); return; }
    const k = (location.pathname.split('/').pop() || 'index.html'); const t = $('.ctt', curtain); if (t) t.textContent = PAGES[k] || 'NR.EVO';
    curtain.classList.add('up');
    const go = () => requestAnimationFrame(() => { curtain.classList.add('go'); requestAnimationFrame(() => { root.classList.remove('covered'); setTimeout(heroIn, 180); setTimeout(() => curtain.classList.remove('go', 'up'), 1000); }); });
    let fired = false; const once = () => { if (!fired) { fired = true; go(); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(once); setTimeout(once, 500);
  }
  function intro() {
    const cnt = $('.count', loader); const t0 = performance.now(); const D = 1800; let done = false;
    const tick = t => { if (done) return; const k = Math.min(1, (t - t0) / D); const e = 1 - Math.pow(1 - k, 3); cnt.textContent = String(Math.round(e * 100)).padStart(3, '0'); loader.style.setProperty('--p', e.toFixed(3)); if (k < 1) requestAnimationFrame(tick); else finish(); };
    requestAnimationFrame(tick);
    function finish() { if (done) return; done = true; cnt.textContent = '100'; loader.style.setProperty('--p', 1); setTimeout(() => loader.classList.add('out'), 120); try { sessionStorage.setItem('nr_intro', '1'); } catch (e) {} setTimeout(heroIn, 420); setTimeout(() => root.classList.remove('intro'), 1400); }
    $('.skip', loader).addEventListener('click', finish);
  }
  if (root.classList.contains('intro') && loader) intro(); else reveal();

  /* ---------- page leave ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]'); if (!a) return;
    if (a.dataset.base) { const p = getPack(); p.base = a.dataset.base; if (p.base !== 'none') p.mods.delete('ref'); savePack(p); }
    const href = a.getAttribute('href');
    if (!href || e.defaultPrevented || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    if (href.startsWith('#')) { const el = document.getElementById(href.slice(1)); if (el) { e.preventDefault(); closeMenus(); scrollToEl(el); } return; }
    if (/^(https?:|mailto:|tel:)/.test(href) || !/\.html(#[\w-]*)?$/.test(href)) return;
    e.preventDefault(); closeMenus();
    if (reduce || !curtain) { location.href = href; return; }
    const key = href.replace(/^\.\.\//, '').replace(/#.*$/, '');
    $('.ctt', curtain).textContent = a.dataset.t || PAGES[key] || '';
    curtain.classList.remove('up'); curtain.classList.add('go');
    requestAnimationFrame(() => root.classList.add('leaving'));
    setTimeout(() => { location.href = href; }, 820);
  });
  addEventListener('pageshow', e => { if (e.persisted) { root.classList.remove('leaving', 'covered'); curtain && curtain.classList.remove('go', 'up'); heroIn(); if (!location.hash) scrollTo(0, 0); } });

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  try { if (window.Lenis && !reduce && fine) lenis = new Lenis({lerp: .1}); } catch (e) { lenis = null; }
  const toTop = () => { if (location.hash || scrollY === 0) return; scrollTo(0, 0); if (lenis) lenis.scrollTo(0, {immediate: true}); };
  toTop(); addEventListener('load', () => { if (performance.now() < 4000) toTop(); }, {once: true});
  function scrollToEl(el) { const y = el.getBoundingClientRect().top + scrollY - 90; lenis ? lenis.scrollTo(y, {duration: 1.3}) : scrollTo({top: y, behavior: reduce ? 'auto' : 'smooth'}); }

  /* ---------- nav ---------- */
  const nav = $('#nav'), megaBtn = $('#megaBtn'), burger = $('#burger');
  let megaT;
  const setMega = o => { if (!nav) return; nav.classList.toggle('mega-open', o); megaBtn && megaBtn.setAttribute('aria-expanded', o); };
  function closeMenus() { setMega(false); root.classList.remove('mnav-open'); burger && burger.setAttribute('aria-expanded', false); lenis && lenis.start(); }
  if (megaBtn) {
    megaBtn.addEventListener('click', () => setMega(!nav.classList.contains('mega-open')));
    if (fine) {
      megaBtn.addEventListener('mouseenter', () => { clearTimeout(megaT); setMega(true); });
      nav.addEventListener('mouseleave', () => { megaT = setTimeout(() => setMega(false), 220); });
      nav.addEventListener('mouseenter', () => clearTimeout(megaT));
      $$('.menu > li > a').forEach(a => a.addEventListener('mouseenter', () => setMega(false)));
    }
  }
  burger && burger.addEventListener('click', () => { const o = !root.classList.contains('mnav-open'); root.classList.toggle('mnav-open', o); burger.setAttribute('aria-expanded', o); if (lenis) o ? lenis.stop() : lenis.start(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenus(); });
  document.addEventListener('click', e => { if (nav && nav.classList.contains('mega-open') && !e.target.closest('#nav')) setMega(false); });
  let lastY = scrollY;

  /* ---------- reveal on scroll ---------- */
  const rio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); } }), {rootMargin: '0px 0px -6% 0px'});
  $$('.rv').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 90 + 'ms'; rio.observe(el); });

  /* ---------- rotating word ---------- */
  const rot = $('.rot');
  if (rot) {
    const inner = rot.firstElementChild, items = $$('b', inner); let i = 0;
    const fit = () => {
      rot.style.fontSize = '';  // on mesure à la taille normale, puis on réduit si le plus long mot dépasse
      const cs0 = getComputedStyle(rot), pad0 = parseFloat(cs0.paddingLeft) + parseFloat(cs0.paddingRight);
      const widest = Math.max(...items.map(b => b.getBoundingClientRect().width));
      const avail = (rot.closest('h1') || rot.parentElement).getBoundingClientRect().width;
      const k = Math.min(1, (avail - 6) / (widest + pad0 + 2));
      if (k < 1) rot.style.fontSize = (k * 100).toFixed(2) + '%';
      const cs = getComputedStyle(rot); const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const h = items[0].getBoundingClientRect().height;
      rot.style.height = h + 'px';
      rot.style.width = Math.ceil(items[i].getBoundingClientRect().width + pad + 2) + 'px';
      inner.style.transform = `translateY(${-i * h}px)`;
    };
    fit(); addEventListener('resize', fit); addEventListener('load', fit);
    if (document.fonts) document.fonts.ready.then(fit);
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(rot.closest('h1') || rot);
    if (!reduce) setInterval(() => { i = (i + 1) % items.length; fit(); }, 2400);
  }

  /* ---------- hero tilt ---------- */
  const hv = $('.hero-visual');
  if (hv && fine && !reduce) {
    const img = $('.tilt img', hv);
    addEventListener('pointermove', e => { const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5; img.style.setProperty('--ry', (x * 22).toFixed(2) + 'deg'); img.style.setProperty('--rx', (-y * 16).toFixed(2) + 'deg'); }, {passive: true});
  }

  /* ---------- marquee ---------- */
  $$('.marquee .track').forEach(t => { t.innerHTML += t.innerHTML; });

  /* ---------- drag slider ---------- */
  $$('.work').forEach(w => {
    if (!fine) return;
    let down = false, sx = 0, sl = 0, moved = false;
    w.addEventListener('pointerdown', e => { down = true; moved = false; sx = e.clientX; sl = w.scrollLeft; });
    addEventListener('pointerup', () => { down = false; w.classList.remove('drag'); });
    w.addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; w.classList.add('drag'); } w.scrollLeft = sl - dx; });
    w.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    w.addEventListener('dragstart', e => e.preventDefault());
  });

  /* ---------- rule words ---------- */
  const words = $$('.rule .words button'); let wordLock = 0;
  const setWord = b => { words.forEach(x => x.classList.toggle('on', x === b)); const p = $('#wordTxt'); if (p) p.textContent = b.dataset.txt; };
  words.forEach(b => b.addEventListener('click', () => { wordLock = performance.now(); setWord(b); }));

  /* ---------- lignes de code qui s'écrivent ---------- */
  $$('.codebg').forEach(pre => {
    if (reduce) return;
    const full = pre.textContent; pre.textContent = '';
    const cur = document.createElement('span'); cur.className = 'cur';
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return; io.disconnect();
      let n = 0; const node = document.createTextNode(''); pre.append(node, cur);
      (function type() { n += 2; node.data = full.slice(0, n); if (n < full.length) setTimeout(type, 22); })();
    });
    io.observe(pre);
  });

  /* ---------- copy ---------- */
  const copy = async (text, ok) => { try { await navigator.clipboard.writeText(text); toast(ok); } catch (e) { toast('Copie impossible : sélectionnez le texte à la main'); } };
  $$('[data-copy]').forEach(b => b.addEventListener('click', () => copy(b.dataset.copy, 'Adresse copiée')));

  /* ---------- scroll loop ---------- */
  const vsteps = $$('.vsteps');
  function frame(now) {
    lenis && lenis.raf(now);
    const y = scrollY, vh = innerHeight;
    if (nav) {
      nav.classList.toggle('scrolled', y > 10);
      if (!nav.classList.contains('mega-open') && !root.classList.contains('mnav-open')) { if (y > 420 && y - lastY > 3) nav.classList.add('hide'); else if (lastY - y > 3 || y < 420) nav.classList.remove('hide'); }
    }
    lastY = y;
    vsteps.forEach(v => { const b = v.getBoundingClientRect(); v.style.setProperty('--vp', Math.max(0, Math.min(1, (vh * .6 - b.top) / b.height)).toFixed(3)); $$('li', v).forEach(li => li.classList.toggle('on', li.getBoundingClientRect().top < vh * .6)); });
    if (words.length && now - wordLock > 2500) {
      let best = null, bd = 1e9; words.forEach(b => { const r = b.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - vh * .5); if (d < bd) { bd = d; best = b; } });
      if (best && !best.classList.contains('on')) setWord(best);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- quiz ---------- */
  const quiz = $('#quiz');
  if (quiz) {
    const ans = {};
    const R = {
      ess: ['Site Essentiel', 'Un site professionnel, clair et rapide pour être trouvé et contacté.', 'site-essentiel.html'],
      prm: ['Site Premium', 'Un site sur mesure qui marque les esprits et vous démarque.', 'site-premium.html'],
      grow: ['Site + Grow', 'Un site pensé pour transformer les visites en demandes et en rendez-vous.', 'site-grow.html'],
      pro: ['Prospection', 'Votre site suffit : il vous faut surtout de nouveaux prospects.', 'prospection.html'],
      aut: ['Automatisation', 'On automatise vos demandes et vos relances sans refaire votre site.', 'automatisation.html'],
      car: ['À la demande', 'Une prestation précise suffira : SEO, maintenance, prise de rendez-vous…', 'a-la-carte.html'],
    };
    const decide = () => {
      if (!ans.a || !ans.b) return null;
      if (ans.a === 'ok') return {visible: 'car', marquer: 'car', demandes: 'aut', prospects: 'pro', temps: 'aut'}[ans.b];
      return {visible: 'ess', marquer: 'prm', demandes: 'grow', prospects: 'grow', temps: 'grow'}[ans.b];
    };
    $$('.opt', quiz).forEach(o => o.addEventListener('click', () => {
      ans[o.dataset.q] = o.dataset.v;
      $$(`.opt[data-q="${o.dataset.q}"]`, quiz).forEach(x => x.setAttribute('aria-pressed', x === o));
      const r = decide(), res = $('.res', quiz);
      if (!r) return;
      const d = R[r]; res.classList.remove('wait');
      res.innerHTML = `<div><small>Notre conseil</small><b>${d[0]}</b><p>${d[1]}</p></div><a class="btn" href="${d[2]}">Découvrir ${ARROW}</a>`;
    }));
  }

  /* ---------- automation simulator ---------- */
  const sim = $('#sim');
  if (sim) {
    const ICON = {
      form: '<rect x="4" y="3" width="16" height="18"/><path d="M8 8h8M8 12h8M8 16h5"/>',
      mail: '<rect x="3" y="5" width="18" height="14"/><path d="m3 7 9 6 9-6"/>',
      bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21h4"/>',
      cal: '<rect x="3" y="5" width="18" height="16"/><path d="M3 10h18M8 3v4M16 3v4"/>',
      track: '<path d="M3 3v18h18"/><path d="m7 15 4-4 3 3 5-6"/>',
      user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
      filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
      db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
      loop: '<path d="M17 2l4 4-4 4"/><path d="M3 12V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 12v3a3 3 0 0 1-3 3H3"/>',
    };
    const SC = [
      {nodes: [['form', 'Formulaire', 'Un visiteur remplit le formulaire'], ['mail', 'Email automatique', 'Accusé de réception envoyé'], ['bell', 'Notification', 'Vous êtes prévenu sur mobile'], ['cal', 'Calendrier', 'Un créneau est proposé'], ['track', 'Suivi', 'La demande entre dans le suivi']],
       log: [['Formulaire reçu', 'Julie M. · « Refonte du site du salon »'], ['Email envoyé', 'À julie@exemple.fr : « Merci, on revient vers vous rapidement »'], ['Notification', 'Téléphone de l’équipe : nouvelle demande de contact'], ['Agenda', 'Lien de réservation envoyé, créneau proposé jeudi 10h'], ['Suivi', 'Statut « À rappeler » ajouté au tableau']]},
      {nodes: [['user', 'Prospect', 'Un nouveau prospect est ajouté'], ['filter', 'Qualification', 'Besoin et potentiel vérifiés'], ['db', 'CRM', 'Fiche créée, étape suivie'], ['loop', 'Relance auto', 'Relance si pas de réponse']],
       log: [['Prospect ajouté', 'Boulangerie (exemple) · pas de site, fiche Google seule'], ['Qualification', 'Besoin : site vitrine · intérêt estimé élevé'], ['CRM', 'Fiche créée · étape « à contacter »'], ['Relance', 'Programmée à J+4 si aucune réponse']]},
    ];
    const flow = $('.flow', sim), log = $('.log', sim); let sc = 0, timers = [];
    const draw = () => { flow.innerHTML = SC[sc].nodes.map((n, i) => `${i ? '<div class="conn"><i></i></div>' : ''}<div class="node"><div class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">${ICON[n[0]]}</svg></div><b>${n[1]}</b><small>${n[2]}</small></div>`).join(''); };
    const run = () => {
      timers.forEach(clearTimeout); timers = []; draw();
      log.innerHTML = '<div class="ph">Simulation · scénario d’exemple, données fictives</div>';
      const nodes = $$('.node', flow), conns = $$('.conn', flow), t0 = new Date();
      nodes.forEach((n, i) => timers.push(setTimeout(() => {
        if (i) conns[i - 1].classList.add('on');
        timers.push(setTimeout(() => {
          n.classList.add('on');
          const [k, v] = SC[sc].log[i];
          log.insertAdjacentHTML('beforeend', `<div class="ln"><span>${new Date(t0.getTime() + i * 1300).toLocaleTimeString('fr-FR')}</span><span>${k}</span><span>${v}</span></div>`);
          if (i === nodes.length - 1) log.insertAdjacentHTML('beforeend', `<div class="ln"><span></span><span>Terminé</span><span>${nodes.length} étapes, aucune action manuelle.</span></div>`);
        }, i && !reduce ? 480 : 0));
      }, reduce ? 0 : i * 950)));
    };
    $$('.seg button', sim).forEach(b => b.addEventListener('click', () => { sc = +b.dataset.sc; $$('.seg button', sim).forEach(x => x.setAttribute('aria-selected', x === b)); run(); }));
    $('#simRun').addEventListener('click', run);
    draw();
    new IntersectionObserver(([en], o) => { if (en.isIntersecting) { run(); o.disconnect(); } }, {threshold: .4}).observe(sim);
  }

  /* ---------- à la carte ---------- */
  const carte = $('#carte');
  if (carte) {
    const dockN = $('#dockN');
    const sync = () => { const p = getPack(); $$('[data-add]', carte).forEach(b => { const on = p.mods.has(b.dataset.add); b.innerHTML = (on ? 'Retirer du pack' : 'Ajouter au pack') + ARROW; b.closest('details').classList.toggle('in', on); }); dockN.textContent = p.mods.size ? `${p.mods.size} prestation${p.mods.size > 1 ? 's' : ''} dans votre pack` : 'Aucune prestation sélectionnée'; };
    $$('[data-add]', carte).forEach(b => b.addEventListener('click', () => {
      const p = getPack(); const k = b.dataset.add; const add = !p.mods.has(k);
      add ? p.mods.add(k) : p.mods.delete(k); if (k === 'ref' && add) p.base = 'none'; if (!p.base) p.base = 'none';
      savePack(p); sync(); toast(add ? `${MODNAME[k]} ajouté au pack` : `${MODNAME[k]} retiré du pack`);
    }));
    sync();
  }

  /* ---------- composer ---------- */
  const comp = $('#composer');
  if (comp) {
    const p = getPack(); if (!p.base) { p.base = 'prm'; if (!p.mods.size) p.mods.add('pro'); }
    const basesEl = $('#bases', comp), modsEl = $('#mods', comp), list = $('#tkList'), code = $('#tkCode'), hint = $('#tkHint');
    basesEl.innerHTML = BASES.map(b => `<button type="button" class="base" role="radio" data-b="${b[0]}"><b>${b[1]}</b><small>${b[2]}</small></button>`).join('');
    modsEl.innerHTML = MODS.map(g => `<div class="mgroup"><small>${g[0]}</small><div class="chips">${g[1].map(m => `<button type="button" class="chip" data-m="${m[0]}">${m[1]}</button>`).join('')}</div></div>`).join('');
    let prev = new Set();
    const render = () => {
      if ($('#tkDone')) { $('#tkDone').hidden = true; $('#tkForm').hidden = false; }
      $$('.base', basesEl).forEach(b => b.setAttribute('aria-checked', b.dataset.b === p.base));
      $$('.chip', modsEl).forEach(c => c.setAttribute('aria-pressed', p.mods.has(c.dataset.m)));
      const ref = $('[data-m="ref"]', modsEl); ref.disabled = p.base !== 'none'; ref.title = ref.disabled ? 'Votre nouveau site remplace déjà l’ancien' : '';
      const lines = [];
      lines.push(`<li class="base-line" data-k="base-${p.base}"><span>${p.base === 'none' ? 'Site existant conservé' : BASENAME[p.base]}</span><span>Base</span></li>`);
      [...p.mods].forEach(k => lines.push(`<li data-k="${k}"><span>+ ${MODNAME[k]}</span><span>Module</span></li>`));
      list.innerHTML = lines.join('');
      $$('li', list).forEach(li => { if (prev.has(li.dataset.k)) li.style.animation = 'none'; });
      prev = new Set($$('li', list).map(li => li.dataset.k));
      const n = p.mods.size;
      code.textContent = 'NR-' + {none: 'EXI', ess: 'ESS', prm: 'PRM', grow: 'GRW'}[p.base] + (n ? '-' + [...p.mods].map(k => k.toUpperCase()).join('-') : '');
      hint.textContent = p.base === 'none' && !n ? 'Choisissez au moins un module : prospection, automatisation, SEO…'
        : p.base === 'grow' ? 'Site + Grow part d’une base de conversion. Prospection et automatisations avancées s’ajoutent selon votre projet.'
        : p.base === 'none' ? 'Pas besoin de refaire votre site : on travaille avec ce que vous avez.'
        : !n ? 'Un site seul, c’est déjà une bonne base. Ajoutez un module si besoin.'
        : `${n} module${n > 1 ? 's' : ''} en plus de votre ${BASENAME[p.base]}.`;
      $('#tkSend').classList.toggle('off', p.base === 'none' && !n);
      savePack(p);
    };
    basesEl.addEventListener('click', e => { const b = e.target.closest('.base'); if (!b) return; p.base = b.dataset.b; if (p.base !== 'none') p.mods.delete('ref'); render(); });
    modsEl.addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c || c.disabled) return; const k = c.dataset.m; p.mods.has(k) ? p.mods.delete(k) : p.mods.add(k); if (k === 'ref' && p.mods.has(k)) p.base = 'none'; render(); });
    const tc = store.get('nr_contact', {});
    [['#tkName', 'name'], ['#tkMail', 'mail'], ['#tkTel', 'tel'], ['#tkCo', 'co']].forEach(([id, k]) => { $(id).value = tc[k] || ''; });
    $$('#tkFields input, #tkFields textarea').forEach(i => i.addEventListener('input', () => { i.classList.remove('bad'); $('#tkErr').textContent = ''; }));
    const mark = id => { const el = $(id); el.classList.add('bad'); el.focus(); };
    $('#tkSend').addEventListener('click', () => {
      const err = $('#tkErr'), g = id => $(id).value.trim(), name = g('#tkName'), mail = g('#tkMail'), tel = g('#tkTel'), co = g('#tkCo'), msg = g('#tkMsg');
      if (p.base === 'none' && !p.mods.size) { err.textContent = 'Choisissez au moins un module.'; return; }
      if (name.length < 2) { err.textContent = 'Indiquez votre nom (étape 3).'; mark('#tkName'); return; }
      if (!/^\S+@\S+\.\S+$/.test(mail)) { err.textContent = 'Indiquez une adresse email valide pour recevoir votre récapitulatif (étape 3).'; mark('#tkMail'); return; }
      err.textContent = ''; store.set('nr_contact', Object.assign({}, store.get('nr_contact', {}), {name, mail, tel, co}));
      const btn = $('#tkSend'), old = btn.innerHTML; btn.disabled = true; btn.textContent = 'Envoi en cours…';
      const ref = newRef(), s = sendRecap(p, {name, mail, tel, co, msg}, ref, $('#tkBot') && $('#tkBot').checked);
      s.promise.then(() => { store.set('nr_sent', {ref}); $('#tkForm').hidden = true; const d = $('#tkDone'); d.hidden = false; d.innerHTML = '<b>Récapitulatif envoyé ✓</b><p class="muted"></p><div class="row-btns"><a class="btn sm" href="recapitulatif.html?sent=' + encodeURIComponent(ref) + '" data-t="Récapitulatif">Imprimer / PDF</a></div>'; $('p', d).textContent = 'Merci ' + name + ' ! Une copie arrive sur ' + mail + ' (regardez aussi les indésirables). On vous contacte très vite pour parler des prix et des modalités.'; })
        .catch(er => {
          if (er && er.mailto) {
            $('#tkForm').hidden = true; const d = $('#tkDone'); d.hidden = false;
            d.innerHTML = '<b>Dernière étape : envoyez l’email</b><p class="muted"></p><div class="row-btns"><a class="btn sm" id="tkMailto">Ouvrir ma messagerie</a><button type="button" class="ulink" id="tkCopy" style="background:none;border:0;cursor:pointer">Copier le récapitulatif</button></div>';
            $('p', d).textContent = 'Votre messagerie s’ouvre avec le récapitulatif prêt, adressé à NR.EVO, avec ' + mail + ' en copie. Appuyez sur « Envoyer » : rien ne part avant. Rien ne s’est ouvert ? Utilisez les boutons ci-dessous.';
            $('#tkMailto').href = er.mailto; $('#tkCopy').addEventListener('click', () => copy(s.txt, 'Récapitulatif copié'));
            location.href = er.mailto; return;
          }
          err.textContent = 'L’envoi automatique a échoué (' + ((er && er.message) || 'erreur réseau') + '). Réessayez, ou '; const a = document.createElement('a'); a.className = 'ulink'; a.href = 'contact.html'; a.dataset.t = 'Contact'; a.textContent = 'écrivez-nous depuis la page contact'; err.appendChild(a); })
        .finally(() => { btn.disabled = false; btn.innerHTML = old; });
    });
    $('#tkReset').addEventListener('click', () => { p.base = 'prm'; p.mods.clear(); render(); toast('Pack réinitialisé'); });
    render();
  }

  /* ---------- informations légales (config.js) ---------- */
  const LG = FORM.legal || {};
  $$('[data-legal]').forEach(el => { const v = String(LG[el.dataset.legal] || '').trim(); if (v) { el.textContent = v; el.classList.remove('todo'); } });
  $$('[data-legal-opt]').forEach(el => { el.hidden = !String(LG[el.dataset.legalOpt] || '').trim(); });

  /* ---------- contact ---------- */
  const form = $('#cform');
  if (form) {
    const ct = store.get('nr_contact', {});
    $('#fName').value = ct.name || ''; $('#fMail').value = ct.mail || ''; $('#fTel').value = ct.tel || '';
    const body = $('#formBody'), ready = $('#formReady');
    const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
    form.addEventListener('submit', e => {
      e.preventDefault();
      const v = id => $(id).value.trim(), err = $('#fErr');
      const name = v('#fName'), mail = v('#fMail'), tel = v('#fTel'), msg = v('#fMsg');
      if (name.length < 2) return err.textContent = 'Indiquez votre nom.';
      if (!/^\S+@\S+\.\S+$/.test(mail)) return err.textContent = 'Adresse email invalide, par exemple nom@exemple.fr.';
      if (msg.length < 5) return err.textContent = 'Écrivez quelques mots pour nous expliquer votre demande.';
      err.textContent = '';
      store.set('nr_contact', Object.assign({}, store.get('nr_contact', {}), {name, mail, tel}));
      const txt = `Bonjour NR.EVO,\n\n${msg}\n\n${name}\nEmail : ${mail}${tel ? '\nTéléphone : ' + tel : ''}`;
      const subject = 'Message · ' + name;
      const showReady = (note, mt) => {
        body.hidden = true; ready.hidden = false;
        ready.innerHTML = `<div class="ready">${mt ? '<h3 class="h4">Dernière étape : envoyez l’email</h3><p class="muted">Votre messagerie s’ouvre avec le message prêt, adressé à <b style="color:var(--ink);user-select:all">' + TEAM + '</b>. Appuyez sur « Envoyer » : rien ne part avant. Rien ne s’est ouvert ? Utilisez les boutons ci-dessous.</p>' : '<h3 class="h4">Votre message est prêt</h3><p class="muted">Envoyez-le à <b style="color:var(--ink);user-select:all">' + TEAM + '</b> : copiez-le, ou ouvrez-le dans votre messagerie.</p>'}<pre>${esc(txt)}</pre><div class="row-btns"><button type="button" class="btn" id="cpMsg">Copier le message</button><a class="btn ghost" href="mailto:nr.evo.contact@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(txt)}">Ouvrir ma messagerie</a><button type="button" class="ulink" id="editMsg" style="background:none;border:0;cursor:pointer">Modifier</button></div></div>`;
        $('#cpMsg').addEventListener('click', () => copy(txt, 'Message copié'));
        $('#editMsg').addEventListener('click', () => { ready.hidden = true; body.hidden = false; $('#fMsg').focus(); });
        if (note) ready.insertAdjacentHTML('afterbegin', `<p class="ferr">${note}</p>`);
      };
      const btn = $('button[type="submit"]', form), old = btn.innerHTML; btn.disabled = true; btn.textContent = 'Envoi en cours…';
      if (MAILTO) { showReady('', true); btn.disabled = false; btn.innerHTML = old; location.href = mailtoHref(subject, txt); return; }
      const bot = !!($('#fBot') && $('#fBot').checked);
      postForm({type: 'contact', name, email: mail, tel, msg, bot})
        .then(() => {
          body.hidden = true; ready.hidden = false;
          ready.innerHTML = `<div class="ready"><h3 class="h4">Message envoyé ✓</h3><p class="muted">Merci ${esc(name)}, nous revenons vers vous rapidement à <b style="color:var(--ink)">${esc(mail)}</b>.</p><pre>${esc(txt)}</pre><div class="row-btns"><button type="button" class="btn ghost" id="newMsg">Envoyer un autre message</button></div></div>`;
          $('#newMsg').addEventListener('click', () => location.reload());
        })
        .catch(er => showReady('L’envoi automatique a échoué' + (er && er.message ? ' (' + esc(er.message) + ')' : '') + '. Votre message est prêt ci-dessous : envoyez-le par email.'))
        .finally(() => { btn.disabled = false; btn.innerHTML = old; });
    });
  }

  /* ---------- récapitulatif de la sélection ---------- */
  const rc = $('#recap');
  if (rc) {
    const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[ch]));
    const pack = getPack(), ct = store.get('nr_contact', {}), sentInfo = store.get('nr_sent', null), already = !!(sentInfo && new URLSearchParams(location.search).get('sent') === sentInfo.ref), ref = already ? sentInfo.ref : newRef(), L = packLines(pack);
    $('#rcRef').textContent = ref; $('#rcDate').textContent = new Date().toLocaleDateString('fr-FR');
    $('#rcList').innerHTML = L.length ? L.map(l => `<li><div><b>${esc(l.label)}</b><small>${l.kind}</small></div><p>${esc(l.d)}</p></li>`).join('') : '<li><div><b>Aucune sélection</b></div><p>Choisissez une base ou un module dans <a class="ulink" href="composer.html">Composer mon pack</a>.</p></li>';
    [['#rcName', 'name'], ['#rcCo', 'co'], ['#rcMail', 'mail'], ['#rcTel', 'tel']].forEach(([id, k]) => { $(id).value = ct[k] || ''; });
    document.addEventListener('click', e => { if (e.target.closest('[data-print]')) window.print(); });
    addEventListener('beforeprint', () => { rc.dataset.t = document.title; document.title = 'Récapitulatif ' + ref; });
    addEventListener('afterprint', () => { if (rc.dataset.t) document.title = rc.dataset.t; });
    const body = $('#rcBody'), done = $('#rcDone'), err = $('#rcErr'), send = $('#rcSend');
    const lock = html => { $$('input, textarea', rc).forEach(i => { i.readOnly = true; }); send.closest('.noprint').hidden = true; done.hidden = false; done.innerHTML = html; scrollTo(0, 0); };
    if (already) lock('<div class="ready"><h3 class="h3">Récapitulatif déjà envoyé ✓</h3><p class="lead">Il nous est bien parvenu. Vous pouvez l’imprimer ou l’enregistrer en PDF.</p><div class="row-btns"><button type="button" class="btn" data-print>Imprimer / PDF</button><a class="btn ghost" href="index.html">Retour à l’accueil</a></div></div>');
    send.addEventListener('click', () => {
      const v = id => $(id).value.trim(), name = v('#rcName'), co = v('#rcCo'), mail = v('#rcMail'), tel = v('#rcTel'), msg = v('#rcMsg');
      if (!L.length) return err.textContent = 'Choisissez d’abord une base ou un module dans « Composer mon pack ».';
      if (name.length < 2) return err.textContent = 'Indiquez votre nom.';
      if (!/^\S+@\S+\.\S+$/.test(mail)) return err.textContent = 'Adresse email invalide, par exemple nom@exemple.fr.';
      err.textContent = ''; store.set('nr_contact', {name, co, mail, tel});
      const s = sendRecap(pack, {name, co, mail, tel, msg}, ref, $('#rcBot') && $('#rcBot').checked);
      const old = send.innerHTML; send.disabled = true; send.textContent = 'Envoi en cours…';
      const show = html => { rc.hidden = true; done.hidden = false; done.innerHTML = html; scrollTo(0, 0); };
      s.promise.then(() => { store.set('nr_sent', {ref}); lock(`<div class="ready"><h3 class="h3">Récapitulatif envoyé ✓</h3><p class="lead">Merci ${esc(name)}. Une copie vient d’être envoyée à <b>${esc(mail)}</b> (pensez à regarder les courriers indésirables). Nous vous contactons très vite pour parler des prix et des modalités.</p><div class="row-btns"><button type="button" class="btn" data-print>Imprimer / PDF</button><a class="btn ghost" href="index.html">Retour à l’accueil</a></div></div>`); })
        .catch(er => { show(`<div class="ready">${er && er.mailto ? '<h3 class="h3">Dernière étape : envoyez l’email</h3><p class="lead">Votre messagerie s’ouvre avec le récapitulatif prêt, adressé à NR.EVO, avec ' + esc(mail) + ' en copie. Appuyez sur « Envoyer » : rien ne part avant. Rien ne s’est ouvert ? Utilisez les boutons ci-dessous.</p>' : '<p class="ferr">L’envoi automatique a échoué' + (er && er.message ? ' (' + esc(er.message) + ')' : '') + '. Votre récapitulatif est prêt : envoyez-le par email.</p>'}<pre>${esc(s.txt)}</pre><div class="row-btns"><button type="button" class="btn" id="rcCopy">Copier le récapitulatif</button><a class="btn ghost" href="${esc(s.mailto)}">Ouvrir ma messagerie</a></div></div>`); $('#rcCopy').addEventListener('click', () => copy(s.txt, 'Récapitulatif copié')); if (er && er.mailto) location.href = er.mailto; })
        .finally(() => { send.disabled = false; send.innerHTML = old; });
    });
  }
})();
