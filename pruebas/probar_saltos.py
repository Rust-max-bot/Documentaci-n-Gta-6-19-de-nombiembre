"""Revisa que la página no salte al moverse por ella (tarea 9.4, 2026-11-20).

Nació para probar `content-visibility` (que el navegador no calcule lo que no se ve), que se
descartó: rompía los enlaces con #sección en Edge y el copiar todo en Firefox. Queda como
prueba de que ningún cambio futuro haga saltar la página.

A 1280 y 384 px, en los dos estilos:
  1. Menú "☰ Secciones": va a cada sección y mira que quede arriba de la pantalla (entre -5 y
     90 px) y que siga ahí un segundo después (que no salte).
  2. Enlace a una sección: abre index.html#seccion-noticias y mira que quede arriba.
     (La recarga automática se prueba aparte, en probar_recarga.py.)
  3. Subir de a poco desde el final: mira que lo que está en pantalla no se corra más de 40 px de
     golpe al aparecer las secciones de arriba.

Uso (antes, python recolector/generar_web.py):  python pruebas/probar_saltos.py [--web carpeta]
"""
import argparse
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

from navegador import ANCHOS, ESTILOS, PAGINA, abrir, preparar_salida


def preparar(pg, url, estilo):
    pg.add_init_script(f'try{{localStorage.setItem("tema","{estilo}")}}catch(e){{}}')
    pg.goto(url)
    pg.wait_for_timeout(1500)


def menu(pg, url, estilo):
    fallos = []
    preparar(pg, url, estilo)
    ids = pg.evaluate("[...document.querySelectorAll('#menu-lista [data-ir]')].map(a => a.dataset.ir).filter(x => x !== 'arriba')")
    for i in ids:
        if not pg.evaluate(f"(() => {{ const e = document.getElementById('{i}'); return !!e && !e.hidden; }})()"):
            continue
        pg.evaluate("window.scrollTo(0, 0)")
        pg.wait_for_timeout(200)
        pg.click(".menu-boton")
        pg.wait_for_timeout(600)
        pg.click(f'#menu-lista [data-ir="{i}"]')
        pg.wait_for_timeout(2200)
        a = pg.evaluate(f"document.getElementById('{i}').getBoundingClientRect().top")
        pg.wait_for_timeout(1000)
        b = pg.evaluate(f"document.getElementById('{i}').getBoundingClientRect().top")
        if not (-5 <= a <= 90) or abs(a - b) > 2:
            fallos.append(f"menú → #{i}: quedó a {a:.0f} px y luego a {b:.0f} px")
    return fallos


def ancla(pg, url, estilo):
    """Abrir un enlace a una sección (index.html#seccion-noticias) tiene que dejarla arriba."""
    pg.add_init_script(f'try{{localStorage.setItem("tema","{estilo}")}}catch(e){{}}')
    pg.goto(url + "#seccion-noticias")
    pg.wait_for_timeout(3500)
    top = pg.evaluate("document.getElementById('seccion-noticias').getBoundingClientRect().top")
    return [] if -5 <= top <= 90 else [f"enlace #seccion-noticias: la sección quedó a {top:.0f} px"]


def subir(pg, url, estilo):
    preparar(pg, url, estilo)
    pg.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)")
    pg.wait_for_timeout(1200)
    peor = pg.evaluate("""async () => {
      const espera = ms => new Promise(r => setTimeout(r, ms));
      let peor = 0;
      for (let k = 0; k < 80 && window.scrollY > 0; k++) {
        const y = window.scrollY, vista = innerHeight / 2;
        const el = document.elementFromPoint(innerWidth / 2, vista);
        const t0 = el ? el.getBoundingClientRect().top : 0;
        window.scrollBy(0, -Math.round(innerHeight * 0.6));
        await espera(120);
        const movido = y - window.scrollY;
        const t1 = el && el.isConnected ? el.getBoundingClientRect().top : t0 + movido;
        peor = Math.max(peor, Math.abs((t1 - t0) - movido));
      }
      return peor;
    }""")
    return [f"subir: algo se corrió {peor:.0f} px de golpe"] if peor > 40 else []


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--web", help="otra carpeta con la página en vez de web/")
    a = ap.parse_args()
    preparar_salida()
    url = (Path(a.web) / "index.html").resolve().as_uri() if a.web else PAGINA.as_uri()
    todos = []
    with sync_playwright() as p:
        nav = abrir(p)
        for ancho in ANCHOS:
            for estilo, nombre in ESTILOS:
                fallos = []
                for prueba in (menu, ancla, subir):
                    ctx = nav.new_context(viewport={"width": ancho, "height": 800})
                    fallos += prueba(ctx.new_page(), url, estilo)
                    ctx.close()
                print(("OK   " if not fallos else "FALLO") + f" {ancho}px {nombre}" + "".join("\n      " + f for f in fallos))
                todos += fallos
        nav.close()
    print("RESULTADO: " + ("todo bien" if not todos else f"{len(todos)} fallo(s)"))
    sys.exit(1 if todos else 0)


if __name__ == "__main__":
    main()
