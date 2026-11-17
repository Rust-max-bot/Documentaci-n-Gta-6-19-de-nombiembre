"""Dibuja la portada de la página (palmeras, hoteles y torres) y la escribe en web/index.html.

Rediseño de la portada (pedido de Bruno, 2026-11-17, rama rediseno/portada). Todo es dibujo
propio, hecho para este proyecto: los hoteles toman ideas generales del art déco, el
streamline y el "MiMo" de Miami Beach (coronas escalonadas, aletas, cornisas, ojos de buey,
celosías, toldos), pero ninguno copia un edificio real ni nada de los juegos de Rockstar. Los
letreros ("CORAL", "HOTEL", "MAR") son nombres inventados.

    python diseno/dibujar_portada.py      # reescribe el bloque entre las marcas de index.html

Escribe solo entre <!-- PORTADA:INICIO --> y <!-- PORTADA:FIN -->. Los colores salen de
variables CSS (web/estilos.css), así el mismo dibujo sirve para Miami 1986 y Miami 2026 y para
el día, el atardecer y la noche.

Escalas (las mismas de antes, para no mover nada de lugar):
  - #edificios: viewBox 0 0 1200 240, base de los hoteles en y=240.
  - #torres80 y #torres26: viewBox 0 0 1200 480, misma escala, base en y=480 (= y 240 de los hoteles).
  - Las torres nuevas suben en tres partes (x 0-440, 440-900, 900-1200): ningún dibujo de
    #torres26 puede cruzar x=440 ni x=900 (si no, sube partido en dos; fallo visto el 15 nov).
  - Palmeras: viewBox -60 0 260 420, base del tronco en (73, 420), que es el punto sobre el que se mecen.
"""
import math
import random
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
INDEX = RAIZ / "web" / "index.html"
INICIO, FIN = "<!-- PORTADA:INICIO -->", "<!-- PORTADA:FIN -->"


def n(v):
    s = f"{v:.1f}".rstrip("0").rstrip(".")
    if s in ("-0", ""):
        return "0"
    return s.replace("0.", ".", 1) if s.startswith(("0.", "-0.")) else s


def junta(nums):
    """Une números de un path sin espacios de más (el "-" y el "." de un decimal ya separan)."""
    sal = ""
    for v in nums:
        t = n(v)
        if sal and not (t[0] == "-" or (t[0] == "." and "." in sal.split()[-1].split("-")[-1].split("l")[-1])):
            sal += " "
        sal += t
    return sal


class Dibujo:
    """Junta las formas por capa (un solo <path> por color): menos peso y orden de pintado fijo."""

    def __init__(self, capas):
        # capas: lista de (nombre, atributos del path)
        self.orden = [c for c, _ in capas]
        self.attr = dict(capas)
        self.d = {c: [] for c in self.orden}
        self.extra = []          # textos y elementos sueltos, al final

    def p(self, capa, d):
        self.d[capa].append(d)

    def r(self, capa, x, y, w, h):
        if w > 0 and h > 0:
            self.p(capa, f"M{n(x)} {n(y)}h{n(w)}v{n(h)}h{n(-w)}z")

    def rr(self, capa, x, y, w, h, r):
        r = min(r, w / 2, h / 2)
        self.p(capa, f"M{n(x + r)} {n(y)}h{n(w - 2 * r)}a{n(r)} {n(r)} 0 0 1 {n(r)} {n(r)}v{n(h - 2 * r)}"
                     f"a{n(r)} {n(r)} 0 0 1 {n(-r)} {n(r)}h{n(-(w - 2 * r))}a{n(r)} {n(r)} 0 0 1 {n(-r)} {n(-r)}"
                     f"v{n(-(h - 2 * r))}a{n(r)} {n(r)} 0 0 1 {n(r)} {n(-r)}z")

    def c(self, capa, cx, cy, r):
        self.p(capa, f"M{n(cx - r)} {n(cy)}a{n(r)} {n(r)} 0 1 0 {n(2 * r)} 0a{n(r)} {n(r)} 0 1 0 {n(-2 * r)} 0z")

    def l(self, capa, x0, y0, x1, y1):
        if y0 == y1:
            self.p(capa, f"M{n(x0)} {n(y0)}H{n(x1)}")
        elif x0 == x1:
            self.p(capa, f"M{n(x0)} {n(y0)}V{n(y1)}")
        else:
            self.p(capa, f"M{n(x0)} {n(y0)}L{n(x1)} {n(y1)}")

    def poli(self, capa, pts):
        if len(pts) >= 3:
            pts = [(round(x, 1), round(y, 1)) for x, y in pts]
            rel = []
            for (xa, ya), (xb, yb) in zip(pts, pts[1:]):
                rel += [xb - xa, yb - ya]
            self.p(capa, f"M{n(pts[0][0])} {n(pts[0][1])}l" + junta(rel) + "z")

    def texto(self, x, y, t, tam, relleno, extra=""):
        self.extra.append(f'<text x="{n(x)}" y="{n(y)}" font-size="{n(tam)}" fill="{relleno}" '
                          f'text-anchor="middle" font-family="Rajdhani, Outfit, sans-serif" font-weight="700"{extra}>{t}</text>')

    def svg(self):
        partes = []
        for c in self.orden:
            if self.d[c]:
                partes.append(f'<path {self.attr[c]} d="{"".join(self.d[c])}"/>')
        return "".join(partes) + "".join(self.extra)


def recortar(pts, x0, y0, x1, y1):
    """Recorta un polígono a un rectángulo (Sutherland-Hodgman)."""
    def corte(pts, dentro, cruce):
        sal = []
        for i, a in enumerate(pts):
            b = pts[(i + 1) % len(pts)]
            if dentro(b):
                if not dentro(a):
                    sal.append(cruce(a, b))
                sal.append(b)
            elif dentro(a):
                sal.append(cruce(a, b))
        return sal

    def cx(x):
        return lambda a, b: (x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]))

    def cy(y):
        return lambda a, b: (a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y)

    for dentro, cruce in ((lambda p: p[0] >= x0, cx(x0)), (lambda p: p[0] <= x1, cx(x1)),
                          (lambda p: p[1] >= y0, cy(y0)), (lambda p: p[1] <= y1, cy(y1))):
        pts = corte(pts, dentro, cruce)
        if not pts:
            return []
    return pts


# ============================================================================================
# Palmeras
# ============================================================================================

def bezier(p0, p1, p2, p3, t):
    u = 1 - t
    return (u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0],
            u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1])


def unit(v):
    m = math.hypot(*v) or 1
    return (v[0] / m, v[1] / m)


def palmera(ident, inclinacion, hojas, semilla):
    """Tronco curvo con anillos que se afina hacia arriba y copa de hojas con folíolos.
    inclinacion: cuánto se corre la copa hacia la derecha (+) o la izquierda (-)."""
    rnd = random.Random(semilla)
    D = Dibujo([("sombra", 'fill="var(--palma-sombra)"'), ("cuerpo", ""),
                ("anillo", 'fill="none" stroke="var(--palma-anillo)" stroke-width="1.3" stroke-linecap="round"'),
                ("nervio", 'fill="none" stroke="var(--palma-anillo)" stroke-width=".9" stroke-linecap="round"')])
    base = (73, 420)
    copa = (73 + inclinacion, 126)
    c1 = (73 + inclinacion * 0.02, 330)
    c2 = (73 + inclinacion * 0.55, 210)
    # Sombra en la arena: suave y simétrica (las tres palmeras la tienen igual).
    D.p("sombra", f"M{n(73 - 52)} 421a52 5.5 0 1 0 104 0a52 5.5 0 1 0 -104 0z")
    izq, der = [], []
    N = 30
    for i in range(N + 1):
        t = i / N
        P = bezier(base, c1, c2, copa, t)
        P2 = bezier(base, c1, c2, copa, min(1, t + 0.01))
        P1 = bezier(base, c1, c2, copa, max(0, t - 0.01))
        T = unit((P2[0] - P1[0], P2[1] - P1[1]))
        Nn = (-T[1], T[0])
        w = 21 - 10.5 * t + 7 * max(0, 1 - t / 0.07) ** 2     # se ensancha al pie
        izq.append((P[0] + Nn[0] * w / 2, P[1] + Nn[1] * w / 2))
        der.append((P[0] - Nn[0] * w / 2, P[1] - Nn[1] * w / 2))
    D.poli("cuerpo", izq + der[::-1])
    # Anillos del tronco: arcos cortos, más juntos arriba.
    t = 0.06
    while t < 0.94:
        i = int(t * N)
        a, b = izq[i], der[i]
        m = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 2.2)
        D.p("anillo", f"M{n(a[0] + (b[0] - a[0]) * .12)} {n(a[1] + (b[1] - a[1]) * .12)}"
                      f"Q{n(m[0])} {n(m[1])} {n(b[0] - (b[0] - a[0]) * .12)} {n(b[1] - (b[1] - a[1]) * .12)}")
        t += 0.05 - 0.018 * t
    C = (copa[0], copa[1] - 2)
    # Hojas: (ángulo en grados, 0 = derecha, 90 = arriba; largo; caída; ancho de folíolos)
    for ang, largo, caida, ancho in hojas:
        a = math.radians(ang + rnd.uniform(-3, 3))
        d = (math.cos(a), -math.sin(a))
        L = largo * rnd.uniform(.94, 1.06)
        Q = (C[0] + d[0] * L * .55, C[1] + d[1] * L * .55 - L * .05)
        E = (C[0] + d[0] * L, C[1] + d[1] * L + caida * L)
        # Silueta de la hoja: borde de arriba casi liso (folíolos cortos) y, abajo, un peine de
        # folíolos largos que cuelgan hacia la punta, como una cortina.
        arriba, abajo = [], []
        M = 28
        for k in range(M + 1):
            s = k / M
            S = ((1 - s) ** 2 * C[0] + 2 * (1 - s) * s * Q[0] + s * s * E[0],
                 (1 - s) ** 2 * C[1] + 2 * (1 - s) * s * Q[1] + s * s * E[1])
            Tn = unit((2 * (1 - s) * (Q[0] - C[0]) + 2 * s * (E[0] - Q[0]),
                       2 * (1 - s) * (Q[1] - C[1]) + 2 * s * (E[1] - Q[1])))
            nrm = (-Tn[1], Tn[0])
            if nrm[1] < 0:                       # la normal que mira hacia abajo
                nrm = (-nrm[0], -nrm[1])
            perfil = math.sin(math.pi * min(1, s * 1.1 + .02)) ** .7 * (1 - .3 * s)
            colg = unit((nrm[0] * .35 + Tn[0] * .55, nrm[1] * .35 + Tn[1] * .55 + .75))
            sube = unit((-nrm[0] * .5 + Tn[0] * .8, -nrm[1] * .5 + Tn[1] * .8))
            if k in (0, M):
                arriba.append(S); abajo.append(S); continue
            punta = k % 2 == 1
            fa = ancho * perfil * (.24 if punta else .07) + .8
            fb = ancho * perfil * (1.0 if punta else .16) + .8
            arriba.append((S[0] + sube[0] * fa, S[1] + sube[1] * fa))
            abajo.append((S[0] + colg[0] * fb, S[1] + colg[1] * fb))
        D.poli("cuerpo", arriba + abajo[::-1])
        D.p("nervio", f"M{n(C[0])} {n(C[1])}Q{n(Q[0])} {n(Q[1])} {n(E[0] - (E[0] - Q[0]) * .2)} {n(E[1] - (E[1] - Q[1]) * .2)}")
    # Cocos y base de la copa
    D.c("cuerpo", C[0], C[1] + 3, 9)
    for dx, dy in ((-6, 9), (2, 11), (8, 7)):
        D.c("cuerpo", C[0] + dx, C[1] + dy, 4.6)
    return (f'<symbol id="{ident}" viewBox="-60 0 260 420" preserveAspectRatio="xMidYMax meet">'
            + D.svg() + "</symbol>")


# Copa A: abierta y alta. Copa B: más caída, como si el viento la peinara. Copa C: chica.
# (ángulo, largo, caída, largo de los folíolos)
HOJAS_A = [(176, 120, .72, 22), (154, 124, .44, 23), (130, 98, .2, 18), (106, 72, .07, 13),
           (82, 78, .1, 14), (58, 108, .28, 20), (34, 126, .52, 23), (12, 118, .8, 21),
           (-18, 92, 1.02, 17), (200, 94, 1.05, 17), (-48, 64, 1.2, 12), (228, 60, 1.2, 11)]
HOJAS_B = [(182, 122, .8, 22), (160, 128, .5, 23), (136, 102, .24, 19), (112, 76, .08, 14),
           (88, 74, .06, 13), (64, 100, .22, 18), (40, 120, .46, 22), (16, 122, .74, 22),
           (-10, 100, .95, 18), (210, 84, .55, 16), (-40, 66, 1.2, 12), (236, 62, 1.2, 11)]
HOJAS_C = [(172, 106, .66, 20), (146, 104, .34, 20), (118, 80, .1, 14), (90, 70, .05, 12),
           (64, 96, .2, 17), (38, 112, .46, 20), (10, 106, .76, 19), (-24, 82, 1.05, 15), (204, 84, 1.0, 15)]


# ============================================================================================
# Hoteles (#edificios)
# ============================================================================================

CAPAS_HOTEL = [
    ("h1", 'fill="var(--h1)"'), ("h2", 'fill="var(--h2)"'), ("h3", 'fill="var(--h3)"'),
    ("h4", 'fill="var(--h4)"'), ("h5", 'fill="var(--h5)"'),
    ("sombra", 'fill="var(--hs)"'), ("luz", 'fill="var(--hl)"'),
    ("acento", 'fill="var(--acento)"'),
    ("vent", 'fill="var(--vent)"'), ("vluz", 'fill="var(--luz)"'), ("persiana", 'fill="var(--hs)"'),
    ("reflejo", 'fill="var(--reflejo)"'),
    ("trim", 'fill="var(--trim)"'),
    ("parteluz", 'fill="none" stroke="var(--trim)" stroke-width=".8" stroke-opacity=".75"'),
    ("trazo", 'fill="none" stroke="var(--trim)" stroke-width="1.2"'),
    ("trim2", 'fill="var(--trim2)"'),
    ("trazo2", 'fill="none" stroke="var(--trim2)" stroke-width="1.1" stroke-linejoin="round"'),
    ("franja", 'fill="var(--acento)"'),
    ("letrero", 'fill="var(--acento)"'),
    ("borde_letrero", 'fill="none" stroke="var(--trim2)" stroke-width="1.1"'),
    ("halo", 'fill="var(--farol-halo)"'), ("poste", 'fill="var(--poste)"'), ("farol", 'fill="var(--farol)"'),
]


class Hoteles:
    def __init__(self):
        self.D = Dibujo(CAPAS_HOTEL)

    def ventana(self, rnd, x, y, w, h, prob=.32, alfeizar=True):
        D = self.D
        encendida = rnd.random() < prob
        D.r("vluz" if encendida else "vent", x, y, w, h)
        if encendida and rnd.random() < .45:
            D.r("persiana", x, y, w, h * rnd.choice((.3, .45, .6)))
        if not encendida and w >= 5:
            D.poli("reflejo", [(x, y), (x + w * .5, y), (x, y + h * .62)])
        D.r("sombra", x, y, w, min(2, h * .16))
        if alfeizar:
            D.r("trim", x - .8, y + h, w + 1.6, 1.3)

    def cornisa(self, x, y, w, h=3, r=1.5):
        self.D.rr("trim", x, y, w, h, r)
        self.D.r("sombra", x + 2, y + h, w - 3, 2.4)

    def toldo(self, x, y, w, h=7, franja=4.5):
        D = self.D
        k = 0
        xx = x
        while xx < x + w - .1:
            ancho = min(franja, x + w - xx)
            D.r("trim" if k % 2 == 0 else "franja", xx, y, ancho, h)
            D.c("trim" if k % 2 == 0 else "franja", xx + ancho / 2, y + h, ancho / 2)
            xx += franja
            k += 1
        D.r("sombra", x + 1, y + h + franja / 2, w - 1, 2.6)

    def marquesina(self, x, y, w):
        D = self.D
        D.rr("trim", x, y, w, 3.2, 1.6)
        D.r("trim2", x + 2, y + 3.2, w - 4, 1)
        D.r("sombra", x + 3, y + 4.2, w - 6, 2.6)

    def baranda(self, x0, x1, y, alto=7):
        D = self.D
        D.l("parteluz", x0, y, x1, y)
        xx = x0 + 1.5
        while xx < x1:
            D.l("parteluz", xx, y, xx, y + alto)
            xx += 3

    def vidriera(self, rnd, x, y, w, h, paso=8):
        """Vidriera de planta baja: vidrio con montantes."""
        D = self.D
        D.r("vent", x, y, w, h)
        D.r("reflejo", x, y, w, h * .3)
        xx = x + paso
        while xx < x + w - 1:
            D.l("parteluz", xx, y, xx, y + h)
            xx += paso
        for _ in range(int(w // 18)):
            px = x + rnd.uniform(2, w - 8)
            D.r("vluz", px, y + h * .45, 5, h * .55)

    def puerta(self, x, y, w, h):
        D = self.D
        D.r("vent", x, y, w, h)
        D.l("parteluz", x + w / 2, y, x + w / 2, y + h)
        D.r("vluz", x + 1.2, y + h * .35, w / 2 - 2, h * .65)
        D.r("trim", x - 1.2, y - 1.4, w + 2.4, 1.4)

    def tubos(self, xs, y0, y1, ancho=1.6):
        for x in xs:
            self.D.r("trim2", x, y0, ancho, y1 - y0)

    def aguja(self, x, y0, y1, bola=2):
        self.D.r("trim", x - 1.4, y0, 2.8, y1 - y0)
        self.D.c("trim2", x, y0, bola)

    def farola(self, x):
        D = self.D
        D.c("halo", x, 203, 10)
        D.rr("poste", x - 2.4, 242.5, 4.8, 5, 1)
        D.r("poste", x - .8, 206, 1.6, 37)
        D.r("poste", x - 1.7, 224, 3.4, 1.6)
        D.r("poste", x - 1.3, 231, 2.6, 1.2)
        D.rr("farol", x - 2.7, 198.5, 5.4, 8.5, 2.6)
        D.rr("poste", x - 3.2, 196.6, 6.4, 2.2, .8)
        D.r("poste", x - .5, 193.5, 1, 3.2)

    # ---------------------------------------------------------------- hoteles uno por uno
    def brisa(self):
        """1. Streamline: esquinas redondeadas, tres cornisas corridas y ventanas en banda."""
        D, rnd = self.D, random.Random(11)
        x0, x1, top = 20, 140, 146
        D.r("h1", x0, top, x1 - x0, 240 - top)
        D.r("h1", 30, 139, 26, 7)                 # caseta en el techo
        D.r("trim", 30, 139, 26, 1.4)
        D.r("sombra", x0, top, 7, 240 - top)      # esquina curva en sombra (luz desde la derecha)
        D.r("sombra", x0 + 7, top, 3, 240 - top)
        D.r("luz", x1 - 6, top, 6, 240 - top)
        D.r("trim", x0, top, x1 - x0, 2.4)
        for y in (162, 184, 206):
            self.cornisa(x0 - 3, y, x1 - x0 + 6)
        for y, h in ((151, 8), (169, 11), (191, 11)):
            for a, b in ((26, 68), (92, 134)):
                xx = a
                while xx < b - .5:
                    w = min(7, b - xx)
                    lit = rnd.random() < .3
                    D.r("vluz" if lit else "vent", xx, y, w, h)
                    xx += 7
                D.r("reflejo", a, y, b - a, h * .32)
                D.r("sombra", a, y, b - a, 1.6)
                xx = a + 7
                while xx < b - .5:
                    D.l("parteluz", xx, y, xx, y + h)
                    xx += 7
        # torre central escalonada
        D.r("acento", 70, 112, 20, 128)
        D.r("acento", 73, 104, 14, 8)
        D.r("acento", 76, 98, 8, 6)
        D.r("trim", 70, 112, 20, 1.4); D.r("trim", 73, 104, 14, 1.2); D.r("trim", 76, 98, 8, 1.1)
        D.r("sombra", 70, 112, 4, 128)
        self.aguja(80, 80, 98)
        self.tubos((74.4, 79.2, 84), 117, 200)
        # planta baja
        D.r("acento", 22, 212, 116, 26)
        self.vidriera(rnd, 26, 216, 42, 19)
        self.vidriera(rnd, 92, 216, 42, 19)
        self.puerta(74, 220, 12, 18)
        self.marquesina(60, 212.5, 40)

    def coral(self):
        """2. Vertical: pilastras, corona en zigurat y letrero de bandera "CORAL"."""
        D, rnd = self.D, random.Random(22)
        x0, x1, top = 150, 240, 110
        D.r("h2", x0, top, x1 - x0, 240 - top)
        for (a, b, y0, y1) in ((158, 232, 103, 110), (168, 222, 96, 103), (180, 210, 90, 96)):
            D.r("h2", a, y0, b - a, y1 - y0)
            D.r("trim", a, y0, b - a, 1.5)
            D.r("luz", b - 3, y0, 3, y1 - y0)
        D.r("trim", x0, top, x1 - x0, 2)
        self.aguja(195, 74, 90)
        D.r("sombra", x0, top, 3, 240 - top)
        bahia = 17.5
        for i in range(5):
            px = x0 + i * (bahia + 4)
            D.r("luz", px, top + 2, 4, 210 - top)
            D.r("sombra", px + 3.2, top + 2, .8, 210 - top)
        for i in range(4):
            bx = x0 + 4 + i * (bahia + 4)
            for y in (118, 138, 158, 178, 196):
                self.ventana(rnd, bx + 3.25, y, 11, 12.5)
                if y < 190:
                    D.p("parteluz", f"M{n(bx + 3)} {n(y + 15.5)}L{n(bx + bahia / 2)} {n(y + 18)}L{n(bx + bahia - 3)} {n(y + 15.5)}")
        D.r("acento", 152, 213, 86, 25)
        self.vidriera(rnd, 158, 218, 24, 16)
        self.vidriera(rnd, 208, 218, 26, 16)
        self.puerta(187, 220, 16, 18)
        self.marquesina(180, 213, 30)
        # letrero de bandera, saliendo de la fachada
        D.l("trazo", 156, 124, 160, 124); D.l("trazo", 156, 176, 160, 176)
        D.rr("letrero", 144.5, 113, 13.5, 72, 2.2)
        D.p("letrero", "M144.5 116a6.75 6.75 0 0 1 13.5 0z")
        D.rr("borde_letrero", 146, 116, 10.5, 66, 1.4)
        for k, letra in enumerate("CORAL"):
            D.texto(151.25, 128 + k * 12.6, letra, 10.5, "var(--trim2)")

    def sol(self):
        """3. MiMo: losa volada, celosía de bloques calados, balcones y sol rayado."""
        D, rnd = self.D, random.Random(33)
        x0, x1, top = 250, 400, 160
        D.r("h3", x0, top, x1 - x0, 240 - top)
        D.r("trim", 244, 154, 162, 6)
        D.r("sombra", 246, 160, 158, 3.4)
        D.r("luz", x1 - 5, top, 5, 240 - top)
        # celosía
        D.r("luz", 256, 167, 50, 41)
        for cy in range(170, 207, 6):
            for cx in range(259, 305, 6):
                D.poli("sombra", [(cx, cy - 2.3), (cx + 2.3, cy), (cx, cy + 2.3), (cx - 2.3, cy)])
        D.r("sombra", 256, 167, 50, 1.6)
        # balcones
        for y in (168, 192):
            for x in (346, 358, 370, 382):
                self.ventana(rnd, x, y, 10, 16, alfeizar=False)
            D.r("trim", 342, y + 16, 56, 2.6)
            D.r("sombra", 344, y + 18.6, 52, 2.4)
            self.baranda(343, 397, y + 9, 7)
        # torre con el sol rayado
        D.r("acento", 313, 124, 24, 116)
        D.r("acento", 317, 118, 16, 6)
        D.r("trim", 313, 124, 24, 1.3); D.r("trim", 317, 118, 16, 1.2)
        D.r("sombra", 313, 124, 4, 116)
        D.c("trim2", 325, 140, 8.5)
        for y, h in ((139.5, 1.2), (142.6, 1.5), (145.8, 1.9)):
            D.r("franja", 315, y, 20, h)
        D.r("franja", 315, 148.5, 20, 2)
        self.vidriera(rnd, 320.5, 158, 9, 48, paso=6)
        D.r("acento", 252, 222, 146, 16)
        self.toldo(254, 213, 54)
        self.toldo(342, 213, 54)
        self.vidriera(rnd, 257, 226, 48, 11)
        self.vidriera(rnd, 345, 226, 48, 11)
        self.puerta(318, 222, 14, 16)

    def marea(self):
        """4. El más alto: rascacielos déco con retranqueos, aleta central y frisos en zigzag."""
        D, rnd = self.D, random.Random(44)
        x0, x1, top = 412, 516, 94
        D.r("h4", x0, top, x1 - x0, 240 - top)
        for (a, b, y0, y1) in ((422, 506, 86, 94), (434, 494, 79, 86)):
            D.r("h4", a, y0, b - a, y1 - y0)
            D.r("trim", a, y0, b - a, 1.5)
            D.r("luz", b - 3, y0, 3, y1 - y0)
        D.r("trim", x0, top, x1 - x0, 2)
        D.r("sombra", x0, top, 3.5, 240 - top)
        D.r("luz", x1 - 3.5, top, 3.5, 240 - top)
        for wx0, wx1 in ((414, 454), (474, 514)):
            zz = "M" + " L".join(f"{n(wx0 + 2 + i * 4)} {98.5 if i % 2 else 102}" for i in range(10))
            D.p("parteluz", zz)
            for col in range(3):
                x = wx0 + 4 + col * 12.5
                for k in range(7):
                    y = 106 + k * 15
                    self.ventana(rnd, x, y, 7, 10)
                    if k < 6:
                        D.r("sombra", x, y + 11.5, 7, 2.5)
        D.r("acento", 456, 58, 16, 182)
        D.r("acento", 458, 53, 12, 5)
        D.r("trim", 456, 58, 16, 1.3)
        D.r("sombra", 456, 58, 3, 182)
        self.aguja(464, 36, 53, 2.2)
        self.tubos((459.2, 463.2, 467.2), 64, 208)
        D.r("acento", 414, 212, 100, 26)
        self.vidriera(rnd, 418, 217, 30, 18)
        self.vidriera(rnd, 480, 217, 30, 18)
        self.puerta(453, 219, 22, 19)
        self.marquesina(434, 209.5, 60)

    def arcos(self):
        """5. Loggia de arcos abajo, ventanas con cejas y aleta-mástil con banderín."""
        D, rnd = self.D, random.Random(55)
        x0, x1, top = 528, 656, 144
        D.r("h5", x0, top, x1 - x0, 240 - top)
        for (a, b, y0, y1) in ((546, 638, 135, 144), (566, 618, 127, 135)):
            D.r("h5", a, y0, b - a, y1 - y0)
            D.r("trim", a, y0, b - a, 1.5)
            D.r("luz", b - 3, y0, 3, y1 - y0)
        D.p("parteluz", "M580 133L592 129L604 133")
        D.r("trim", x0, top, x1 - x0, 2)
        D.r("sombra", x0, top, 3, 240 - top)
        D.r("luz", x1 - 3.5, top, 3.5, 240 - top)
        for y in (154, 174, 194):
            for x in (551, 567, 583, 600, 616, 632):
                self.ventana(rnd, x, y, 11, 12)
                D.rr("trim", x - 2, y - 3.4, 15, 2.2, 1)
                D.r("sombra", x - .5, y - 1.2, 12, 1.6)
        D.r("acento", 538, 104, 7, 86)
        D.r("trim2", 540.3, 109, 2.4, 77)
        D.r("trim", 537, 104, 9, 1.3)
        D.r("trim", 540.8, 92, 1.4, 12)
        D.poli("trim2", [(542.2, 92.5), (553, 95.5), (542.2, 98.5)])
        D.r("acento", 530, 211, 124, 27)
        D.r("trim", 530, 211, 124, 1.4)
        for i in range(6):
            ax = 535 + i * 20
            lit = rnd.random() < .5
            D.p("vluz" if lit else "vent", f"M{ax} 238V222a8 8 0 0 1 16 0V238z")
            D.p("trazo", f"M{ax - 1} 238V222a9 9 0 0 1 18 0V238")
        D.r("sombra", 530, 212.4, 124, 2)

    def ojos(self):
        """6. Simétrico: torre central, ojos de buey y balcones curvos en las esquinas."""
        D, rnd = self.D, random.Random(66)
        x0, x1, top = 668, 780, 120
        D.r("h1", x0, top, x1 - x0, 240 - top)
        for (a, b, y0, y1) in ((684, 764, 111, 120), (698, 750, 103, 111)):
            D.r("h1", a, y0, b - a, y1 - y0)
            D.r("trim", a, y0, b - a, 1.5)
            D.r("luz", b - 3, y0, 3, y1 - y0)
        D.r("trim", x0, top, x1 - x0, 2)
        D.r("sombra", x0, top, 3, 240 - top)
        D.r("luz", x1 - 3.5, top, 3.5, 240 - top)
        for cx in (679, 691, 703, 745, 757, 769):
            D.c("vent", cx, 129, 3.4)
            D.c("trazo", cx, 129, 3.4)
            D.p("reflejo", f"M{n(cx - 2.6)} 128.4a2.6 2.6 0 0 1 2.6 -2.6v2.6z")
        for y in (141, 163, 185):
            for x in (674, 694, 739, 759):
                self.ventana(rnd, x, y, 15, 14)
            for xa, lado in ((664, -1), (776, 1)):
                if lado < 0:
                    D.p("trim", f"M676 {y + 16}v3h-9a1.5 1.5 0 0 1 0 -3z")
                else:
                    D.p("trim", f"M772 {y + 16}v3h9a1.5 1.5 0 0 0 0 -3z")
            D.r("sombra", 667, y + 19, 9, 2.2); D.r("sombra", 773, y + 19, 9, 2.2)
        D.r("acento", 715, 84, 18, 156)
        D.r("acento", 718, 80, 12, 4)
        D.r("trim", 715, 84, 18, 1.3)
        D.r("sombra", 715, 84, 3, 156)
        self.aguja(724, 62, 80)
        self.tubos((718.6, 723.2, 727.8), 90, 208)
        D.r("acento", 670, 212, 108, 26)
        self.vidriera(rnd, 674, 217, 36, 18)
        self.vidriera(rnd, 738, 217, 36, 18)
        self.puerta(716, 219, 16, 19)
        self.marquesina(700, 210, 48)

    def hotel(self):
        """7. Streamline horizontal: tres líneas de carrera, columna de bloques de vidrio y letrero "HOTEL"."""
        D, rnd = self.D, random.Random(77)
        x0, x1, top = 792, 932, 156
        D.r("h2", x0, top, x1 - x0, 240 - top)
        D.r("h2", 900, 149, 26, 7); D.r("trim", 900, 149, 26, 1.3)
        D.r("trim", x0, top, 851 - x0, 2); D.r("trim", 873, top, x1 - 873, 2)    # remate del techo: sin cruzar la aleta del letrero
        D.r("luz", x1 - 4, top, 4, 240 - top)
        # columna de bloques de vidrio en la esquina curva
        D.r("sombra", x0, top + 2, 15, 210 - top - 2)
        for row in range(13):
            for col in range(4):
                D.r("vluz", x0 + 1 + col * 3.4, 161 + row * 3.6, 2.6, 2.8)
        D.r("reflejo", x0, 160, 4, 48)
        for y, h in ((165, 13), (196, 11)):
            for a, b in ((812, 849), (876, 926)):
                xx = a
                while xx < b - .5:
                    lit = rnd.random() < .3
                    D.r("vluz" if lit else "vent", xx, y, min(7.4, b - xx), h)
                    xx += 7.4
                D.r("reflejo", a, y, b - a, h * .3)
                D.r("sombra", a, y, b - a, 1.6)
                D.r("trim", a - 1, y + h, b - a + 2, 1.3)
                xx = a + 7.4
                while xx < b - .5:
                    D.l("parteluz", xx, y, xx, y + h)
                    xx += 7.4
        for y in (184.5, 187.8, 191.1):
            D.r("trim2", 808, y, 43, 1.3)
            D.r("trim2", 873, y, 57, 1.3)
        # aleta con el letrero
        D.r("acento", 851, 122, 22, 118)
        D.r("acento", 854, 116, 16, 6); D.r("acento", 858, 111, 8, 5)
        D.r("trim", 851, 122, 22, 1.3); D.r("trim", 854, 116, 16, 1.1)
        self.aguja(862, 98, 111)
        D.rr("borde_letrero", 853.5, 127, 17, 76, 2)
        for k, letra in enumerate("HOTEL"):
            D.texto(862, 141 + k * 14, letra, 12.5, "var(--trim2)")
        D.r("acento", x0, 213, x1 - x0 - 4, 27)     # planta baja del mismo ancho que los pisos (la franja de luz queda a la derecha)
        self.vidriera(rnd, 846, 218, 30, 16)
        self.vidriera(rnd, 884, 218, 42, 16)
        self.puerta(814, 219, 18, 19)
        # marquesina pegada al dintel de la puerta; su sombra va en "persiana" (la capa "sombra" queda tapada por la planta baja)
        D.rr("trim", 808, 214.2, 30, 3.4, 1.6); D.r("persiana", 810, 217.6, 26, 2.6)

    def mar(self):
        """8. MiMo con balcones corridos en cada piso y letrero "MAR" sobre el techo."""
        D, rnd = self.D, random.Random(88)
        x0, x1, top = 944, 1040, 100
        D.r("h3", x0, top, x1 - x0, 240 - top)
        D.r("trim", x0, top, x1 - x0, 2)
        D.r("luz", x1 - 3.5, top, 3.5, 240 - top)
        D.r("sombra", x0, top, 3, 240 - top)
        # letrero del techo sobre su armazón
        D.l("trazo", 981, 84, 981, 100); D.l("trazo", 1021, 84, 1021, 100); D.l("trazo", 981, 92, 1021, 100)
        D.rr("letrero", 979, 68, 44, 17, 2.5)
        D.rr("borde_letrero", 980.6, 69.6, 40.8, 13.8, 1.6)
        D.texto(1002.5, 81, "MAR", 13, "var(--trim2)", ' letter-spacing="3"')
        for k in range(5):
            y = 106 + k * 22
            for x in (962, 977, 992, 1007, 1022):
                self.ventana(rnd, x, y + 1, 12, 15, alfeizar=False)
            D.r("trim", 958, y + 16.5, 84, 2.6)
            D.r("sombra", 960, y + 19.1, 80, 2.6)
            self.baranda(959, 1041, y + 10, 6.5)
        D.r("acento", 951, 62, 7, 140)
        D.r("trim", 950, 62, 9, 1.3)
        D.r("trim2", 953.3, 67, 2.4, 130)
        self.aguja(954.5, 50, 62, 1.8)
        D.r("acento", 946, 220, 92, 18)
        self.toldo(960, 213, 72)
        self.vidriera(rnd, 962, 226, 26, 11)
        self.vidriera(rnd, 1008, 226, 26, 11)
        self.puerta(991, 223, 14, 15)

    def zigzag(self):
        """9. Alas simétricas, friso en zigzag de neón y torre central con vitral vertical."""
        D, rnd = self.D, random.Random(99)
        x0, x1, top = 1050, 1184, 140
        D.r("h4", x0, top, x1 - x0, 240 - top)
        for (a, b, y0, y1) in ((1069, 1165, 131, 140), (1088, 1146, 123, 131)):
            D.r("h4", a, y0, b - a, y1 - y0)
            D.r("trim", a, y0, b - a, 1.5)
            D.r("luz", b - 3, y0, 3, y1 - y0)
        D.r("trim", x0, top, x1 - x0, 2)
        D.r("sombra", x0, top, 3, 240 - top)
        D.r("luz", x1 - 3.5, top, 3.5, 240 - top)
        for a, b in ((1053, 1104), (1129, 1181)):
            pts = []
            x = a
            k = 0
            while x <= b:
                pts.append(f"{n(x)} {144.5 if k % 2 == 0 else 149}")
                x += 4.25
                k += 1
            D.p("trazo2", "M" + " L".join(pts))
        for y in (155, 178, 200):
            for x in (1058, 1081, 1134, 1157):
                self.ventana(rnd, x, y, 17, 13)
                D.rr("trim", x - 2, y - 3.2, 21, 2.2, 1)
        D.r("acento", 1106, 104, 22, 136)
        D.r("acento", 1109, 98, 16, 6)
        D.r("trim", 1106, 104, 22, 1.3); D.r("trim", 1109, 98, 16, 1.2)
        D.r("sombra", 1106, 104, 3.5, 136)
        self.aguja(1117, 82, 98)
        self.vidriera(rnd, 1112, 112, 10, 86, paso=7)
        self.tubos((1108.6, 1123.8), 110, 206, 1.4)
        D.r("acento", 1052, 214, 130, 24)
        self.vidriera(rnd, 1058, 219, 40, 16)
        self.vidriera(rnd, 1136, 219, 40, 16)
        self.puerta(1109, 220, 16, 18)
        self.marquesina(1095, 211, 44)

    def todo(self):
        for f in (self.brisa, self.coral, self.sol, self.marea, self.arcos, self.ojos, self.hotel, self.mar, self.zigzag):
            f()
        self.D.r("trim", 0, 238, 1200, 2)         # borde de la vereda, de punta a punta
        for x in (8, 145, 245, 406, 522, 662, 786, 938, 1045, 1192):
            self.farola(x)
        return ('<symbol id="edificios" viewBox="0 0 1200 240" preserveAspectRatio="xMidYMax slice">'
                + self.D.svg() + "</symbol>")


# ============================================================================================
# Torres
# ============================================================================================

CAPAS_TORRE = [
    ("lejos", 'fill="var(--torre-lejos)"'),
    ("cuerpo", 'fill="var(--torre)"'), ("sombra", 'fill="var(--torre-sombra)"'),
    ("brillo", 'fill="var(--torre-brillo)"'),
    ("mull", 'fill="none" stroke="var(--torre-linea)" stroke-width=".5" stroke-opacity=".6"'),
    ("linea", 'fill="none" stroke="var(--torre-linea)" stroke-width="1"'),
    ("luz", 'fill="var(--torre-luz)"'),
    ("blanco", 'fill="var(--torre-blanco)"'),
    ("blanco_t", 'fill="none" stroke="var(--torre-blanco)" stroke-width="1.6"'),
    ("exo", 'fill="none" stroke="var(--torre-exo)" stroke-width="2.4" stroke-linecap="round"'),
    ("verde2", 'fill="var(--verde2)"'), ("verde1", 'fill="var(--verde1)"'),
    ("grua", 'fill="var(--grua)"'),
    ("grua_t", 'fill="none" stroke="var(--grua)" stroke-width=".9"'),
    ("aviso", 'fill="var(--aviso)"'),
]


def vidrio(D, rnd, x, y, w, h, piso=9, mull=5.5, sombra=.36, brillo=True, luces=.1, lineas=True):
    D.r("cuerpo", x, y, w, h)
    D.r("sombra", x + w * (1 - sombra), y, w * sombra, h)
    if brillo:
        a = x + w * rnd.uniform(.05, .3)
        bw = w * .22
        k = .32
        pts = [(a - (h * k), y + h), (a, y), (a + bw, y), (a + bw - h * k, y + h)]
        D.poli("brillo", recortar(pts, x, y, x + w * (1 - sombra), y + h))
    if lineas:
        yy = y + piso
        while yy < y + h - .5:
            D.l("linea", x, yy, x + w, yy)
            yy += piso
        xx = x + mull
        while xx < x + w - .5:
            D.l("mull", xx, y, xx, y + h)
            xx += mull
    yy = y + 3
    while yy < y + h - 4:
        xx = x + 1.5
        while xx < x + w - 3:
            if rnd.random() < luces:
                D.r("luz", xx, yy, mull - 2, piso - 4.5)
            xx += mull
        yy += piso


def antena(D, x, y0, y1):
    D.r("grua", x - .6, y0, 1.2, y1 - y0)
    D.c("aviso", x, y0, 1.9)


def torres26():
    rnd = random.Random(2026)
    partes = []

    def nueva():
        return Dibujo(CAPAS_TORRE)

    # ---------- parte izquierda (x 0-440) ----------
    D = nueva()
    D.r("lejos", 132, 318, 34, 162); D.r("lejos", 140, 308, 18, 10)
    D.r("lejos", 410, 328, 26, 152)
    antena(D, 149, 292, 308)
    partes.append(D.svg())

    D = nueva()      # cubos apilados en zigzag, con jardineras
    offs = [60, 66, 72, 76, 70, 64, 58]
    for i, ox in enumerate(offs):
        y = 270 + i * 30
        vidrio(D, rnd, ox, y, 52, 30, piso=10, mull=6.5, brillo=False, luces=.12)
        D.r("blanco", ox - 2, y + 27.4, 56, 2.6)
        if i % 2 == 0:
            for k in range(7):
                D.c("verde1" if k % 2 else "verde2", ox + 3 + k * 7.6, y + 26.4, 2.6)
        sobre = offs[i - 1] if i else None
        if sobre is not None:
            a, b = max(sobre, ox), min(sobre + 52, ox + 52)
            D.r("sombra", a, y, b - a, 3)
    D.l("blanco_t", 62, 262, 110, 262); D.l("blanco_t", 64, 262, 64, 270); D.l("blanco_t", 108, 262, 108, 270)
    partes.append(D.svg())

    D = nueva()      # torre fina de techo en bisel
    D.p("cuerpo", "M258 480V292L304 270V480z")
    D.p("sombra", "M287 480V280L304 270V480z")
    D.poli("brillo", recortar([(262, 480), (262, 300), (272, 295), (272, 480)], 258, 290, 287, 480))
    for y in range(300, 480, 9):
        D.l("linea", 258, y, 304, y)
    for x in (265, 272, 279, 286, 293, 300):
        D.l("mull", x, 270 + (304 - x) * 22 / 46 + 1, x, 480)
    for _ in range(14):
        D.r("luz", rnd.choice((260, 267, 274, 281, 289, 296)), rnd.randrange(303, 470, 9), 4, 4.5)
    D.l("blanco_t", 258, 292, 304, 270)
    partes.append(D.svg())

    D = nueva()      # la vela: vidrio curvo con espina blanca
    D.p("cuerpo", "M330 480V230Q332 220 344 222Q404 248 400 340V480z")
    D.extra.append('<g clip-path="url(#recorte-vela)">')
    D2 = nueva()
    D2.r("sombra", 376, 220, 30, 260)
    D2.poli("brillo", [(338, 480), (338, 226), (350, 228), (350, 480)])
    D2.poli("brillo", [(360, 480), (360, 236), (364, 238), (364, 480)])
    for y in range(234, 480, 8):
        D2.l("linea", 330, y, 404, y)
    for x in range(336, 404, 6):
        D2.l("mull", x, 220, x, 480)
    for _ in range(18):
        D2.r("luz", rnd.randrange(334, 396, 6), rnd.randrange(240, 470, 8), 3.6, 3.6)
    D.extra.append(D2.svg() + "</g>")
    D3 = nueva()
    D3.p("blanco_t", "M331.5 480V231Q333 222.5 344 224Q401 248 398.5 340")
    partes.append(D.svg() + D3.svg())

    # ---------- parte central (x 440-900) ----------
    D = nueva()      # torre fina con farol en la punta
    vidrio(D, rnd, 470, 300, 40, 180, piso=9, mull=5, luces=.12)
    D.r("cuerpo", 476, 290, 28, 10); D.r("sombra", 494, 290, 10, 10)
    D.r("luz", 479, 292, 22, 5)
    D.r("blanco", 468, 298, 44, 2.4)
    antena(D, 490, 268, 290)
    D.r("lejos", 444, 336, 22, 144)
    partes.append(D.svg())

    D = nueva()      # terrazas verdes escalonadas
    vidrio(D, rnd, 560, 322, 80, 158, piso=14, mull=8, brillo=False, luces=.08)
    for y in range(333, 480, 14):
        D.r("blanco", 557, y, 86, 2.4)
        for k in range(9):
            D.rr("verde2" if k % 2 else "verde1", 560 + k * 9, y - 5.6, 8, 5.6, 2.8)
    for (a, b, y0) in ((572, 628, 304), (584, 616, 288)):
        D.r("cuerpo", a, y0, b - a, 322 - y0 if y0 == 304 else 16)
        D.r("sombra", b - (b - a) * .36, y0, (b - a) * .36, 18)
        D.r("blanco", a - 3, y0 + 16, b - a + 6, 2.2)
    for cx, cy, r in ((576, 300, 5), (588, 298, 6.5), (612, 299, 5.5), (624, 301, 4.5), (592, 284, 5), (606, 283, 6)):
        D.c("verde2", cx, cy, r); D.c("verde1", cx - r * .3, cy - r * .3, r * .6)
    partes.append(D.svg())

    D = nueva()      # torre de lamas verticales
    vidrio(D, rnd, 660, 314, 42, 166, piso=10, mull=4.2, luces=.08)
    D.r("blanco", 656, 310, 50, 4)
    D.r("sombra", 658, 314, 46, 2)
    partes.append(D.svg())

    D = nueva()      # cubos en obra con grúa
    cubos = [(762, 454), (767, 428), (758, 402), (768, 376), (759, 350), (769, 324), (757, 298)]
    for x, y in cubos:
        vidrio(D, rnd, x, y, 54, 26, piso=13, mull=6.75, brillo=False, luces=.1)
        D.r("blanco", x, y, 54, 1.8)
    for x in (771, 796.5, 822):
        D.r("sombra", x, 272, 3, 26)
    D.r("sombra", 771, 272, 54, 2); D.r("sombra", 771, 285, 54, 2)
    D.p("grua_t", "M774 274L798 285M798 274L822 285")
    # grúa: torre de celosía, pluma, contrapeso, cable y gancho
    D.r("grua", 791.5, 222, 1.2, 50); D.r("grua", 797, 222, 1.2, 50)
    D.p("grua_t", "M792 226L798 232L792 238L798 244L792 250L798 256L792 262L798 268")
    D.r("grua", 788, 224, 14, 5)
    D.r("grua", 744, 229, 116, 2.6)
    D.r("grua", 744, 233.6, 116, 1)
    D.p("grua_t", "M748 229.4L754 233.8L760 229.4L766 233.8L772 229.4L778 233.8L784 229.4M806 229.4L812 233.8L818 229.4L824 233.8"
                  "L830 229.4L836 233.8L842 229.4L848 233.8L854 229.4L860 233.8")
    D.poli("grua", [(792.5, 222), (795, 210), (797.6, 222)])
    D.l("grua_t", 795, 210, 750, 229); D.l("grua_t", 795, 210, 858, 229)
    D.r("grua", 744, 234, 13, 8)
    D.r("grua", 842, 232, 6, 3)
    D.l("grua_t", 845, 235, 845, 262)
    D.p("grua", "M842.5 262h5v3.2h-1.6v2.6a2 2 0 1 1 -2.5 -1.5z")
    D.c("aviso", 795, 209, 1.8)
    D.r("lejos", 848, 336, 34, 144); D.r("lejos", 856, 326, 18, 10)
    partes.append(D.svg())

    # ---------- parte derecha (x 900-1200) ----------
    D = nueva()      # torre con estructura curva por fuera (diagrid)
    vidrio(D, rnd, 945, 262, 60, 218, piso=8, mull=6, luces=.1)
    for k in range(4):
        dx = 6 + k * 7
        D.p("exo", f"M{945 + dx * .2} 480Q{975 + 24 - dx} 410 975 360Q{951 + dx} 310 {945 + dx * .2} 262")
        D.p("exo", f"M{1005 - dx * .2} 480Q{975 - 24 + dx} 410 975 360Q{999 - dx} 310 {1005 - dx * .2} 262")
    D.r("blanco", 945, 262, 3, 218); D.r("blanco", 1002, 262, 3, 218)
    D.r("blanco", 943, 259, 64, 3.4)
    D.r("cuerpo", 958, 248, 34, 11); D.r("sombra", 980, 248, 12, 11)
    antena(D, 966, 230, 248)
    D.r("lejos", 908, 340, 30, 140)
    partes.append(D.svg())

    D = nueva()      # torre torcida: cada piso corrido un poco
    for i in range(18):
        y = 300 + i * 10
        dx = 6 * math.sin(i * .42)
        x = 1040 + dx
        D.r("cuerpo", x, y, 44, 10)
        D.r("sombra", x + 44 * .62, y, 44 * .38, 10)
        D.r("blanco", x - 1, y, 46, 1.6)
        for k in range(6):
            if rnd.random() < .14:
                D.r("luz", x + 2 + k * 6.5, y + 3.5, 4, 4)
    D.poli("brillo", [(1044, 480), (1050, 300), (1056, 300), (1050, 480)])
    D.r("blanco", 1036, 296, 52, 4)
    antena(D, 1062, 276, 296)
    partes.append(D.svg())

    D = nueva()      # balcones ondulados
    vidrio(D, rnd, 1110, 270, 62, 210, piso=10, mull=6.2, luces=.1, lineas=False)
    for i in range(21):
        y = 276 + i * 10
        a = 1106 + 4.5 * math.sin(i * .55)
        b = 1176 + 4.5 * math.sin(i * .55 + 1.4)
        D.p("blanco", f"M{n(a)} {y}H{n(b)}v2.6H{n(a)}z")
        D.r("sombra", max(a, 1110), y + 2.6, min(b, 1172) - max(a, 1110), 1.6)
    D.r("blanco", 1104, 266, 74, 4)
    D.p("verde1", "M1114 266a4 4 0 0 1 8 0zM1130 266a5 5 0 0 1 10 0zM1156 266a4.5 4.5 0 0 1 9 0z")
    partes.append(D.svg())

    clip = ('<clipPath id="recorte-vela"><path d="M330 480V230Q332 220 344 222Q404 248 400 340V480z"/></clipPath>')
    return clip, ('<symbol id="torres26" viewBox="0 0 1200 480" preserveAspectRatio="xMidYMax slice">'
                  + "".join(partes) + "</symbol>")


CAPAS_T80 = [
    ("cuerpo", 'fill="var(--t80-cuerpo)"'), ("sombra", 'fill="var(--t80-sombra)"'),
    ("acento", 'fill="var(--t80-acento)"'),
    ("linea", 'fill="none" stroke="var(--t80-linea)" stroke-width=".9"'),
    ("ventana", 'fill="var(--t80-ventana)"'), ("borde", 'fill="var(--t80-borde)"'),
    ("luz1", 'fill="var(--t80-luz1)"'), ("luz2", 'fill="var(--t80-luz2)"'), ("luz3", 'fill="var(--t80-luz3)"'),
    ("franja", 'fill="var(--t80-franja)"'), ("palma", 'fill="var(--t80-palma)"'),
    ("aviso", 'fill="var(--aviso)"'),
]


def torres80():
    rnd = random.Random(1986)
    D = Dibujo(CAPAS_T80)
    # Torre de la fachada con hueco y palmera (ya estaba en 1986)
    D.r("cuerpo", 170, 214, 80, 48)
    D.r("cuerpo", 170, 262, 20, 38); D.r("cuerpo", 230, 262, 20, 38)
    D.r("cuerpo", 170, 300, 80, 180)
    D.r("sombra", 236, 214, 14, 266)
    D.r("sombra", 190, 262, 40, 3)               # techo del hueco, en sombra
    for x in range(178, 250, 8):
        D.l("linea", x, 214, x, 262); D.l("linea", x, 300, x, 480)
    for x in (178, 186, 238, 246):
        D.l("linea", x, 262, x, 300)
    for y in range(222, 480, 8):
        if 262 <= y <= 300:
            D.l("linea", 170, y, 190, y); D.l("linea", 230, y, 250, y)
        else:
            D.l("linea", 170, y, 250, y)
    for col in (194, 226):
        for y in range(304, 476, 16):
            D.r("acento", col - 3, y + 1, 7, 6)
    for _ in range(14):
        x = rnd.randrange(170, 242, 8)
        y = rnd.choice(list(range(214, 254, 8)) + list(range(300, 472, 8)))
        D.r("ventana", x + 1, y + 1, 6, 6)
    D.r("borde", 170, 212, 80, 2.2)
    D.r("borde", 190, 298, 40, 2)
    D.r("cuerpo", 198, 205, 24, 7); D.r("borde", 198, 205, 24, 1.2)
    # palmera en el hueco
    D.p("palma", "M208.6 300C209.2 292 210.4 286 212.4 280L214 280.4C212.2 286.4 211 292.4 210.6 300z")
    for d in ("M213 280Q205 274 197 277Q205 276.5 213 281z", "M213 280Q221 273 229 276Q221 276 213 281z",
              "M213 280Q207 270 201 268Q208 272 213.4 280.6z", "M213 280Q219 270 226 268Q219 272 212.8 280.6z",
              "M213 280Q206 281 202 288Q207 283 213 281z", "M213 280Q220 281 224 288Q219 283 213 281z"):
        D.p("palma", d)
    # Torre de tres niveles con luces
    D.p("luz1", "M862 480V300H898.3A29.7 29.7 0 0 1 928 329.7V480z")
    D.p("luz2", "M868 480V270H897.7A24.3 24.3 0 0 1 922 294.3V480z")
    D.p("luz3", "M874 480V244H897.1A18.9 18.9 0 0 1 916 262.9V480z")
    for y, a, w in [(250, 874, 23.1), (259, 874, 23.1), (268, 874, 42), (277, 868, 29.7), (286, 868, 29.7), (295, 868, 54)] + \
                   [(y, 862, 36.3 if y < 330 else 66) for y in range(304, 480, 9)]:
        D.r("franja", a, y, w, 1.2)
    D.r("borde", 889, 214, 2, 30)
    D.c("aviso", 890, 213, 2)
    return '<symbol id="torres80" viewBox="0 0 1200 480" preserveAspectRatio="xMidYMax slice">' + D.svg() + "</symbol>"


# ============================================================================================
# Cosas de la playa: caseta de salvavidas y sombrillas
# ============================================================================================

def caseta():
    """Caseta de salvavidas sobre pilotes, con rampa y bandera (forma genérica, pintada con
    franjas como las de las playas de Florida; no copia ninguna caseta real). Base en y=80."""
    D = Dibujo([("sombra", 'fill="var(--palma-sombra)"'),
                ("poste", 'fill="none" stroke="var(--caseta-poste)" stroke-width="2.4" stroke-linecap="round"'),
                ("poste_f", 'fill="none" stroke="var(--caseta-poste)" stroke-width="1.1"'),
                ("c1", 'fill="var(--caseta1)"'), ("c2", 'fill="var(--caseta2)"'),
                ("vidrio", 'fill="var(--caseta-vidrio)"'), ("borde", 'fill="var(--caseta-borde)"'),
                ("neon", 'fill="none" stroke="var(--caseta-borde)" stroke-width="1.2" stroke-linejoin="round"'),
                ("bandera", 'fill="var(--aviso)"')])
    D.p("sombra", "M6 79a30 2.6 0 1 0 60 0a30 2.6 0 1 0 -60 0z")
    for x in (15, 23, 47, 55):
        D.l("poste", x, 47, x, 79)
    D.p("poste_f", "M15 52L23 74M23 52L15 74M47 52L55 74M55 52L47 74")
    D.p("poste", "M58 47L70 78")
    D.p("poste_f", "M60 52.5L57.5 53.5M62.5 59L60 60M65 65.5L62.5 66.5M67.5 72L65 73")
    D.r("borde", 8, 44, 56, 3.6)
    D.p("poste_f", "M9 37H63M9 37V44M18 37V44M27 37V44M45 37V44M54 37V44M63 37V44")
    D.r("c1", 16, 19, 38, 25)
    D.r("c2", 16, 36, 38, 4)
    D.r("vidrio", 23, 24, 24, 9)
    D.l("poste_f", 35, 24, 35, 33)
    D.p("c2", "M11 20Q35 3 59 20z")
    D.p("neon", "M11 20Q35 3 59 20zM16 20V44H54V20")
    D.l("poste_f", 52, 12, 52, 1)
    D.poli("bandera", [(52.5, 1), (62, 3.6), (52.5, 6.4)])
    return '<symbol id="caseta" viewBox="0 0 70 80" preserveAspectRatio="xMidYMax meet">' + D.svg() + "</symbol>"


def sombrilla():
    """Sombrilla de playa a gajos, un poco inclinada. Base en y=44."""
    D = Dibujo([("sombra", 'fill="var(--palma-sombra)"'),
                ("palo", 'fill="none" stroke="var(--caseta-poste)" stroke-width="1.5" stroke-linecap="round"'),
                ("s1", 'fill="var(--sombrilla1)"'), ("s2", 'fill="var(--sombrilla2)"'),
                ("neon", 'fill="none" stroke="var(--caseta-borde)" stroke-width=".9" stroke-linejoin="round"')])
    D.p("sombra", "M4 43.4a17 2 0 1 0 34 0a17 2 0 1 0 -34 0z")
    D.l("palo", 19, 8, 22, 44)
    D.p("s1", "M1 17Q17 -1 37 9Q38 12 36.5 13Q30 12 27 15.4Q22 12.6 17 16.6Q12 14 7 18.4Q3 16.6 1 17z")
    D.p("s2", "M18.6 3.6L12 15.2Q14.6 15.6 17 16.6zM18.6 3.6L27 15.4Q29.6 12.6 32 12.4z")
    D.p("neon", "M1 17Q17 -1 37 9Q38 12 36.5 13Q30 12 27 15.4Q22 12.6 17 16.6Q12 14 7 18.4Q3 16.6 1 17z")
    return '<symbol id="sombrilla" viewBox="0 0 40 44" preserveAspectRatio="xMidYMax meet">' + D.svg() + "</symbol>"


def bloque():
    clip, t26 = torres26()
    partes = [
        INICIO,
        "<!-- Generado por diseno/dibujar_portada.py (rediseño de la portada, 2026-11-17). No editar a mano: cambiar el programa y volver a correrlo. -->",
        palmera("palmera-a", 22, HOJAS_A, 1),
        palmera("palmera-b", -26, HOJAS_B, 2),
        palmera("palmera-c", 16, HOJAS_C, 3),
        "<defs>" + clip + "</defs>",
        torres80(),
        t26,
        Hoteles().todo(),
        caseta(),
        sombrilla(),
        FIN,
    ]
    return "\n  ".join(partes)


def main():
    html = INDEX.read_text(encoding="utf-8")
    if html.count(INICIO) != 1 or html.count(FIN) != 1:
        raise SystemExit(f"Faltan las marcas {INICIO} / {FIN} en {INDEX} (o están repetidas).")
    nuevo = re.sub(re.escape(INICIO) + r".*?" + re.escape(FIN), lambda m: bloque(), html, flags=re.S)
    INDEX.write_text(nuevo, encoding="utf-8", newline="\n")
    tam = len(bloque().encode("utf-8"))
    print(f"Portada escrita en {INDEX.relative_to(RAIZ)} ({tam / 1024:.1f} KB de dibujo).")


if __name__ == "__main__":
    main()
