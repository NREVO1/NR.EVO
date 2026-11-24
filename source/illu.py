"""Illustrations SVG des offres NR.EVO (style maison : traits noirs, aplats lilas, ombres franches)."""
INK, L, L2, BG2, W, G = '#0d0c11', '#c58af9', '#eadcfd', '#f4f1f8', '#ffffff', '#cfc7da'
DISP = "font-family=\"Anybody, 'Arial Black', sans-serif\" font-weight=\"800\" style=\"font-stretch:115%\""
BODY = "font-family=\"'Schibsted Grotesk', Arial, sans-serif\" font-weight=\"600\""


def rect(x, y, w, h, fill=W, stroke=True, rx=0, extra=''):
    sw = '' if 'stroke-width' in extra else ' stroke-width="3"'
    s = f' stroke="{INK}"{sw}' if stroke else ''
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"{s}{extra}/>'


def card(x, y, w, h, fill=W, sh=9, rx=0):
    return rect(x + sh, y + sh, w, h, INK, False, rx) + rect(x, y, w, h, fill, True, rx)


def win(x, y, w, h, fill=W, sh=10):
    s = card(x, y, w, h, fill, sh)
    s += f'<line x1="{x}" y1="{y+30}" x2="{x+w}" y2="{y+30}" stroke="{INK}" stroke-width="3"/>'
    for i in range(3):
        s += f'<circle cx="{x+18+i*16}" cy="{y+15}" r="4.5" fill="none" stroke="{INK}" stroke-width="2.5"/>'
    s += rect(x + 72, y + 9, min(190, int(w * .42)), 12, BG2, True, 6, ' stroke-width="2"')
    return s


def bar(x, y, w, h=8, fill=G):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}"/>'


def txt(x, y, t, size=20, fill=INK, font=DISP, anchor='start'):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" {font}>{t}</text>'


def star(cx, cy, r, fill=W, cls=''):
    k = r * .28
    d = f'M{cx} {cy-r} Q{cx+k} {cy-k} {cx+r} {cy} Q{cx+k} {cy+k} {cx} {cy+r} Q{cx-k} {cy+k} {cx-r} {cy} Q{cx-k} {cy-k} {cx} {cy-r}Z'
    return f'<path class="{cls}" d="{d}" fill="{fill}" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/>'


def icon(name, x, y, s=2.2, color=INK, sw=1.7):
    P = {
        'form': '<rect x="4" y="3" width="16" height="18"/><path d="M8 8h8M8 12h8M8 16h5"/>',
        'mail': '<rect x="3" y="5" width="18" height="14"/><path d="M3 5.5l9 7 9-7"/>',
        'bell': '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21h4"/>',
        'cal': '<rect x="3" y="5" width="18" height="16"/><path d="M3 10h18M8 3v4M16 3v4"/>',
        'pin': '<path d="M12 22s-7-7.2-7-12a7 7 0 1 1 14 0c0 4.8-7 12-7 12z"/><circle cx="12" cy="10" r="2.6"/>',
        'check': '<path d="m5 12.5 4.5 4.5L19 7"/>',
        'plane': '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
    }[name]
    return f'<g transform="translate({x} {y}) scale({s})" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{P}</g>'


def svg(body, label):
    return f'<svg class="ill" viewBox="0 0 800 500" role="img" aria-label="{label}" preserveAspectRatio="xMidYMid meet">{body}</svg>'


def ess():
    b = win(60, 40, 520, 370)
    b += rect(84, 92, 26, 26, L) + bar(410, 101, 40) + bar(462, 101, 40) + bar(514, 101, 36)
    b += bar(84, 150, 250, 22, INK) + bar(84, 182, 186, 22, INK) + bar(84, 222, 226) + bar(84, 238, 196)
    b += f'<g class="pulse">{rect(84, 266, 130, 36, INK, False)}{bar(102, 281, 70, 6, W)}<path d="M184 284h14m-5-5 5 5-5 5" stroke="{W}" stroke-width="2.5" fill="none"/></g>'
    b += rect(360, 140, 196, 166, L2)
    for i in range(1, 5):
        b += f'<line x1="{360+i*39}" y1="140" x2="{360+i*39}" y2="306" stroke="{W}" stroke-width="2"/>'
    for i in range(1, 4):
        b += f'<line x1="360" y1="{140+i*41}" x2="556" y2="{140+i*41}" stroke="{W}" stroke-width="2"/>'
    b += f'<path d="M360 270 L440 210 L556 236" stroke="{W}" stroke-width="7" fill="none"/>'
    b += f'<g class="bob"><path d="M458 232c0 0-24-27-24-43a24 24 0 1 1 48 0c0 16-24 43-24 43z" fill="{L}" stroke="{INK}" stroke-width="3"/><circle cx="458" cy="189" r="8" fill="{W}" stroke="{INK}" stroke-width="3"/></g>'
    for i, xx in enumerate((84, 248, 412)):
        b += rect(xx, 326, 144, 62, W) + rect(xx + 12, 338, 22, 22, [L, L2, INK][i]) + bar(xx + 44, 342, 80) + bar(xx + 44, 356, 60)
    b += card(606, 120, 150, 300, W, 9, 22)
    b += rect(620, 140, 122, 260, BG2, True, 12, ' stroke-width="2"') + rect(632, 156, 22, 22, L) + bar(632, 196, 96, 14, INK) + bar(632, 216, 70, 14, INK) + bar(632, 242, 98) + bar(632, 256, 80)
    b += rect(632, 282, 98, 64, L2) + rect(632, 358, 98, 28, INK, False) + bar(652, 369, 58, 6, W)
    b += f'<g class="slide">{card(330, 398, 270, 66, W, 7)}{rect(344, 412, 38, 38, L)}{icon("mail", 351, 419, 1.0)}{txt(396, 428, "Nouvelle demande", 16, INK, BODY)}{bar(396, 440, 140, 7)}</g>'
    return svg(b, 'Illustration : un site vitrine simple sur ordinateur et téléphone')


def prm():
    b = win(40, 36, 560, 390)
    b += rect(43, 69, 554, 214, L, False)
    b += f'<line x1="40" y1="283" x2="600" y2="283" stroke="{INK}" stroke-width="3"/>'
    b += bar(72, 108, 300, 34, INK) + bar(72, 152, 230, 34, INK) + bar(72, 204, 190, 9, W) + bar(72, 222, 150, 9, W)
    b += f'<path d="M80 262 C 200 200, 330 300, 470 214 S 560 150, 580 120" stroke="{INK}" stroke-width="2.5" stroke-dasharray="7 8" fill="none"/>'
    b += f'<circle r="10" fill="{W}" stroke="{INK}" stroke-width="3"><animateMotion dur="5s" repeatCount="indefinite" path="M80 262 C 200 200, 330 300, 470 214 S 560 150, 580 120"/></circle>'
    b += star(470, 120, 30, W, 'tw') + star(540, 210, 18, INK, 'tw d2') + star(410, 230, 12, W, 'tw d3')
    b += rect(72, 304, 150, 98, L2) + rect(238, 304, 150, 98, INK, False) + f'<circle cx="313" cy="353" r="28" fill="{L}"/>' + rect(404, 304, 168, 98, W)
    for i in range(5):
        b += f'<line x1="{404+i*36}" y1="402" x2="{440+i*36}" y2="304" stroke="{L}" stroke-width="5"/>'
    b += f'<g class="fan1">{card(612, 92, 150, 196, W, 9)}{rect(626, 106, 122, 96, L)}{star(687, 154, 20, W)}{bar(626, 216, 100, 10, INK)}{bar(626, 236, 80)}{bar(626, 252, 92)}</g>'
    b += f'<g class="fan2">{card(570, 300, 170, 150, L2, 9)}{txt(588, 356, "Galerie", 26)}{bar(588, 374, 110)}{bar(588, 390, 80)}{rect(588, 410, 60, 22, INK, False)}</g>'
    b += f'<g class="clk"><path d="M330 236 l0 46 l12-12 l10 22 l9-4 l-10-21 l17 0z" fill="{W}" stroke="{INK}" stroke-width="3" stroke-linejoin="round"/></g>'
    return svg(b, 'Illustration : un site sur mesure avec animations et galerie')


def grow():
    b = win(40, 70, 430, 350)
    b += bar(64, 124, 230, 24, INK) + bar(64, 158, 170, 24, INK) + bar(64, 198, 210) + bar(64, 214, 180)
    b += rect(64, 240, 150, 40, L) + txt(80, 266, 'Prendre RDV', 16, INK, BODY)
    b += rect(64, 300, 380, 96, L2) + bar(84, 322, 160, 10, INK) + bar(84, 344, 240) + bar(84, 360, 200)
    b += card(452, 32, 270, 226, W, 9) + rect(452, 32, 270, 42, INK, False) + txt(470, 60, 'OCTOBRE', 17, W)
    for r in range(4):
        for c in range(6):
            x, y = 470 + c * 40, 88 + r * 40
            hit = (r, c) == (2, 3)
            b += rect(x, y, 30, 28, L if hit else (BG2 if (r + c) % 3 else W), True, 0, ' stroke-width="2"')
            if hit:
                b += icon('check', x + 3, y + 2, 1.0, INK, 3)
    b += card(470, 278, 290, 196, W, 9)
    b += f'<line x1="496" y1="446" x2="738" y2="446" stroke="{INK}" stroke-width="3"/>'
    for i, h in enumerate((44, 66, 92, 118, 148)):
        b += f'<rect class="gbar g{i}" x="{506+i*46}" y="{446-h}" width="30" height="{h}" fill="{L if i % 2 == 0 else INK}" stroke="{INK}" stroke-width="2.5"/>'
    b += f'<path d="M500 410 L560 380 L610 388 L700 300" stroke="{INK}" stroke-width="4" fill="none" stroke-dasharray="0" /><path d="M684 300 L702 298 L700 316" stroke="{INK}" stroke-width="4" fill="none"/>'
    b += f'<g class="slide">{card(70, 404, 320, 70, W, 7)}{rect(84, 418, 42, 42, L)}{icon("bell", 92, 426, 1.08)}{txt(140, 436, "Nouveau rendez-vous", 16, INK, BODY)}{txt(140, 456, "À l’instant · confirmé", 13, "#77707f", BODY)}</g>'
    return svg(b, 'Illustration : site, prise de rendez-vous et croissance des demandes')


def pro():
    b = card(48, 52, 350, 400, W, 10)
    b += rect(48, 52, 350, 48, INK, False) + txt(68, 83, 'PROSPECTS', 17, W)
    stat = [(L, 'RDV'), (W, 'Relance'), (INK, 'Devis'), (L2, 'Intéressé'), (W, 'Contacté')]
    for i, (f, lab) in enumerate(stat):
        y = 116 + i * 66
        b += rect(66, y, 38, 38, [L2, L, BG2, INK, L2][i]) + bar(118, y + 6, 120, 10, INK) + bar(118, y + 24, 90)
        b += rect(286, y + 8, 94, 24, f, True, 0, ' stroke-width="2"') + txt(333, y + 25, lab, 12, W if f == INK else INK, BODY, 'middle')
    b += f'<circle cx="618" cy="262" r="152" fill="{INK}"/>'
    b += f'<circle cx="608" cy="252" r="152" fill="{W}" stroke="{INK}" stroke-width="3"/><circle cx="608" cy="252" r="112" fill="{L}" stroke="{INK}" stroke-width="3"/><circle cx="608" cy="252" r="72" fill="{W}" stroke="{INK}" stroke-width="3"/><circle cx="608" cy="252" r="32" fill="{INK}"/>'
    b += f'<g class="dart"><line x1="726" y1="96" x2="614" y2="246" stroke="{INK}" stroke-width="7"/><path d="M726 96 l26-6 -10 22 z M726 96 l6-26 -22 10z" fill="{L}" stroke="{INK}" stroke-width="2.5" stroke-linejoin="round"/></g>'
    b += f'<path class="trail" d="M404 150 C 450 110, 480 120, 500 170" stroke="{INK}" stroke-width="2.5" stroke-dasharray="6 7" fill="none"/>'
    b += f'<g class="bob">{icon("plane", 486, 158, 1.7, INK, 2.2)}</g>'
    return svg(b, 'Illustration : liste de prospects et cible atteinte')


def aut():
    path = 'M140 150 H400 V350 H660'
    b = f'<path d="{path}" stroke="{INK}" stroke-width="5" fill="none"/>'
    b += f'<path class="flowdash" d="{path}" stroke="{L}" stroke-width="5" stroke-dasharray="14 14" fill="none"/>'
    b += f'<circle r="12" fill="{L}" stroke="{INK}" stroke-width="3"><animateMotion dur="4.5s" repeatCount="indefinite" path="{path}"/></circle>'
    nodes = [(140, 150, W, 'form', 'Formulaire'), (400, 150, L, 'mail', 'Email'), (400, 350, W, 'bell', 'Notification'), (660, 350, INK, 'cal', 'Agenda')]
    for (cx, cy, f, ic, lab) in nodes:
        b += card(cx - 58, cy - 58, 116, 116, f, 10)
        b += icon(ic, cx - 26, cy - 26, 2.2, L if f == INK else INK, 1.6)
        b += txt(cx, cy + 92 if cy > 200 else cy - 76, lab, 18, INK, DISP, 'middle')
    b += f'<g class="spinr"><circle cx="680" cy="110" r="38" fill="none" stroke="{INK}" stroke-width="14" stroke-dasharray="10 8"/><circle cx="680" cy="110" r="26" fill="{L2}" stroke="{INK}" stroke-width="3"/><circle cx="680" cy="110" r="9" fill="{W}" stroke="{INK}" stroke-width="3"/></g>'
    b += f'<g class="spinr rev"><circle cx="740" cy="170" r="22" fill="none" stroke="{INK}" stroke-width="10" stroke-dasharray="7 6"/><circle cx="740" cy="170" r="12" fill="{L}" stroke="{INK}" stroke-width="3"/></g>'
    b += f'{card(28, 334, 244, 118, W, 8)}{txt(48, 372, "Aucune", 15)}{txt(48, 398, "action manuelle", 15)}{bar(48, 416, 130, 8, L)}'
    return svg(b, 'Illustration : formulaire, email, notification et agenda reliés automatiquement')


def car():
    tiles = [('SEO', W), ('CRM', L2), ('Chatbot', W), ('Maintenance', INK), ('Formulaires', W), ('IA', L), ('Emails', W), ('RDV', L2), (None, None)]
    b = ''
    for i, (lab, f) in enumerate(tiles):
        x, y = 60 + (i % 3) * 196, 40 + (i // 3) * 140
        if lab is None:
            b += f'<rect x="{x}" y="{y}" width="176" height="118" fill="none" stroke="{INK}" stroke-width="3" stroke-dasharray="10 9"/>'
            b += f'<path d="M{x+88} {y+44}v30M{x+73} {y+59}h30" stroke="{INK}" stroke-width="4"/>'
            continue
        b += card(x, y, 176, 118, f, 8)
        b += txt(x + 18, y + 74, lab, 22 if len(lab) < 10 else 19, W if f == INK else INK)
        b += rect(x + 18, y + 20, 22, 22, L if f != L else W, True, 0, ' stroke-width="2.5"')
    b += f'<path d="M700 330 C 690 400, 640 430, 600 400" stroke="{INK}" stroke-width="2.5" stroke-dasharray="6 7" fill="none"/>'
    sq = rect(658, 230, 22, 22, W, True, 0, ' stroke-width="2.5"')
    b += f'<g class="lift">{card(640, 210, 140, 110, L, 12)}{txt(658, 274, "Refonte", 21)}{sq}</g>'
    return svg(b, 'Illustration : prestations à la carte, à ajouter une par une')


ILLUS = {'ess': ess, 'prm': prm, 'grow': grow, 'pro': pro, 'aut': aut, 'car': car}
