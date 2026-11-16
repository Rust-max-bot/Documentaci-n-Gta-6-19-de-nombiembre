"""Hace la imagen que se ve al compartir el enlace (web/compartir.jpg, 1200x630; tarea 2.11).

Se dibuja con la portada real de la página (web/index.html), así que queda al día con lo que
haya en ella (por ejemplo, el suelo de la tarea 7.12). Cada mitad es la portada a 600 px:
izquierda "Miami 1986" de noche, derecha "Miami 2026" al atardecer.

    python pruebas/hacer_compartir.py --opcion A            # vista previa en pruebas/capturas/
    python pruebas/hacer_compartir.py --opcion A --guardar  # además escribe web/compartir.jpg

Opciones (2026-11-16, para que Bruno elija):
  A  como la de antes (cada mitad con su título), al día y con el lema más legible.
  B  las dos escenas de fondo y UN solo título grande al centro, con el lema en una franja.
  C  como B, más una línea abajo con las fuentes de los datos. ELEGIDA por Bruno (2026-11-16).
"""
import argparse
import io
import sys

from PIL import Image
from playwright.sync_api import sync_playwright

from navegador import CAPTURAS, PAGINA, RAIZ, abrir, preparar_salida

ANCHO, ALTO = 1200, 630
MITAD = ANCHO // 2

# Lo que no va en una imagen fija: botones, cuenta regresiva, avisos.
OCULTAR = """
.barra, .lugares, .cuenta, #aviso-ejemplo, .menu, main, footer { display: none !important; }
:root { scrollbar-gutter: auto !important; scrollbar-width: none !important; }
html, body { overflow: hidden !important; }
.portada { min-height: 630px !important; height: 630px !important; }
"""
# Lema legible en Miami 1986 (opción A): blanco con borde oscuro y brillo celeste, en vez de
# celeste sobre el brillo rosado del sol (en la vista previa, a ~500 px, casi no se leía).
LEMA_LEGIBLE = """
:root[data-tema="ochenta"] .lema { color: #fff !important; font-size: 30px !important;
  text-shadow: 0 0 2px #0a0420, 0 2px 4px #0a0420, 0 0 16px #00d4ff, 0 0 30px #00a2ff !important; }
:root[data-tema="actual"] .lema { font-size: 30px !important; }
"""
SIN_TITULO = ".titular { visibility: hidden !important; }"
# Para B y C: solo el título, sobre fondo transparente, en una página de 1200 px.
SOLO_TITULO = """
.escena, .portada::before, .portada::after { display: none !important; }
html, body, .portada { background: transparent !important; }
.titular { padding-top: 150px !important; }
h1 { font-size: 132px !important; color: #fff !important; animation: none !important;
  text-shadow: 0 0 6px #fff, 0 0 28px #ff3ea5, 0 0 64px #b3127f, 0 6px 0 #2a0a5a !important; }
.lema { display: inline-block !important; margin-top: 18px !important; padding: 10px 30px !important;
  border-radius: 999px; background: rgba(14, 6, 40, .82); color: #fff !important; font-size: 32px !important;
  letter-spacing: .14em !important; text-transform: uppercase; text-shadow: none !important;
  box-shadow: 0 0 0 2px rgba(255, 62, 165, .7), 0 0 24px rgba(0, 212, 255, .45); }
.fuentes { margin-top: 150px; font: 700 21px/1 var(--f-texto); letter-spacing: .16em; text-transform: uppercase;
  color: #fff; text-shadow: 0 2px 6px #0a0420, 0 0 2px #0a0420; }
"""


def escena(nav, tema, hora, css):
    """Captura la portada a 600x630 en un estilo y una hora del día."""
    pg = nav.new_page(viewport={"width": MITAD, "height": ALTO})
    pg.goto(PAGINA.as_uri())
    pg.wait_for_load_state("networkidle")
    pg.click(f'button[data-poner="{tema}"]')
    pg.click(f'button[data-hora-poner="{hora}"]')
    pg.add_style_tag(content=OCULTAR + css)
    pg.wait_for_timeout(4000)      # las torres de 2026 suben una por una: que terminen
    img = Image.open(io.BytesIO(pg.screenshot())).convert("RGB")
    pg.close()
    return img


def titulo(nav, fuentes):
    pg = nav.new_page(viewport={"width": ANCHO, "height": ALTO})
    pg.goto(PAGINA.as_uri())
    pg.wait_for_load_state("networkidle")
    pg.click('button[data-poner="actual"]')      # la tipografía del título de 2026 se lee en las dos mitades
    pg.add_style_tag(content=OCULTAR + SOLO_TITULO)
    if fuentes:
        pg.evaluate("""() => { const p = document.createElement('p'); p.className = 'fuentes';
            p.textContent = 'Twitch · Kick · YouTube · Google Trends · hora a hora';
            document.querySelector('.titular').appendChild(p); }""")
    pg.wait_for_timeout(2500)
    img = Image.open(io.BytesIO(pg.screenshot(omit_background=True))).convert("RGBA")
    pg.close()
    return img


def hacer(opcion):
    with sync_playwright() as p:
        nav = abrir(p)
        css = LEMA_LEGIBLE if opcion == "A" else SIN_TITULO
        izq, der = escena(nav, "ochenta", "noche", css), escena(nav, "actual", "atardecer", css)
        lienzo = Image.new("RGB", (ANCHO, ALTO))
        lienzo.paste(izq, (0, 0))
        lienzo.paste(der, (MITAD, 0))
        if opcion in ("B", "C"):
            lienzo = Image.alpha_composite(lienzo.convert("RGBA"), titulo(nav, opcion == "C")).convert("RGB")
        nav.close()
    return lienzo


def main():
    preparar_salida()
    ap = argparse.ArgumentParser()
    ap.add_argument("--opcion", choices="ABC", required=True)
    ap.add_argument("--guardar", action="store_true", help="escribe también web/compartir.jpg")
    a = ap.parse_args()
    img = hacer(a.opcion)
    if img.size != (ANCHO, ALTO):
        sys.exit(f"tamaño inesperado: {img.size}")
    prev = CAPTURAS / f"compartir_{a.opcion}.jpg"
    img.save(prev, quality=88)
    print("Vista previa:", prev)
    if a.guardar:
        destino = RAIZ / "web" / "compartir.jpg"
        img.save(destino, quality=88, optimize=True, progressive=True)
        print("Guardada:", destino, f"({destino.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
